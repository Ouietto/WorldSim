# Asabiya — history engine (v0.5.2)

A browser simulation of peoples, states, faiths and technologies on a world map, from 9000 BCE onward. It blends cliodynamics (Turchin's asabiya and structural-demographic theory), World3-style carrying capacity, and ecological history. The default map is the real Earth.

## Run it
Open `asabiya.html` in a browser. It is fully self-contained (Earth elevation and Köppen climate data are inlined). Each visit picks a random history seed; `#seed-123` in the URL replays one.

## Source layout (`src/`)
| File | What it is |
|---|---|
| `world.js` | Constants, parameters (sliders), Earth decoding, climate model and grading against Köppen, world generation |
| `lang.js` | Sound families and naming (places, peoples, rulers) |
| `hist.js` | The history engine: population, technology, disease, states, wars, faiths, migrations, ecology, records |
| `ui.js` | Map rendering, encyclopedia pages, chronicle, charts, checks, setup |
| `shell.html` | Page markup and CSS |
| `earth_elev.b64`, `koppen.b64` | Earth elevation (1600×800, delta-coded, zlib) and Köppen-Geiger classes (Beck et al. 2018) |
| `build.py` | Concatenates everything into `../asabiya.html` |

Edit files in `src/`, then run `python3 build.py` (from inside `src/`) to rebuild the page.

## Headless tools (Node 18+, run from `src/`)
- `node test.js earth <seed> <endYear>`: one Earth run with a summary (set `SHOW=war` etc. to print chronicle entries).
- `node batch.js 1,2,3 1500`: several seeds, one JSON line each with calibration metrics (first states by region, China/Mediterranean unity, technology dates, empire shapes, stateless regions). `ECO=0` sets the ecological-reach parameter.
- `node diag.js <seed> <year>`: instability components and top states every 500 years.
- `node slice.js <year>`: timing of the per-year slices.
- `node shapes.js <seed> <year>`: the largest empires' east-west vs north-south extent.
- `node prof5.js <fromYear> <toYear>`: per-function time profile.

A full run to 1500 CE takes about 4–6 minutes.

## Status and plans
`PLAN.md` has the design notes for every version, the sources the model draws on, known problems (the Earth climate model is too wet in continental interiors, which inflates Bronze Age states there), and the roadmap.
