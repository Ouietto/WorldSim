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

## Our own climate model (`climate.js`)

A simplified planetary climate model, written for this project from standard textbook methods. No third-party model code is used. It runs on a 200 × 100 grid (1.8°) and is interpolated to the map, with temperature corrected for altitude.

1. **Sunlight:** daily-mean insolation by latitude and month, from the orbit (eccentricity, axial tilt, longitude of perihelion), following Berger (1978).
2. **Energy balance:**
   - Each cell's temperature balances absorbed sunlight against outgoing radiation, OLR = A + B·T (Budyko 1969; Sellers 1969; North & Coakley 1979).
   - Land and ocean have different heat capacities, so seasons and continental extremes emerge.
   - Zonal-mean meridional heat diffusion is solved implicitly (North 1975). There is also local mixing toward the latitude mean, and prevailing winds carry ocean temperatures inland.
   - Albedo responds to sea ice, snow, land cover and tropical cloud.
3. **Pressure and winds:**
   - Sea-level pressure combines an equatorial trough that follows the moist thermal equator, subtropical highs, subpolar lows, and thermal highs and lows over cold and hot land.
   - Surface wind blows down the pressure gradient, turned by the Coriolis force (with about 30° of friction), plus easterly momentum in the deep tropics.
4. **Moisture and rain:**
   - Oceans keep the air near a humidity set by temperature (Clausius–Clapeyron).
   - Moisture is carried by semi-Lagrangian advection in daily steps.
   - Rain falls where air converges or climbs slopes, along mid-latitude storm tracks, and from tropical convection. It is suppressed under sinking air and near cold-current coasts.
   - Land returns part of its rain to the air.
5. **Biomes:** Whittaker-style potential vegetation from temperature, rainfall, seasonality, dry months and altitude, using the Köppen aridity threshold.

**Grading against NOAA normals** (`node tools/climgrade.js` and `node tools/raingrade.js`, with `tune` for coordinate-descent fitting):
- Annual land temperature is off by about 3.5 °C on average.
- Annual rainfall is off by a factor of about 2.6 in typical cells.
- About 60% of land falls in the right Köppen group.
- Its known weaknesses at this resolution are narrow tropical rain belts (they shift where the real belt widens), weak South Asian monsoon rain, and some excess rain on subtropical west coasts.

**How it is used:**
- **Invented worlds** use the model directly.
- **On Earth**, the measured normals remain the baseline. Every 250 simulated years, or sooner when CO₂ changes by more than 4 ppm, the history engine re-solves the model with that era's orbit and greenhouse gases, and adds only the model's *change* from the present-day reference run. The changes are smoothed, and drying is damped to 40% because of the rain-belt bias above.
- **Greenhouse gases** come from the simulation:
  - Forest carbon released by clearing raises CO₂, and the ocean takes the excess back over about 450 years.
  - Rice paddies and herds raise methane.
  - Cleared land and fields change albedo.
- `tools/orbtest.js` compares rainfall between two dates. With today's settings the Sahara is roughly 50% wetter at 7000 BCE than today, from orbital precession alone.
