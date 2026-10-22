# Numerical climate data

The default Earth asset uses the **1981–2010 modern land climatology** hosted
by NOAA PSL: GPCC Full Data Reanalysis V2020 monthly precipitation totals at
1 degree, and GHCN-CAMS monthly 2 m temperature at 0.5 degree sampled at
1 degree. It fixes the synthetic model's wet continental interiors using
measurements, rather than changing values merely to match climate classes.

- [GPCC numerical data and units](https://psl.noaa.gov/thredds/dodsC/Datasets/gpcc/full_v2020/precip.mon.ltm.1x1.v2020.1981-2010.nc.html)
- [GHCN-CAMS documentation](https://psl.noaa.gov/data/gridded/data.ghcncams.html)
- Exact download URLs, processing notes and response SHA-256 hashes are in
  `earth_climate.sources.json`.

`prepare_climate.py` rebuilds `earth_climate.b64` from the numerical OPeNDAP
responses, using Python and NumPy. It caches downloads in `.climate-cache/`.
The asset is a zlib-compressed, base64-encoded UTF-8 JSON document. The loader
inflates it and passes the bytes as the optional third `decodeEarth` argument.
That registers the baseline for `genWorld({earth:true,...})`. Two-argument
`decodeEarth` remains compatible with older callers, which use synthetic climate.

Temperature is day-weighted over the twelve months; precipitation is summed;
temperature range is the warmest minus coldest monthly mean. Temperature is
bilinearly sampled onto the precipitation grid and available land neighbours
are renormalized. Runtime interpolation also renormalizes missing neighbours;
where no measurements are available the synthetic model remains in use.
Observed numeric values bypass forced Köppen fitting. The old synthetic climate
and its raw diagnostic arrays remain available for generated worlds/calibration.

This is **not a palaeoclimate reconstruction**: Sahara conditions around 9000
BCE, sea levels, glacier coverage and Holocene shifts are not reconstructed by
modern normals. One-degree fields smooth mountains, rain shadows, coasts and
small islands. Annual summaries cannot capture exact crop calendars. Rain
seasonality and growing-month summaries are supplied when the source contains
monthly data. Existing epoch/weather mechanisms operate on top of this baseline.

No Climate Lab model code was recovered or used. A framed colour-map PNG is
not a numerical export and cannot safely be read as temperature or rainfall.
Climate Lab or other model outputs can be converted to the exchange format
below only when numeric values, coordinate conventions and units are known.

## Import format

Pass JSON text or an object to `parseClimate`, then provide the result as
`genWorld({height, climate: parsed, ...})`. Grid coordinates identify **cell
centres**, not corners. Only a complete, regular geographic latitude/longitude
grid is accepted. `width * dx` must equal 360; `height * abs(dy)` must equal 180.
`dx` is positive; `dy` can be negative (north first) or positive (south first).
Longitude wraps; `lon0` may use either the -180…180 or 0…360 convention.
There may be at most 2,000,000 grid cells.

```json
{
  "format": "asabiya-climate-v1",
  "grid": {
    "width": 4, "height": 2,
    "lon0": -135, "lat0": 45,
    "dx": 90, "dy": -90, "wrap": true
  },
  "period": "annual",
  "units": {"temperature": "degC", "precipitation": "mm/year"},
  "noData": null,
  "temperature": [5, 10, 15, 20, 25, 20, 15, null],
  "precipitation": [300, 500, 800, 1000, 1500, 900, 600, null],
  "temperatureRange": [20, 15, 10, 5, 5, 10, 15, null],
  "metadata": {"label": "My numerical climate model", "period": "model year 100"}
}
```

- Arrays are row-major, west to east within each latitude row. Every annual
  array has exactly `width * height` entries.
- Temperature units must be `degC` or `K`. Annual precipitation must be
  `mm/year`. Optional annual `temperatureRange` is a **temperature difference**
  in degrees C/K and is never shifted by 273.15. If omitted, synthetic seasonal
  temperature range is retained; an annual mean cannot establish a seasonal range.
- For `period: "monthly"`, use twelve grids in **January–December order**:
  either twelve row-major arrays or one flattened month-major array containing
  `12 * width * height` entries. Precipitation units must be `mm/month` (monthly
  totals) or `mm/day` (monthly mean daily rate). Temperature is monthly mean.
  Conversion uses a fixed 365-day calendar with February at 28 days.
- `noData` must explicitly name a finite sentinel number or `null`. Missing
  cells fall back to synthetic climate; they are never treated as zero rainfall.
  NaN, Infinity, strings, mismatched grids, unsupported units and impossible
  ranges produce an error before the world is replaced.
- Optional annual `rainSeasonality` (normalized Walsh-Lawler index, 0–1),
  `dryMonths` (monthly precipitation below 30 mm, 0–12) and `growingMonths`
  (monthly temperature at least 6°C, 0–12) may be supplied. Monthly imports
  derive these. They appear on the world at simulation resolution. Missing
  summaries are NaN; consuming code must check `Number.isFinite`.
- `climateMeta.coverage` is the fraction of the full display grid receiving
  measurements, including ocean. It is not a land coverage or accuracy score.

Run `node src/climate.test.js` from the project directory for unit conversion,
grid orientation, missing-data, validation and Earth regional sanity checks.
