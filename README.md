# Asabiya — history engine (v0.6.5: horses, herds and the steppe)

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
> v0.6.5 adds:
> - **Fields and pasture** (`src/herds.js`): each province mixes farming and herding by what pays, the people's herding tradition, raids and what its rulers want. Courts can split between steppe lords and landlords.
> - **Real herds:** horses, two kinds of camel, reindeer and llamas are tamed where their wild ancestors lived, spread with herders and trade, and die off in hard winters. No horses reach the Americas before ships.
> - **Riders and confederations:** riding skill and war experience belong to peoples and are inherited by states. Winning khans draw in other clans; beaten coalitions flee onto their neighbours.
> - **Grass turf:** dense grassland turf is broken only slowly before heavy ploughs, so steppe provinces stay herding land.
> - **Crops:** each crop has a latitude band that widens slowly where it is grown. Farmers pass on only crops they can grow; seed that is merely carried travels ten times slower.
> - **Cities and writing:**
>   - Towns of 25,000 count as cities even in sparse provinces; canals, trade, storable grain and walls draw people into them.
>   - Writing grows from the accounts of those cities.
> - **Irrigation and salt:** irrigation is invented where it is needed, in dry river valleys. Salt builds with intensive every-year cropping, not from the first canal.
> - **Disease:** clearing warm forests can release new diseases; malaria rises with tropical clearing and falls with regrowth.
> - **Climate fix:** history now measures climate change against a reference with the same vegetation albedo. This removes a false +1 °C warming that had made Bronze Age deserts and the steppe too wet.
> - **Interface:**
>   - Herds and Fields-and-pasture map layers.
>   - A Cities filter on the map.
>   - Steppe-and-sown and way-of-life sections on state and people pages.
>   - Map import higher in Setup; sidebar tabs that wrap.
> - **Model check on GitHub Actions** (`.github/workflows/ensemble.yml`): 16 histories in about 6 minutes. 50% of 27 targets are in band, against 37% for v0.6.4.
>
> v0.6.4 adds:
> - **Crop packages** (`src/crops.js`): wheat and barley, rice, millet, sorghum, maize-beans-squash, potatoes and quinoa, yams and taro, the eastern North American crops, and cassava. Each has a climate niche, a yield, how well it stores, how easily it can be taxed, and how hard it is on the soil. Packages spread with farmers; each farm grows the best one that has reached it. Ocean contact exchanges them.
> - **Processing and hand intensification:** freeze-dried potatoes (chuño) make Andean potatoes storable and taxable; lime-soaked maize feeds better; terraces and raised fields are invented independently wherever crowded farmers work slopes or wetlands.
> - **Soil types** from climate and terrain (river silt, black earth, volcanic highland soils, acid forest soils, leached tropical soils, heavy clays, desert and mountain soils). They set fertility, how fast farming wears them out, salt risk and erosion. Steppe black earth is hard to farm until heavy ploughs. Farm suitability follows climate change.
> - **A labour-tax route to the state:** storable staples, dense farming and irrigation let chiefs organize corvée without metal or horses.
> - **Malaria** is absent from the Americas until ships bring it. **West African iron** has its own hearth (Nok, about 700 BCE).
> - **Fixes:** BCE years skipped every pass scheduled on a non-zero remainder (JavaScript's negative `%`), so disease pools, caravan routes and the crop pass never ran before 1 CE. The regional check now counts leagues and overlords' blocs, and the largest state is reported apart from nomad confederations.
> - **Map layers:** Staple crops, Soil types.
>
> v0.6.3 adds:
> - **An ensemble check** (`tools/ensemble.js`, see `tools/VALIDATION.md`): runs many Earth histories in parallel, scores them against 25 historical targets (first states, inventions, population, empire sizes, stateless regions), and compares versions seed by seed.
> - **About twice as fast** in the browser (1.6× in Node), with identical results: per-cell arrays are read through local variables in the hot loops, and the climate re-solve no longer freezes the page for over a second.
>
> v0.6.2 adds:
> - **Sacked cities:** captured cities may be plundered (more often by nomads and by armies of another faith); people die or flee to the nearest province of their own state and people, forts are wrecked, and nomads damage irrigation.
> - **Supplied sieges:** attacks on walls, capitals and cities depend on food near the attacker's front, rivers, roads and granaries.
> - **Readiness for war:** armies grow sharp in war and slacken in long peace; forts and recent raids keep them up.
> - **Mercenaries:** states with coin, money and low cohesion hire soldiers in war; unpaid mercenaries mutiny.
> - **Paying for peace:** rich states raided by strong nomads may buy peace with yearly gifts, until they grow strong or go broke.
> - **Granaries:** literate states store grain in good years and draw on it in droughts.
> - **Interface:** quick map buttons plus a grouped Map menu, a clickable Largest state, and pinch zoom on touch screens.
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
