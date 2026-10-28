# Asabiya — history engine (v0.6.1: paths of invention)

> **This branch** rebuilds on the v0.5.2 model and adds:
> - **Measured Earth climate:** NOAA-hosted GPCC/GHCN-CAMS 1981–2010 normals (`src/earth_climate.b64`, see `src/CLIMATE.md`).
> - **Our own climate model** (`src/climate.js`):
>   - orbital sunlight, a seasonal energy balance, and pressure-driven winds with monsoons
>   - moisture transport and rain, and biomes
>   - Graded against the NOAA normals by `tools/climgrade.js` and `tools/raingrade.js`.
> - **A changing climate:** the history re-solves the climate every 250 years as the orbit drifts and as forest clearing, rice and herds change CO₂ and methane.
> - **A Climate tab** and five new map layers: Temperature, Rainfall, Winds, Biomes, Climate change.
> - **Map drawing:** borders traced on terrain-aware sub-cells, crisp coasts and smooth rivers.
>
> v0.6.1 adds:
> - **A technology matrix** (`src/tech.js`): every technique sits in a grid of purpose (food, movement, information, power, materials, health, war, organization) × phenomenon harnessed (muscle, water, wind, fire, living things, signs, mechanism), tiers 1–4.
>   - New techniques combine what a society already masters in that row and column, outside the cell itself (W. Brian Arthur, *The Nature of Technology*).
>   - Where invention happens depends on land and resources, the traditions each people carries (inherited and blended by migration), and what a state needs; population and wealth set the speed.
>   - Empty cells hold might-have-been techniques, created only when a society invents one, named in its own language with a plain description underneath.
>   - **Pull of our history** (Setup → Ideas & faith) sets how often that happens; invented worlds cap it at 0.45. A state that takes one phenomenon far beyond our history enters an alternate age.
>   - Real water mills and windmills join the list.
> - **A Technology tab** (the matrix, technique pages, each state's land, traditions and pressures) and a **Paths of invention** map layer.
> - **Migrant pockets:** migrations leave small settlements along their route and scatter into several when they break up. **Seasonal pastures:** herders who can move between uplands and lowlands, or desert edge and wetter grass, feed more animals.
> - **Soldier colonies and hereditary lords** (`src/society.js`): states settle soldiers on new frontiers, which holds and pushes them; land held for service becomes land held by birth, which protects provinces but keeps revenue; rulers try to take it back. **Lords** map layer.
> - **City-states, leagues and daughter colonies:** walled cities stand as small states, band together in leagues with their kin, and crowded coastal cities found daughter cities overseas.
>
> The v0.7–v0.12 accounting models are kept on `main` and `codex/v12-paused`.

# Asabiya — history engine (v0.7)

A browser simulation of peoples, states, faiths and technologies on a world map, from 9000 BCE onward. It blends cliodynamics (Turchin's asabiya and structural-demographic theory), World3-style carrying capacity, and ecological history. The default map is the real Earth.

Version 0.7 adds real transport-animal stocks, directional river and coastal
communication, city states and leagues, conquest obligations, preparedness,
clan coalitions, local elite bargains and migrant settlement agreements.
The map can show capitals, major cities, all cities or no cities, with names
controlled separately.

Version 0.6 introduced food budgets, costly settlement, finite armies and fleets,
non-state warfare, political coalitions, maintained administration, succession
procedures and gradual institutional breakdown. See [MODEL.md](MODEL.md) for
the rules, tradeoffs and remaining limitations.

Earth now uses numerical NOAA-hosted rainfall and temperature normals. These
are a modern spatial baseline, with the existing historical anomalies added;
they are not a reconstructed Holocene climate. Numerical climate imports and
data provenance are documented in [src/CLIMATE.md](src/CLIMATE.md). No Climate
Lab algorithms were recovered or copied.

## Run it
Play at [WorldSim on GitHub Pages](https://ouietto.github.io/WorldSim/), or open
`index.html` or `asabiya.html` in a modern browser. Both files contain the same
simulator, including the Earth elevation and climate data. No server or account
is needed to play; Google Fonts are optional and have local fallbacks. Each visit
picks a random history seed; `#seed-123` in the URL replays one.

## GitHub Pages

The Pages workflow builds the site from `src/`, runs the focused simulation
checks, then publishes only `index.html`, `asabiya.html` and `.nojekyll`.
In the repository's **Settings → Pages**, select **GitHub Actions** as the
source. Pushes to `main` then rebuild and publish automatically; the workflow
can also be run manually from the Actions tab. The simulator works under the
`/WorldSim/` project path, including shared seed links.

To build locally, run `python src/build.py`. To prepare a separate static
hosting folder, run `python src/build.py --output-dir _site`. The checked-in
root pages also support Pages' **Deploy from a branch → main → /(root)** mode.
Rebuild them after source edits when using that mode.

## Source layout (`src/`)
| File | What it is |
|---|---|
| `world.js` | Constants, parameters (sliders), Earth decoding, climate model and grading against Köppen, world generation |
| `lang.js` | Sound families and naming (places, peoples, rulers) |
| `hist.js` | The history engine: population, technology, disease, states, wars, faiths, migrations, ecology, records |
| `society.js` | Food and transport, settlement, community organization, finite forces, coalitions, administration and institutional inheritance |
| `dynamics.js` | Transport animals, communication and supply routes, civic identities, readiness, clan coalitions, elite bargains and migrant agreements |
| `ui.js` | Map rendering, encyclopedia pages, chronicle, charts, checks, setup |
| `shell.html` | Page markup and CSS |
| `earth_elev.b64`, `koppen.b64` | Earth elevation (1600×800, delta-coded, zlib) and Köppen-Geiger classes (Beck et al. 2018) |
| `earth_climate.b64` | Compressed numerical GPCC precipitation and GHCN-CAMS temperature normals, 1981–2010 |
| `build.py` | Builds identical `../index.html` and `../asabiya.html` pages, or a separate hosting folder |

Edit files in `src/`, then run `python src/build.py` from the project root to rebuild both pages.

## Headless tools (Node 18+, run from `src/`)
- `node climate.test.js`: numerical grid, unit conversion, data validation and Earth rainfall checks.
- `node dynamics.test.js`: animal and food conservation, directed rivers and crossings, frontier transport, city states, succession, peace and preparedness, clans, learning, elite defection, migrant agreements, and actual city-filter logic.
- `node society.test.js`: conservation, settlement, warfare, refugees, inheritance, collapse, deterministic replay and a 220-year political scenario.
- `node generated.test.js`: a 250-year developed-world scenario on generated terrain, including coasts and river routes.
- `node verify.js 23 1500`: an Earth history with periodic finite-value, nonnegative-stock and food-ledger assertions.
- `node test.js earth <seed> <endYear>`: one Earth run with a summary (set `SHOW=war` etc. to print chronicle entries).
- `node batch.js 1,2,3 1500`: several seeds, one JSON line each with calibration metrics (first states by region, China/Mediterranean unity, technology dates, empire shapes, stateless regions). `ECO=0` sets the ecological-reach parameter.
- `node diag.js <seed> <year>`: instability components and top states every 500 years.
- `node slice.js <year>`: timing of the per-year slices.
- `node shapes.js <seed> <year>`: the largest empires' east-west vs north-south extent.
- `node prof5.js <fromYear> <toYear>`: per-function time profile.

A full run to 1500 CE can take several minutes; the new material economy adds work
per year. The browser still divides years into slices and supports pausing.

## Status and plans
`PLAN.md` preserves the earlier design history. `MODEL.md` describes the current
mechanics. Historical distributions and dates still need broader ensemble
calibration; passing conservation and scenario tests does not validate a theory
of state formation.
