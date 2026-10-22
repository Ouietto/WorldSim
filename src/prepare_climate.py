"""Rebuild the small Earth baseline from NOAA PSL numerical climatologies.

Requires NumPy. The two OPeNDAP text responses are cached locally; no account,
API key, NetCDF library, image colours or inferred climate classes are used.
"""
import argparse
import base64
import hashlib
import json
import pathlib
import re
import urllib.request
import zlib

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent
SOURCES = {
    "gpcc": "https://psl.noaa.gov/thredds/dodsC/Datasets/gpcc/full_v2020/precip.mon.ltm.1x1.v2020.1981-2010.nc.ascii?precip[0:1:11][0:1:179][0:1:359]",
    "ghcncams": "https://psl.noaa.gov/thredds/dodsC/Datasets/ghcncams/Derived/air.mon.ltm.1981-2010.nc.ascii?air[0:1:11][0:2:359][0:2:719]",
}


def read_ascii(path, variable):
    text = path.read_text()
    rows = re.findall(r"^\[\d+\]\[\d+\], (.+)$", text, re.M)
    if len(rows) != 12 * 180:
        raise ValueError(f"{path.name}: expected 2160 monthly latitude rows, got {len(rows)}")
    array = np.array([np.fromstring(row, sep=",") for row in rows]).reshape(12, 180, 360)
    array[(array < -1e10) | ~np.isfinite(array)] = np.nan
    axes = []
    for name, size in [("lat", 180), ("lon", 360)]:
        match = re.search(rf"{variable}\.{name}\[{size}\]\n([^\n]+)", text)
        if not match:
            raise ValueError(f"{path.name}: missing {name} coordinates")
        axis = np.fromstring(match[1], sep=",")
        if len(axis) != size:
            raise ValueError(f"{path.name}: incorrect {name} coordinate count")
        axes.append(axis)
    if np.any(np.diff(axes[0]) != -1) or np.any(np.diff(axes[1]) != 1):
        raise ValueError("Expected one-degree, north-to-south NOAA grids")
    return array, *axes


def sample(array, lat0, lon0, target_lat, target_lon):
    """Bilinear interpolation, renormalizing over available land observations."""
    gy = np.clip(lat0 - target_lat, 0, array.shape[1] - 1)
    gx = (target_lon - lon0) % 360
    y0, x0 = np.floor(gy).astype(int), np.floor(gx).astype(int)
    fy, fx = gy - y0, gx - x0
    result = np.zeros((12, len(target_lat), len(target_lon)))
    weights = np.zeros_like(result)
    for iy, wy in [(y0, 1 - fy), (np.minimum(y0 + 1, 179), fy)]:
        for ix, wx in [(x0, 1 - fx), ((x0 + 1) % 360, fx)]:
            values = array[:, iy[:, None], ix[None, :]]
            valid = np.isfinite(values)
            weight = wy[:, None] * wx[None, :]
            result += np.where(valid, values, 0) * weight
            weights += valid * weight
    return np.divide(result, weights, out=np.full_like(result, np.nan), where=weights > 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=pathlib.Path, default=ROOT / ".climate-cache")
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    hashes = {}
    for name, url in SOURCES.items():
        path = args.cache / (name + ".txt")
        if not path.exists():
            request = urllib.request.Request(url, headers={"User-Agent": "Asabiya-climate-baseline/1"})
            with urllib.request.urlopen(request, timeout=90) as response:
                path.write_bytes(response.read())
        hashes[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    precip, plat, plon = read_ascii(args.cache / "gpcc.txt", "precip")
    temperature, tlat, tlon = read_ascii(args.cache / "ghcncams.txt", "air")
    # GHCN-CAMS stores kelvin. GPCC stores monthly precipitation totals in mm.
    temperature -= 273.15
    target_lon = np.arange(-179.5, 180, 1)
    temperature = sample(temperature, tlat[0], tlon[0], plat, target_lon)
    precip = np.roll(precip, 180, axis=2)
    valid = np.isfinite(temperature).all(axis=0) & np.isfinite(precip).all(axis=0)
    days = np.array([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])[:, None, None]
    annual_t = (temperature * days).sum(axis=0) / 365
    annual_p = precip.sum(axis=0)
    amplitude = temperature.max(axis=0) - temperature.min(axis=0)
    seasonality = np.abs(precip - annual_p[None] / 12).sum(axis=0) / np.maximum(annual_p, 1)
    # Walsh-Lawler index normalized to [0,1]; all rain in one month gives 1.
    seasonality /= 22 / 12
    dry = (precip < 30).sum(axis=0)
    growing = (temperature >= 6).sum(axis=0)

    def flatten(array, decimals):
        return [round(float(v), decimals) if ok else None for v, ok in zip(array.flat, valid.flat)]

    data = {
        "format": "asabiya-climate-v1",
        "grid": {"width": 360, "height": 180, "lon0": -179.5, "lat0": 89.5, "dx": 1, "dy": -1, "wrap": True},
        "period": "annual",
        "units": {"temperature": "degC", "precipitation": "mm/year"},
        "noData": None,
        "temperature": flatten(annual_t, 2),
        "precipitation": flatten(annual_p, 1),
        "temperatureRange": flatten(amplitude, 2),
        "rainSeasonality": flatten(seasonality, 3),
        "dryMonths": flatten(dry, 0),
        "growingMonths": flatten(growing, 0),
        "metadata": {
            "label": "NOAA PSL 1981–2010 land climatology",
            "sources": ["GPCC Full Data Reanalysis V2020, monthly precipitation totals, 1 degree", "GHCN-CAMS monthly 2 m temperature, 0.5 degree sampled at 1 degree"],
            "urls": SOURCES,
            "sha256": hashes,
            "period": "1981–2010",
            "processing": "Temperature bilinearly sampled onto GPCC centres, masked land neighbours renormalized; day-weighted annual temperature; summed monthly precipitation; monthly max-minus-min temperature range.",
            "limitations": "Modern spatial baseline, not a Holocene reconstruction. One-degree data smooth mountains and small islands. Missing cells retain the synthetic model. No Climate Lab model code was used.",
        },
    }
    packed = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode()
    output = ROOT / "earth_climate.b64"
    output.write_text(base64.b64encode(zlib.compress(packed, 9)).decode() + "\n", encoding="ascii")
    (ROOT / "earth_climate.sources.json").write_text(json.dumps(data["metadata"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{output.name}: {output.stat().st_size:,} bytes; {int(valid.sum()):,} observed land cells")
    for label, latitude, longitude in [("Sahara", 25.5, 15.5), ("Arabia", 24.5, 45.5), ("Tarim", 39.5, 83.5), ("Mongolia", 46.5, 103.5), ("Amazon", -3.5, -60.5)]:
        y, x = round(89.5 - latitude), round(longitude + 179.5)
        print(f"{label}: {annual_t[y,x]:.1f} C; {annual_p[y,x]:.0f} mm/year")


if __name__ == "__main__":
    main()
