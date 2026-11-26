# Asabiya: handoff for the next chat (updated 2026-11-24)

Start here. The full history of decisions and every batch result up to run 111 is in the claude.ai project doc
`claude/society-sim-plan.md` (not in this repo); run 112 and later are recorded below. The code audit is the project doc
`claude/code-audit.md`. **This repo copy (docs/handoff.md) is now the master: keep it updated.** This page is the
compressed version: where things are, how to work, what is done, what is next.

## Where things are

- Repo **Ouietto/WorldSim**, working branch **`claude/rebuild-from-v052`** (last commit see git log; runs 126-149 scored, no batch
  running; best region set-up by error: `SW=nowinrain,noardfal,works,rise,nojudge KV=wbuild:0.5` (run 142, error 2.16); with
  `corrupt` added, turnover 4 realms in Mesopotamia and Egypt at error 2.22 (run 143); next: corruption phase 2 (intelligence)
  per `claude/corruption-plan.md`; step 4d (six pieces), the NaN fix, threat cohesion (not adopted), old regime vs upstarts, the newborn-tax bug and
  rebels holding what rose done; next: what makes a successor snowball, then trade ties and dynastic kinship, with Nein;
  default region fingerprint now 2e9870aeb792 (seed 1 at 2500 BCE) after the NaN and newborn-tax fixes). Clone at
  `/home/claude/worldsim` (attach with push access first). Build: `python3 src/build.py` (writes index.html; warns about code
  hidden behind end-of-line comments).
- Test link: https://ouietto.github.io/WorldSim/try/current/ (build of 13 Nov, branch commit 69c7bf8: steppe, frontier
  horsemen, deals, roads, three clocks, audit fixes; not yet mobility, supply lines or the land changes).
- Simulation code: `src/hist.js` (main loop, politics, war, growth, techniques), `society.js` (deals, frontier horsemen,
  portions, saddle and court, rally), `herds.js` (herds, riding, mounted skill), `crops.js`, `tech.js`, `world.js` (land,
  climate fields, switches and knobs), `provinces.js`. Interface: `ui.js`, `shell.html`.

## Standing rules (Nein's)

- Push only to `claude/` branches. Update `main` only for the test build under `/try/current/` (worktree of origin/main,
  copy index.html to try/current/index.html, commit, push HEAD:main).
- Commit messages end with the Co-Authored-By and Claude-Session lines the session gives.
- Never `git reset --hard` (revert instead). Commit and push before ending a turn; no untracked or modified files left.
- Never kill processes by a pattern that can match your own command line; kill by PID. No foreground long sleeps; use
  background runs and until-loops. Don't launch probes with `( & )` or a bare `&`.
- Use `ymod` for remainders of negative years.
- Keep personal information out. Don't reverse-engineer World Climate Lab.
- Concise, sourced writing. Nein dismisses fixes that don't address observable behaviour.
- Untrusted downloads in their own folder; Python on them with `-I`.
- Pushing a change to `tools/ensemble-request.json` starts a batch and cancels any running batch on the branch.
- Working style: talk designs through with Nein first, then build when he says go; every feature has an off switch
  (`SW=no…`), strengths are knobs (`KV=name:value`); nothing hardcoded; everything should flow from incentives and
  material conditions, not labels or calendars.

## How to test

- **Batch:** edit `tools/ensemble-request.json` (`seeds "1-24"`, `end 1500`, `per 4`, `variants [{name, env}]`, first is
  the base; env like `"WORLD=prov SW=nolandvar KV=mob:0.5"`), commit, push. About 1.5–2.5 hours. Results land on branch
  `ensemble-results`. Score: worktree at the batch's commit, extract `git archive origin/ensemble-results cache` into
  `reports/`, then `timeout 280 node tools/ensemble.js --variants tools/ensemble-request.json --seeds 1-24` (always with
  `timeout`: missing cache entries make it simulate locally). If collection fails, rerun failed jobs with gh api.
- **Smoke test before every batch:** `node tools/smoke.js --seeds 1,2 --end -1000` (about 22 minutes; fails if a
  switched-on feature never fires). Batch results also list rare events that never happened in the base.
- **Single runs:** `WORLD=prov node tools/run1.js <seed> <endYear>` prints JSON with `ev` (rare events), `time.pass`
  (seconds per pass), `chk` (world fingerprint). One history to 1 CE takes about 25 minutes on the 2-core machine.
- **World-only probes** (seconds, not minutes): eval the src files as `run1.js` does, build the world with `genWorld` and
  `provinceWorld`, and call `newHistory` only if init-time fields (sod, soils) are needed. Grid coordinates for `uAtF(x,y)`:
  x = (lon + 180)/360 × W, y = (90 − lat)/180 × H.
- **Saved starts:** `SNAP_AT=<year> SNAP_OUT=<file>` saves a history (about 56 MB); `SNAP_IN=<file>` resumes it exactly.
  `node tools/snaptest.js <seed> <saveYear> <endYear>` checks that a resumed run gives the same output as an unbroken one
  (the smoke test runs it; state kept outside S, WD, TECH or run1's records would break it). In the region, about 85% of a
  run's time is before 3000 BCE. Not yet used by the batch workflow.
- **Random streams (86285219):** each pass reseeds its draws each year (`rsd(tag)`), and the big loops per province, realm, war
  or migration (`rk(key)`), from seed, pass, year and place. Any new pass that draws should call `rsd('name')` first in
  `stepG`, and any new per-province loop `rk(i)`. `SW=nostreams` is the old single stream (fingerprint 909f08663325 at 7000
  BCE, seed 1, full world, no switches); with streams the same run gives 5c951f093dca.
- **Fingerprints** (`WORLD=prov node tools/run1.js 1 -7000`, no SW): 5c951f093dca since 86285219.
- Single seeds mislead (histories are chaotic); judge by batches. Probes (regional readouts) are for diagnosis only.

## Pitfalls that cost batches this month

- A comment placed mid-line hides the rest of that line (switched off frontier raids for two batches). The build now warns.
- A new function with the same name as an old one silently replaces it (frontierPass).
- Passes run on fixed years of the decade; a yearly rate inside a decade pass is ten times too slow, and an
  "every tenth year" gate inside it may never open.
- A shared fallback stamp between decisions starved one of them (deals).
- A per-step penalty on a smoothed gradient is diluted over many small steps (front waits on crops, below).

## Testing tools built 2026-11-23 (the plan agreed with Nein)

- **Continuous error** (ensemble.js): distance from the real value in half-bands on the side a history falls (0 exact, 1 at the
  band's edge, capped at 5, never = 5); shown per target (`e1.6`) and per variant with its paired noise.
- **Fertile Crescent scorecard** (targets.js, measured in run1.js): Akkad pattern (⅔ of Mesopotamia under one realm, 2300 BCE,
  band 2700–1750), Levant ⅓ lasting (New Kingdom 1450, 2400–1200), central Anatolia ⅓ lasting (Hittites 1650, 1900–1400), Aegean
  first lasting states (Cretan palaces 1950, 2300–1600), Aegean divided until Macedon (338, 500–300), Assyrian pattern
  (Mesopotamia and the Levant under one realm, 740, 1200–600), Persian pattern (Egypt + Mesopotamia + Iran, 525, 700–330),
  Egypt's people 1.6M at 2500 (1.0–2.5) and 2.9M at 1250 (1.9–4.4) (Butzer 1976), Uruk 40k at 3000 (15–100k, Algaze 2008).
  Sources: Van De Mieroop 2016, Kuhrt 1995, Bryce 2005. Bands proposed to Nein for review. Colonies not yet measurable.
- **Random streams, saved-start check, arrivals** (see How to test and Regional mode).

## Where the simulation stands

Best so far: **run 115, 48.4%** with `SW=nowinrain,noardfal` (strains, threat, farmed share; below); run 112, 46.9%; before the land quantities, run 109, 45.6%
(mobility, horde reach, supply lines all clearly positive). Run 108 confirmed deals,
event-tied decisions and the frontier decision. Highlights at run 109: China over half united 67% of the time (real 65%),
steppe breakthroughs 5.6 a millennium (real 6.5), steppe empire life 93 years (real 96), frontier mounted archers at
1 CE 62% (real ~80%). Still never happening: separate offices, homeland secession, saddle coups, usurpers, slave coups.

Built and on (each with an off switch): prestige rules for hordes; portions for lesser khans; mounted skill as a local,
learned, sponsored skill; the frontier horsemen's decision (leave, join, ravage, rise); deals with the conquered (province
or people); rulers deciding on events (accession, raid, defeat, empty treasury); roads used by armies and techniques;
three clocks (yearly, decade, generation); mobility in battle (choose the moment, evade unless caught, strike and flee);
horde reach by cohesion and breakaways at the edge of a loose horde; supply lines cut by raids; grass as a horde's supply.

## In progress: the eastern Mediterranean and Iran (Nein's current priority)

Diagnosis (probe, two histories): farming arrives on time, but the region stays too thin for states and cities because
(1) a steppe sod rule covers half of Greece, the Levant, Anatolia and Iran; (2) fields rest too long (cropped one year in
four); (3) winter-rain dry land counts as poor cropland (annual climate data cannot tell the rain season); (4) Iran is
labelled herders' country, which bars states; (5) irrigation only on river floodplains (no springs, terraces, qanats);
(6) the state test averages density over a whole province (valleys and coastal plains invisible); (7) the sea does nothing
for the economy and there are no colonies (`seacol` is off).

Agreed direction (Nein, 15 Nov): describe land by physical quantities that every rule reads, instead of labels (water and
rain season, warmth, ground cover that changes, continuous soil, terrain with springs). Rain season currently comes from the
observed climate class smoothed into a gradient; **Nein will supply NOAA monthly rainfall means** to replace it.

First part built (switch `nolandvar`, sub-switches `nowinrain`, `nosodvar`, `noardfal`, `nofrontclim`): it greatly helps the
cradle (Greece, Levant, Anatolia, Iran populated and statebuilding by 1000 BCE in probes) but pushes Europe's farming and
states too early and puts farming states on the Pontic steppe. **Run 111:** winter-rain boost off +5.1 (significant),
sod-by-quantities off +4.7 (significant, but loses the cradle), ard fallow off +3.4, front waits on crops neutral.

**Probes, 2026-11-21 (province world):**
- Sod cover at history start, mean by region (new rule / old biome rule): Greece 0.03 / 0.62, Levant 0 / 0.53, western
  Anatolia 0.02 / 0.61, Zagros 0 / 0.53, Fars 0 / 0.29, Mesopotamia 0 / 0.22; Hungary 0.48, Pontic 0.72, Poland 0.74,
  Ukraine 0.72, Germany 0.18, France 0 under both; North China 0.15 / 0.41. So the new rule changes sod only in the cradle
  (and North China). Europe running early is the knock-on of an opened cradle (farming leaves Anatolia and Greece sooner and
  runs up the Danube, as with `medturf` in run 90), not sod in Europe. The planned "narrowed sod rule" was dropped.
- The front-waits-on-crops penalty (rate × (1 − 0.85 × |Δ summer dryness|) per edge) is diluted by the smooth gradient:
  Thessaly → Budapest 25 steps, 1.3 extra steps of delay in all (Naples → Paris 1.2, Thessaly → Saxony 1.7) against 5.7 for
  one sharp boundary. That is why it was neutral.
- Farm suitability, Levant–Iran box on the grid world: 0.236 with the winter-rain boost, 0.160 at a third, 0.122 without.

**Run 112 (launched 2026-11-21, commit 9785be5; new knob `winrain` scales the winter-rain boost):** now; winter rain off +
ard fallow off; winter rain at a third + ard fallow off; each of those two with farming diffusion 0.55 (`fd55`); all land
quantities off. Smoke test passed (22.5 min). **Result:** now 39.1; winter rain off + ard off 42.6 (+3.6); winter rain ⅓ +
ard off 44.0 (+4.9 ▲); **winter rain off + ard off + fd55 46.9 (+7.8 ▲, new best)**; winter rain ⅓ + ard off + fd55 45.7
(+6.6 ▲); all off 41.7 (+2.6). Winner vs now: Pontic steppe under farming states at 1000 BCE 42 → 100% (1%), LBK 33 → 92%
(5514 BCE), Britain 17 → 92% (3976 BCE), Western Europe first states 8 → 67% (436 BCE), population 3000 BCE 8 → 83%; costs
population 1 CE 92 → 46% (163M), Mesopotamia a third of the people 63 → 38%, frontier mounted archers 1000 CE 79 → 50%.
Near East at 1 CE: 12.5M (now 20.3, all off 5.2; winter rain ⅓ + fd55 keeps 16.8).

**Run 113 (launched 2026-11-21 ~18:25, commit 4c79afe; on the winner, `SW=nowinrain,noardfal,fd55`):** + strains; without strains (`noseas`); strains breeding ×0.5;
×2; strains with winter rain ⅓ instead of off.
**Result:** with strains 43.6; without 46.9 (+3.3 ▲); breeding ×0.5 42.3; ×2 47.2 (+3.6 ▲, same as without); with winter
rain ⅓ 44.4. Strains stack on `fd55`'s uniform slowdown and make the Atlantic end late: Britain 92% → 54% in band (3551 BCE;
×0.5: 8%, 2939 BCE), eastern North America 92% → 21%; LBK stays in band and comes nearer the real date (5251 BCE).

**Steppe threat for land use (3635f74, switch `nothrland`, knob `thrland`; run 114: neutral):** riding power of hordes and
free herders (people × herding share × (riding skill − 0.1) × horses) spreads six provinces, fading 30% each; the strongest
band within reach m against D = own people × (1 + 3 × state hold) gives L = m/(m + D) × open ground, added to the herding
logit with weight 2. Seed 1 at 500 BCE: Ordos 0.30, Mongolia 0.22, Kazakh 0.20, Pontic 0.02 (riding weak there). Counted in
`ev.thr` and checked by the smoke test.

**Run 114:** run 112's winner without strains or threat (reference); + threat; + threat ×2.5; strains instead of `fd55`;
strains ×2 instead of `fd55`.
**Result** (one job failed; rerun with `gh run rerun --failed`): reference 46.9; + threat 46.9; threat ×2.5 45.5; strains
instead of `fd55` 47.2; strains ×2 instead of `fd55` 45.5. All within noise. Strains now stand in for `fd55` (mechanism over
uniform slowdown), threat on.

**Probe, why stateless cradle provinces fail the state test (run 112 winner, seeds 1 and 2):** the herders' label (`w.nomad`)
blocks no one any more. At 3500 BCE whole-province density fails 95% of Greece's people and 70–84% of Anatolia's (Greece
then reaches states about 2000 BCE, near the Minoan palaces, so this is fine); farmland (farm × sFc > 0.35) fails about half
of Mesopotamia's people and nearly all of Fars, northern Iran and the Indus, because sF is averaged over the whole province
and only the floodplain is farmed. Steps 4 (mixed country) and 6 (state test on the densest land) reduce to this. A best-land
share from the 25 km fine cells was tried and dropped: it is about 1 everywhere (Greece 0.96).

**Farmed share (269a791a, switch `nofarmland`):** `w.fSh` = 1 where rain feeds the crop, the floodplain + fan share where the
river does (blend by rain-fed vs irrigated suitability, floor 0.05). State test: farmland = farm × min(1, sFc/fSh); crowding
= people × ((1 − pasture)/fSh + pasture)/area. Seed 2 (off → on): Mesopotamia in states at 3500 BCE 0 → 41%, at 2500 28 →
68%; Indus at 2500 0 → 41% (people 0.44 → 1.08M); Elam 42 → 74% at 2500; Egypt 61 → 72% at 3500 (already too early).

**Run 115 (269a791a):** strains + threat + farmland (base, `SW=nowinrain,noardfal`); without farmland; without threat; with
`fd55` instead of strains; run 112's winner (reference, 46.9). Smoke test passed (21.9 min).

**Run 115 result:** strains + threat + farmed share **48.4% (new best)**; without farmed share 46.9; without threat 46.6;
`fd55` instead of strains 46.3; run 112's winner 46.9 (each −1.5 to −2.1, within noise). Farmed share: Egypt one state 566 →
2476 BCE (4 → 25% in band, flagged), population 1 CE 181 → 183M (71% in band), Mesopotamia a third of the people 1386 →
3516 BCE (overshoots; real 2600), Indus still 0% in band. Base is now `SW=nowinrain,noardfal`.

**Run 116 (ef0f70b3):** ports on the run 115 winner; without ports; ports + farmed-share floor 0.15 and 0.30 (knob `fshmin`,
default 1 = 0.05).

**Run 116 result:** ports 46.1 against 48.4 without (−2.3, just inside noise; without ports the largest farming state at 1 CE
is in band 100% vs 79%, coinage 38% vs 13%); farmed-share floor 0.15 47.8, 0.30 45.1. Ports made opt-in (`SW=ports`).
Mesopotamia's first city-states stay about 1300 years early (median 4796 BCE, band 4000–3000): the farmed-land density also
feeds the founding rate (its crowding terms), up to 20× the province average on a narrow alluvium.

**Run 117:** run 115 winner (base, `SW=nowinrain,noardfal`); `nofarmrate` (farmed-land density opens the state test but the
founding rate reads the whole province); `nofarmrate` + floor 0.15; without farmed share.

**Run 117 result:** base 48.4; `nofarmrate` 46.8 (−1.6) but Mesopotamia a third of the people 17 → 50% in band (3201 BCE,
flagged) and first city-states 13 → 25% (3946 BCE, in band), while Egypt one state slips 2476 → 1161 BCE and population 1 CE
183 → 170M; `nofarmrate` + floor 0.15 46.2; without farmed share 46.9. Base unchanged (`SW=nowinrain,noardfal`). Reading:
farmed-land crowding in the rate is right for Egypt's unification and population but too fast for Mesopotamia's onset;
Egypt's first kingdoms stay ~1700 years early (5161 BCE) either way, so the onset rule itself is the next thing to look at
(the floor term 0.12 in cg and the irrigation/temple terms let crowded irrigated land found states soon after farming).

## Regional mode (built 2026-11-23, with Nein; commits ae91c0e2, fa3a94c9, 68d486a7)

`REGION=neareast` (or `?region=neareast` in the page) simulates only the Near East: core 22–42 N, 18–62 E (Greece to Persia,
Egypt); buffer: Pontic-Caspian steppe and Caucasus, Balkans and lower Danube, western Central Asia, Indus, Arabia, Nubia and
Libya, central Mediterranean (3,510 provinces, 1,052 in the core). **Principle: physics everywhere, people only in the region.**
- People: the land list `w.landIdx` is cut to the region (`applyRegion`/`regionCut` in world.js, re-made by `shoreline()`
  whenever the coast moves: the first version cut once and the first sea-level change undid it). Outside: no farm or pasture;
  anyone left there after the year's moves is removed and counted (`regionBorder`, absorbing border; about 0.2M people over
  ~20 years per history to 2000 BCE). Peoples seeded within ~1,600 km start at the nearest province inside.
- Physics over `w.landPhys` (every land unit): rivers (`waterPass`; over the cut list the Nile lost its upstream rain and Egypt
  held 0.2M at 3000 BCE against 1.0M), humid-period rain, vegetation, land albedo and land carbon (over the cut list the
  climate model saw the rest of the world bare: Near East rain change +8 mm against +48, capacity 17% short).
- Speed: seed 1 to 2000 BCE 194 s against 861 s for the full world (4.4×); a 24-seed regional batch to 1000 BCE takes about
  25 minutes. The full world is byte-identical (fingerprint 909f08663325 at 7000 BCE, seed 1, before and after every change).
- Reporting: `run1` gives `out.region` (people, border losses); `REGION_REPORT=neareast` reads the same from a full world. The
  batch tool scores only targets tagged for the region (`reg` in targets.js) and refuses to mix regional and full-world variants.
- **Validation, run 120 (region, 24 seeds to 1000 BCE) against run 117 (full world, 24 seeds):** Egypt 1.0M people at 3000 BCE
  in both; Pontic 1.0 vs 1.1; Near East 5.1 vs 5.9 (terracing arrives from outside: 36% of Near Eastern people in the world,
  none in the region); Egypt first kingdoms 5366 vs 5160 BCE; Egypt united 2201 vs 2565; Mesopotamian city-states 4686 vs
  4795; a third of Mesopotamia 3631 vs 3515. `nofarmrate` moves "a third of Mesopotamia" 8 → 42% in band in the region and
  17 → 50% in the world: the region answers a change as the world does. The Indus (buffer edge, Ganges cut off) differs: 4371
  vs 1020 BCE; trust the core only.
- **Arrivals from outside (675ce79a, Nein's idea; switch `noarrive`):** a full-world run with `REGION_REPORT=neareast` records
  in `out.arr`, per technique, crop, herd and beast: first decade held anywhere, whether inside the region's boxes, first decade
  and province held inside. `node tools/arrivals.js --write <run1 outputs>` builds the table into `src/world.js`
  (`SIMREGIONS.neareast.arr`, built from run 123; tamed beasts left out unless `--beasts`). `arrivePass` then brings each item in at the drawn year and province
  (one of the world histories' outcomes per item and seed, or none as often as the world had none), unless the region already
  holds it. Not covered: later peoples (Turks) and diseases.
- **Run 121 (7f9d7dfc, region to 300 BCE, first scorecard):** 28.3% in band, error 2.42; `nofarmrate` 26.8%, 2.51.
  **Run 122 (86285219, streams):** 25.9%, 2.49; `nofarmrate` 26.2%, 2.53; same-seed likeness 0.08 → 0.34. With less noise,
  `nofarmrate`'s Mesopotamia gain (runs 117, 121) mostly disappears (a third of the people 17 vs 21% in band). Biggest
  errors: Egypt's first kingdoms 5676 BCE (e4.5), Persian pattern never (e4.8), Indus (buffer, untrusted), Egypt united 2036
  BCE (e3.1, late), Mesopotamian city-states 4781 (e2.8; per seed 6540 to 2430 BCE), Assyrian pattern (e2.7), Egypt's people
  flat near 1.0M from 3000 BCE (1250 BCE: 1.1M, 0% in band). Uruk (27k), Akkad, Hittites, Cretan palaces near band.
- **Run 123 (675ce79a, full world to 300 BCE, streams; arrival data):** 51.0% in band, error 1.78 (new world reference; not
  comparable with 48.4, which ran to 1500 CE). Near East rows as in the region (Egypt first kingdoms 5356 BCE, Persian pattern
  17% in band). What reached the region's boxes from outside (24 histories): rice 24/24 (median 3350 BCE, Indus edge), millet
  24/24 (2700), terracing 18/24 (3300), Bactrian camels 24/24 (900), **horses 18/24 only about 640 BCE** (domesticated 2860
  BCE median: horses spread far too slowly west and south; chariots were in the Near East by about 1800 BCE).
- **Run 124 (464fa81f, region to 200 BCE, with arrivals vs `noarrive`):** 20.6% vs 24.2% (+3.6 ▲ for noarrive), error 2.65 vs
  2.61 (± 0.04), likeness 0.76. Arrivals stay on (fidelity to the world, not score). New rows: Aegean first lasting states
  2581 BCE (real 1950); one realm holding a third of the Aegean, lastingly 1516 BCE (real 338: unified about 1200 years early);
  **realms in turn holding a third of Mesopotamia 3000-300 BCE: median 2 (real about 9); Egypt 2 (real about 8), no
  intermediate periods (0.00, real about 0.22)**; first overseas colony from the Aegean or Levant coast 1241 BCE (real about
  800), about 1.8 a millennium. Usurpers never in any history (world either).
- **Run 125 (0fe93f04, region to 200 BCE; ablation switch `nosalt`, no salt anywhere):** base reproduces run 124 exactly
  (20.6%, 2.65); no salt 34.2% (+13.6 ▲), error 2.39 (−0.26 ± 0.09 ▲): Egypt's people 2500 BCE 1.0 → 1.9M (100% in band),
  1250 BCE 1.1 → 2.2M (88%), Uruk 27 → 42k, Mesopotamia a third 8 → 25%, Akkad 21 → 29%, Anatolia 38 → 54%, first colony
  13 → 25%. Onset (Egypt 5621 BCE) and turnover (1-2 realms) unchanged. Not a design: southern Mesopotamia did salt up; the
  proposed fix is salt by flood timing and drainage.
- **Plan agreed with Nein 2026-11-23** (his additions: upkeep, armies wrecking canals to provoke revolt, nobles holding provinces
  that water runs through having leverage and the state making concessions; collapse and civil wars from natural patterns, not
  hardcoded): (1) salt by flood timing; (2) works with upkeep, with water direction and leverage; (3) wrecking works in war;
  (4) civil-war factions with real power bases (governors, generals, court elites, the hungry) and fiscal collapse (treasury
  cannot pay army, elites and upkeep at once), concessions to high-leverage nobles with their long-run cost (Kassite grants,
  Abbasid iqta). Steps 1-3 built; step 4 next.
- **Step 1, salt by flood timing (cf552f2e, on by default, switch `noflush`, knob `flush`):** `floodFit()` routes each unit's
  water downstream by season (late-summer flood from summer rain and midsummer melt of cool high mountains; winter flow from
  winter rain; spring flood from snow under warm summers) and scores how well the flood falls in the fallow before the crop
  (winter grain where winters are mild); off-stem floodplains take the largest river beside them. Nile 0.73, Indus 0.73, Sumer
  0.21, Akkad 0.23, Yellow River plain 0.09, lower Volga 0.03. Salt builds × (1 − fit), the flood washes it off × fit, and
  irrigated land salts as river silt (alluvium), not the province's desert soil. **Run 126 (region):** 35.3% vs 20.6% (old salt)
  vs 34.2% (no salt), error 2.38 / 2.65 / 2.39; Egypt's people 1.9 / 2.1M (2500 / 1250 BCE). **Run 127 (world to 300 BCE):**
  52.8% vs 49.3% without (+3.5 ▲), error 1.74 vs 1.82 (▲); Egypt 1250 BCE 2.3M (100% in band).
- **Step 2, works (846dbf30, opt-in `SW=works`; knobs `wbuild`, `wsilt`, `wlocal`):** `s.wk` share of a floodplain's works in
  place; computeK and salt read min(irrigation know-how, works) instead of know-how. `worksPass` (decade, year ending 4): build at
  0.01 × wbuild × know-how × hands (farm people per km² of floodplain / 20) × (cap − W); cap = village cap (0.3 + 0.4 × wlocal ×
  flood fit) raised by a state's reach (coord × integration, × 0.6 if the treasury is below −0.3); silting 0.01 × wsilt × (1 −
  0.6 fit) × the share neither hands nor reach can keep. Probe seed 1: Egypt 4500 BCE 0.41M (was 0.80), 3000 BCE 1.02 (1.59),
  2500 BCE 1.62. **Run 128 (region):** works 31.1%, works at half build speed 33.3% vs 35.3% none (within noise), error 2.42 /
  2.34 / 2.38; onset much better (Mesopotamian city-states 3696 BCE, 63% ▲; a third of Mesopotamia 2791, 46% ▲; Egypt first
  kingdoms 4791) but Egypt's people lower (1.3 / 1.8M) and Akkad late (846 BCE).
- **Step 2b/3, flow, leverage, wrecking (2fe615ed, under `works`; switches `nowkflow`, `nowreck`):** `wkFlow()` gives each
  floodplain a feeder (largest stream in, or the big river beside it) and dep = 0.7 × (1 − fit) × min(1, rvF/0.6) of its works
  water taken there; an enemy holding the feeder shuts it (`wkCut`, counted `ev.wkCut`); `s.lev` = people downstream fed through
  a province (dealPass offers terms where lev > half the province's people). `wreck(j,x)` breaks works there and × dep in those
  fed through it (`ev.wreck`): raids by hordes or in punitive wars (0.3), punitive or raid goals on taking a province (0.35),
  failed attacks with probability 0.5 × (1 − chance of winning) (0.2), horde sacks (0.3, replacing the old cut to irrigation
  know-how). Punitive campaigns weigh targets by leverage. Probe seed 1 to 1000 BCE: 158 wrecks, gates shut 2,800
  province-years, 0.85M people depending on upstream works. **Run 129:** works at half speed with none of these, + flow, + flow +
  wreck, + flow + wreck + wlocal 1.75, and no works.
- **Run 129 (2fe615ed, region; all with works at half build speed):** none of flow/wreck 33.3%, + flow 32.5%, + flow + wreck
  33.9%, + wlocal 1.75 32.2%, no works 35.3% (all within noise; errors 2.34-2.43). Per millennium about 110 wrecks and 1,800
  province-years of shut gates. Egypt intermediate periods 21% in band with wreck (4% without); onset gains of works hold.
- **Step 4a, civil wars from real power (0d55d450, on by default, switch `nocentre`):** rebel seeds weighted by distance ×
  looseness × sqrt(people), so heartland provinces can rise; court strength = people held × (0.5 + 0.5 integ) × (0.5 + cohesion)
  × 0.6 if treasury < −0.3 × (1 − 0.5 pay owed); each rebel = its people × (0.5 + local solidarity) + half the court's people it
  can starve through works; a stronger rebel takes the capital and the court's lands (old realm ends; `ev.cFall`). **Run 130
  (region):** works + centre 34.2%, works 33.9%, centre 35.8%, neither 35.3% (within noise). Centres fall 3-5 a millennium in 23/24
  histories, but realms in turn in Mesopotamia and Egypt stay 1-2: the giants' heartlands stay one loyal block, rebels split.
  **Proposed to Nein (step 4b):** in a crisis the surplus elites (elite overproduction, `o.E` above `etOf(o)`) take sides with
  heartland rebels (rival city, governor, general), so the court counts only loyal elites; and heartland cohesion decays further
  when the realm has had no real frontier for generations (Turchin's interior decay). Tool: `tools/probes/evs.js <worktree>
  ev.cFall,...` reads event medians from a batch's cache.
- **Step 4b (dc3ab069 → e3c23662; Nein added: elites take autonomy while they can, and a ruler with the will to bend the realm
  meets lords who refuse and secede, a cascade without invasions). All of step 4 is now behind the opt-in switch `rise`, each
  piece with its own off switch: `nocentre` (court vs rebel strength, power-weighted rebel seeds; a decisive winner (≥ 1.5 × the
  court) takes the court's lands, a narrow one leaves the heartland to its lords via partitionLands, `ev.cSplit`), `novig`
  (vigilance `o.vig`: target 0.2 + 0.5 × ruler competence + 0.6 × pressure, pressure = wars and raids weighed by the enemy's power
  against the realm (`vigWar`, `vigRaid`), shock, hunger; rises 8%/yr of the gap, falls 0.6% × (1.5 − competence); low vigilance
  slackens the realm's corvee on works, speeds elite growth (× 1.3 − 0.6 vig) and weakens the court in a civil war), `noesplit`
  (surplus elite x = E/Et − 1 takes 0.6 × x × (1 − 0.5 vig) of the court's strength to the rebel nearest the capital), `noselect`
  (founders and usurpers the better of two competence draws), `nosecede` (lords' share also grows under a slack court; a ruler
  with will = (competence + aggression)/2 above 0.5 tries to take lands back, per decade 0.5 × (will − 0.5) × (lords' share −
  0.2), ×2 if broke; `lordsRefusing`: a lord refuses where (1.2 − integ) × (0.5 + solidarity) × (0.5 + lords' share) × (1 +
  water leverage) exceeds `courtHand` × exp(−distance / (2 × mean)); under 12% of the people refusing: lands back; more:
  partitionLands, `ev.secede`), `lordcrisis` (opt-in inside rise: the same test for everyone in a civil war, with the court's
  hand cut by an empty treasury, pay owed and the surplus elite).
  **Results (region, 24 histories to 200 BCE, error; none = 2.38):** run 131 works + all 2.32, all (no works) 2.44; run 132 and
  133 (vigilance answers real pressure only; lords' test rescaled so it fires) works + all 2.37, all 2.58 (▼ vs none), works +
  all without vigilance 2.48; secession 0.36 a millennium in 19/24 histories. Run 134 (lordcrisis on): works + all 2.73
  (−6.1 points, +0.33 error, both ▼): Mesopotamia fragmented 17% of decades, but still 1-2 realms in turn, Akkad never, Anatolia
  late. **Diagnosis (probe `crisis.js`, seed 1):** before lordcrisis, the leading Mesopotamian realm's civil wars took its share of
  Mesopotamia only 0.67 → 0.56, back to 0.66 within 50 years (they peel off the distant periphery); with it, the region breaks but
  no new power gathers the pieces. Defaults give exactly the flood-rule baseline (region seed 1 at 2500 BCE 1d6d68837326 at
  cf552f2e and e3c23662). **Next, to talk through with Nein:** what lets a new power gather a broken region (the Thebes, Babylon,
  Assyria pattern): successor states' competition, a rising frontier people's cohesion.
- **Step 4c (a20b3088, Nein 2026-11-24: successors seek to rebuild the empire within living memory; memory fades and borders
  harden until an upstart snowballs; confederations from long peace and trade, unified under a run of able leaders; periphery
  states fixed on the heartland leave their rear open to nomads). Inside `rise`: `nomemory` (`remember(o,cells)` when a Kingdom or
  Empire falls in civilWar or collapse: `s.mems`, `s.memAt`; `claimOf(o)`: a state whose capital lies in the lands and shares the
  old tongue family or faith, strength exp(−years / (60 + 240 × records at its capital)); `restOf(o,t)` multiplies the conquest
  value of a fellow successor by 1 + knob `claim` × strength (× 2 for the old capital); reclaimed provinces + 0.3 × strength
  integration; `ev.claimWar`, `ev.mem`), `noconf` (`confPass`, decade: neighbouring non-city states with trade > 15% of income,
  kin, no war and truce over 40 years ago, 5% a decade, form a league with `conf:true`; after 40 years a head with competence >
  0.55 absorbs members under 0.6 of its power at 0.3 × (competence − 0.55) a decade; heads under 0.4 lose members; `ev.conf`,
  `ev.union`). The exposed rear needs no rule: field armies go to the fighting and defence fades with distance from them
  (`localForce`). **Run 135 (region):** rise 33.6% / 2.55, rise without memory 2.49, without confederations 2.56, works + rise
  35.0% / **2.30 (lowest error yet; baseline 2.38, within noise)**, baseline 35.3% / 2.38. Claim wars about 9 a millennium,
  confederations about 1, unions in 12/24. Realms in turn (mean over 24): Mesopotamia 1.9 (baseline 1.8), Egypt 1.8 (1.4).
  **Seven rise-and-fall mechanisms now fire without moving turnover: proposed to Nein to stop adding and diagnose what holds the
  big realms together (who holds Mesopotamia decade by decade, how fast lost provinces return, the leading realm's power against
  its rivals).**
- **Rise-and-fall diagnosis (Nein approved 2026-11-24; probes `tools/probes/diag.js` + `diagsum.js`, `claimw.js`; region,
  seeds 1-2, baseline and works + rise):** (1) the realm holding most of Mesopotamia or Egypt is the same for 1,500-3,200 years
  in 3 of 4 histories (dynasties change inside it); (2) stress sits high without resolution: Egypt's leader in one history had
  median stress 6 from 3500 to 2500 BCE with cohesion 0.91, civil wars about every decade, never breaking (every civil war
  peels off periphery; nothing releases stress); (3) the leader is 3-27× its strongest neighbour (fragments around it);
  (4) provinces lost rarely return to the same realm (Mesopotamia 4-12%); (5) **run 136** (rise + lordcrisis, with memory): rise
  2.55, + lordcrisis 2.63, works + rise 2.30, works + rise + lordcrisis 2.68 (−11.4 points ▼), baseline 2.38; claim wars × 4
  but turnover still 2. **Claim wars (44 in two histories):** start at equal power (median ratio 0.9-1.0), last 6-8 years,
  median gain 0 provinces, the claimant wins over 30% of its rival in 8 of 44, destroys it in 4; `decisive()` (capital taken:
  annex or tribute) needs the loser much smaller (< 0.7 × provinces) or S < 0.35. **Proposed to Nein:** crisis depth scales
  with stress and breakdown releases it (elites thinned, debts and pay owed gone, people down); momentum (victories raise the
  winner's cohesion and prestige, the loser's elites hedge); bandwagoning (after a decisive win neighbours weigh submitting);
  a capable ruler leading the army counts for more (now at most about +30% via `localForce`).
- **Step 4d (4c3599eb, Nein 2026-11-24: approved all of the diagnosis proposals and added rulers learning war by fighting, able to
  snowball). Inside `rise`, each with its own off switch:** `nodepth` (civil war reaches the far share clamp(0.35 + 0.125 × stress,
  0.5, 0.9) of the realm instead of 0.6, loyal-core keep chance 0.7 × clamp(1.5 − 0.25 × stress, 0.3, 1), + floor(stress − 2) more
  rebel seeds; **and the crisis test counts provinces, not area: `nC = max(cells, 1.5 × nU)`**. Probe `psi2.js` found Egypt's leading
  kingdom holding up to 18 provinces on under 3 cells of area, so it could never have a civil war (needs 3) or shatter (needs 40);
  its stress sat at 5-7 for a millennium, almost all surplus elite at the cap (E/Et 5.2)), `norelease` (a civil war that takes ≥ 30%
  of the realm's people writes off debt and back pay and thins the elite to (0.7 − 0.4 × share) × Et; ≥ 45% forces a new house via
  `succession` with `o._fu`; realms of one or two provinces, which cannot split, get `strife(o)`: elite to 0.6 Et, debts cleared,
  people −3%, half the time a new house), `nomomentum` (`o.mom` in [−1, 1]: +0.06 per province taken from a state, −0.06 per province
  lost, ±0.024 for an assault beaten off, × 0.85 a year; force × (1 + 0.3 mom) in `localForce`, `courtHand` × (1 + 0.25 mom); a loser
  below −0.3 loosens the lords next to each province it loses and some open their gates: `ev.gate`), `nobandwagon` (`bandwagon(o)`
  after `decisive`, `breakRealm` or a war won by ≥ 8 provinces: each neighbour state at peace, not a vassal or in a league, with
  power ratio ≥ 3 (victor's power × (1 + momentum)) submits at clamp(0.08 × (ratio − 2), 0, 0.4) × (1.3 − aggression): `ev.band`),
  `nogeneral` (king's army multiplier 1.05 + 0.9 × knob `gen` × (skill − 0.5); skill `milOf(R)` = R.mil or (competence +
  aggression)/2; a usurping general starts at ≥ 0.75), `nolearn` (`learnWar` after each engagement near the king's own army: skill
  += 0.03 × knob `learn` × (1 − skill) × (won: difficulty 1 − odds; lost: 0.6); dies with him; the army's veteran core `o.vet` +0.003
  per battle won, 0.0015 lost, × 0.96 a year, force × (1 + 0.25 vet): `ev.milHi` counts rulers passing 0.85).
  **Run 137 (region, 24 histories to 200 BCE):** baseline; works + rise as run 135 (all six off); works + rise + all six; all six
  minus each one. **Run 137 was hit by a NaN bug (below) and is void;** as measured: all six 30.6% / 2.34 (run 135 config 35.0 /
  2.30, baseline 35.3 / 2.38), each piece off 2.25-2.40, all within noise; court falls 3 → 35 a millennium (the province count),
  splits 1.4 → 12, bandwagon 27, release 9, strife 550, gates 1.4, great generals 7.5; **realms in turn still 2 in Mesopotamia and
  Egypt; Egypt never without a realm holding a third.** Probe `learn.js`: kings lead in person in few battles (median 0 per ruler in
  realms of 10+ provinces, p90 1-6; the king's army is the first army only where the court's command weight is highest), so
  generals were added (11763cd6, inside `nolearn`: each army's commander skill `a.sk`, learned the same way, × CMD_M by 1 + 0.9 ×
  gen × (sk − 0.5), drifting 4%/yr back to 0.5; a usurping general brings it). Momentum stays small (p10 −0.08, p90 0.16).
- **NaN bug (fixed fae80e55; changes defaults: region seed 1 at 2500 BCE now 8068f5adcf8e):** a sea attack on a polity born that
  year read its undefined `coastN`, so the odds were NaN and the attack always failed. With learning on, NaN reached the ruler's
  skill and made his realm unbeatable and harmless (5,273 of 25,260 engagements after 2338 BCE in seed 3). Fix: `(x.coastN||0)` in
  the sea odds; `learnWar` skips engagements without finite odds. Probe `nan.js` (counts non-finite odds; 0 after the fix).
- **Why Egypt never breaks (probe `front2.js`, seed 1, works + rise + six):** Egypt's leading realm has all its people inside the
  metaethnic frontier band (`frontBand`: any neighbouring province of another people (ethDist > 0.22) or faith, however few live
  there, plus 0.75 inward) from 2500 BCE on, and cohesion 1.00 for 1,500 years; across half to three quarters of its line the other
  side has under 5% as many people as the province (empty desert). Mesopotamia's leader: 72-98% in the band, cohesion about 0.8.
  So the interior decay (asabD 0.006) never applies, power stays high (× (0.3 + S)), collapse (S < 0.12) never comes.
  Seed 2: Egypt's leader about half in the band, cohesion 0.4-0.6 (cohesion tracks the band share); half its line faces under 5%.
  **Proposed to Nein 2026-11-24:** weight the frontier by the people (or force) across it against the province's own, so an empty
  desert edge builds little solidarity. Not built.
- **Run 138 (fae80e55, NaN fixed; region, 24 histories to 200 BCE; error):** baseline **33.1% / 2.46 (new baseline)**; works +
  rise as run 135 35.0 / 2.33; **works + rise + all six 33.6 / 2.25 (▲ vs baseline, −0.21 ± 0.09; lowest error yet)**; without
  depth 2.27 ▲, without release 28.6% (▼ −4.4 points) / 2.28 ▲, without momentum 2.33, without bandwagon 2.39, without generalship
  2.32, without learning 2.23 ▲. Assyrian pattern (Mesopotamia + Levant under one realm) 0% → 29% ▲ (46% without learning), Persian
  pattern 0% → 21% ▲. Court falls 38 a millennium, splits 13, bandwagon 27, release 9, gates 1.4, great generals 6.8. **Realms in
  turn still 2 in Mesopotamia, 1-2 in Egypt; Egypt still never without a realm holding a third.** Package stays opt-in (`rise`)
  pending Nein; region config to use: `SW=nowinrain,noardfal,works,rise KV=wbuild:0.5`.
- **Cohesion from threat (5a01e2cc + d5161b5f, opt-in `thrcoh`, knob `thrk`; Nein 2026-11-24: "the threat of a threat"; a passive
  weaker neighbour should loosen a border, which then invites treachery).** `frontThreat()`: along a line with another people or
  faith, the realm across presses by power(across)/power(own) × (0.4 + 0.6 × `dispOf`) / thrk (dispOf: 1 at war or a horde;
  fought or raided within living memory, exp(−years/60); else 0.6 × its ruler's aggression); stateless people across press by
  pop × (1 + 2 × riding) / (0.5 × thrk × own pop); a realm presses fully on stateless people. The pressure spreads 0.75 inward
  only within the same realm (d5161b5f: the first version let a stateless desert province pressed by Egypt pass full pressure
  back into Egypt, probe `front4.js`). Pressure fT = max(that, `s.thr` raid and war memory); asabiya += asR × fT × s(1 − s) −
  decay × (1 − fT) × s (stateless: the same blend). Treachery (`notreach`, knob `treach`): an attack that failed on a non-capital
  province of a state with solidarity < 0.35 succeeds anyway with 0.15 × treach × (1 − s/0.35) × (1.2 − integ) × (1 if the
  attacker was stronger there, else 0.3); `ev.treach` about 3-4 a millennium.
  **Run 139 (region, error):** baseline 33.1% / 2.46; works + rise + six 33.6 / 2.25; + threat cohesion 30.6 / 2.42; without
  treachery 26.9 (▼ −6.1) / 2.49; thrk 2 (less pressure) 29.2 / 2.39; thrk 0.5 28.9 / 2.43; baseline + threat cohesion 34.2 /
  2.41. Egypt intermediate periods 13 → 29% in band ▲, Mesopotamia realms in turn median 2-3 (13-17% in band), Egypt two thirds
  under one realm later (1526 → 1326 BCE, 4% ▼), Persian pattern 21 → 4%. Reading: weaker cohesion weakens challengers as much
  as incumbents; turnover barely moves. Stays opt-in, not adopted.
- **Old regime against the upstarts (6bae9ee6; Nein 2026-11-24: successors rise believing they can win; unpaid, disloyal troops;
  elites gone over; cumbersome courts; plus foreign opportunists, frontiers the court cannot strip, the hungry joining rebels).
  Inside `rise`:** `norebmom` (rebels start with momentum clamp(0.15 × stress, 0, 0.8), the court −clamp(0.1 × stress)), `nopay`
  (`cwForce`: any state's field force × (1 − 0.4 × owed) × 0.8 if treasury < −0.3; facing its own rebels a failed attack on a court
  province succeeds at 0.25 × owed × (1.2 − integ): `ev.payDef`), `noegone` (`o.eGone` = share of the court's strength gone to the
  heart rebel, `eGain` for it, × 0.95 a year), `noovh` (strength's tax term × (1 − clamp(0.5 × (E/Et − 1), 0, 0.6))), `novulture`
  (war choice sees a court in civil war at half its power: `ev.vulture`; at the outbreak each neighbouring state joins the rebels at
  0.3 × `dispOf`: `ev.sponsor`), `nofrontload` (court force × (1 − 0.5 × share of its border facing hordes, foreign enemies or
  raiders of the last 10 years), `nohungry` (`hungAt`: 2 × (pop/K − 0.9) + pW; court force × (1 − 0.3 h), rebels × (1 + 0.5 h),
  and in the court-vs-rebel reckoning). Flags `o.cwC` / `o.cwR` set yearly by `cwPass()`. **Run 140:** 32.5% / 2.27 against 33.6 /
  2.25 (all within noise); without pay 2.42, without rebels' momentum 2.34; noegone identical (a bug, below); turnover still 2.
- **Probe `cwout.js` (civil wars in realms of 8+ provinces, seed 1):** median court kept 9 of 11 provinces, the war lasted 2 years,
  and the court stormed the rebels' capitals (decisive annex). Three causes found and fixed (4687cda4): (1) **every state born
  during the politics pass had a NaN tax** (the `o.tax*=o.coord` scaling on an unset tax) that slipped past statecraft's "not yet
  taxed" test, so its burden was reckoned on no revenue (40-430) and its **treasury started at the floor, −2**, recovering 0.03 a
  year (probe `newreb.js`): every successor was born bankrupt. The test is now `!(o.tax>=0)`. **Changes defaults: region seed 1 at
  2500 BCE now 2e9870aeb792.** (2) The elite split read `o.E` after civilWar had reset it to 0.7 Et, so no elite ever went over
  (since step 4b); now `o._eR` = the ratio when the crisis broke (also in `courtHand` for the crisis test). (3) `norebhold` (inside
  `nodepth`): the rising share goes with the rebels first (BFS from the seeds before the court's loyal provinces), the court keeps
  what stayed loyal and what the rebels cannot reach.
- **Run 141 (4687cda4, region, error):** baseline with the tax fix **34.2% / 2.44 (new baseline)**; works + rise + six 31.7 / 2.30;
  + old regime 29.7 / 2.34; + old regime + rebels hold 28.6 (▼) / 2.36; six + rebels hold 31.1 / 2.43. **Rebels hold is the first
  change to move turnover:** realms in turn Mesopotamia 2 → 3 (21% in band ▲), Egypt 2 → 3 (29% ▲); court falls 38 → 58 a millennium.
  Cost: Egypt's unification later (2311 → 1336 BCE), Akkad later; Egypt still without intermediate periods. Sponsors about 6-9 a
  millennium, vultures 3-4, pay defections about 2. Reading: the region now breaks and changes hands more, but the gatherers are
  slow; next question is what makes one successor snowball fast enough (Egypt unified about 3100 BCE, Akkad 2300).
- **Gathering trace (probe `gather.js`, seeds 1-2, full rise, 3200-500 BCE):** Mesopotamia has no realm holding a third in 50-75%
  of decades (one spell 1,860 years), Egypt 25-30%; the leading realm then is only 1.1-2.2× the next, starts a war once in 70-170
  years, is at war in 7-30% of decades, attacks 0.4-2.5 times a decade and wins about a quarter. The bottleneck is how rarely wars
  start (flat 2% a year × gate × aggression, then 10-40-year truces), not how they go. Upkeep as found: roads decay 10%/yr unpaid;
  army readiness (`o.prep`, ±15% via `stateMil`) fades in peace; walls never decayed (only sacks), garrisons are a yearly cost.
- **Gathering package (daab6200 + a2e3cbac, inside `rise`; Nein 2026-11-24, with his additions: states learn when to go to war,
  a foolish king may attack a hub or walls and get lucky, literacy and history keep the lessons):** `nowarrate` (war roll ×
  clamp(edge/1.5, 0.5, 3) × (0.6 + 0.8 aggr) × (1 + 1.5 max(0, mom)) × (0.8 + 0.4 skill); `o.edge` = best power ratio over non-allied
  neighbours, yearly in `cwPass`; a victor more than 2× the loser keeps 0.4 of the truce), `nojudge` (`fogOf`: perceived ratio ×
  exp(0.6 × (1 − 0.5 comp) × (1 − 0.6 memo) × N(0,1)); `o.les` [walled, trading, stronger] multiply the target weight; at
  `endWar` les ×= exp(0.3 × (outcome − 0.1) [+ 1.5 × min(0, trade change) for a conquered trading city]), clamped 0.3-2;
  at succession les keeps 0.2 + 0.8 × court memory of its distance from 1; `ev.lesson`), `noprotect` (`protectPass`, decade:
  a province of a realm with `failOf` ≥ 0.15 goes to its strongest-luring state neighbour at 0.15 × knob `protect` × fail × lure
  × (1 − tie); lure = clamp((power ratio − 1)/2) × (0.6 + 0.4 mom + 0.3 at war); tie = 0.6 integ + 0.3 roads + 0.2 kin; `ev.protect`),
  `noupkeep` (`unpaidOf`: walls count × (1 − 0.6 unpaid) in `defense`; walls × 0.98 a year while the treasury is below −0.3),
  `noholdback` (non-king armies × (1 − 0.5 hedge), hedge = fail × (1.3 − courtHand)), `noflight` (a city taken by force with
  trade share > 0.1 loses 0.3 × share of its people (displace) and caravans × (1 − 0.5 share): `ev.flight`). Smoke seed 2 to
  1500 BCE: protect 1.3, flight 7, lessons 567 a millennium. **Run 142 (a2e3cbac, region, error):** baseline 34.2% / 2.44;
  six + rebels hold 31.1 / 2.43; + gathering 31.7 / 2.32; **everything (six + old regime + rebels hold + gathering) 35.0 / 2.25 ▲;
  everything without judgment 35.0 / 2.16 ▲ (lowest error yet; Assyrian pattern 42% ▲, Persian 25% ▲)**; without war rate 28.9 ▼
  / 2.42 (the key piece); without protection 2.27, without upkeep 2.26, without holding back 2.31, without flight 35.3 / 2.23.
  Realms in turn now 3 in Mesopotamia and Egypt (17-38% in band); Egypt still no intermediate periods; Egypt's unification still
  late (about 1700-1900 BCE). Per millennium: court falls 53, protection 2.9, flight 3.6, bandwagon 21. Judgment as built costs
  error (fog sd 0.6 likely too thick: foolish wars weaken early states); proposed to Nein: retest with a thinner fog.
- **Corruption, phase 1 (f2ba92a1, opt-in `corrupt`, knob `corr`; plan agreed with Nein in project doc
  `claude/corruption-plan.md`; intelligence will be derived from administration, not a stock).** `corYear(o,c)` after statecraft:
  drivers D = 0.3 surplus elite + 0.25 unpaid (burden > 1, treasury < 0) + 0.15 (1 − vigilance) + 0.15 greed + 0.1 (1 − mandate)
  + 0.15 lords' share + 0.15 stretch (md/h); checks O = 0.35 records + 0.2 ledgers + 0.2 law + 0.15 roads + 0.4 practice of checks
  at the capital (≤ 0.9); target corr × D × (1 − 0.7 O); `o.cor` moves 10% a year. `corAt(o,i)` = cor × (0.6 + 0.4 far) × (1.2 −
  integ) × (1 − 0.6 chk). The take feeds the elite (+0.004 cor E a year). Channels: `nocortax` (tax × (1 − min(0.6, 0.4 cor (0.7
  + 0.6 money)))), `nocorlevy` (strength's men × (1 − 0.3 cor (0.5 + lords))), `nocorpay` (pay in the owed rule × (1 − 0.5 cor)),
  `nocoroff` (upkeep × (1 + 0.5 cor); strength's tax term × (1 − min(0.6, 0.6 cor)), replacing `noovh`), `nocorgov` (integration
  −0.003 corAt a year; failOf + 0.3 cor), `nocorgate` (a failed attack on a non-capital province succeeds at 0.06 corAt × (1 or
  0.3): `ev.bribe`). Reform: `noreflocal` (`checkPass`, decade: `s.chk` arises in a city with records > 0.3 and caravans or
  coast where corAt > 0.1 at 0.2 corAt; spreads 5% × link of the gap from neighbours; captured 3% × corAt a decade: `ev.refLoc`),
  `noreftop` (cor > 0.35, competence > 0.6, vigilance > 0.5, once in 30 years at 0.05 × (comp − 0.6) × 10 cor: chk at the
  capital 0.8, cor × 0.6, E × 0.85; backlash at 0.5 × (0.6 surplus elite + 0.5 lords): forced succession: `ev.refTop`,
  `ev.refBack`). Probe `cor.js` (seed 2 to 1500 BCE, first version): top states' cor 0.06-0.33, rising with age and surplus
  elite; 31 reforms from the top, 12 backlashes. Then local emergence loosened (corAt > 0.1 at 0.2 corAt) and spread halved
  (5%). **Run 143 (f2ba92a1, region, error):** baseline 34.2% / 2.44; best (everything but judgment) 35.0 / 2.16; **best +
  corruption 32.5 / 2.22 (within noise of best) with realms in turn Mesopotamia 3 → 4 (21-46% in band ▲), Egypt 2 → 4 (50% ▲)**;
  Akkad pattern 33%; Persian 25 → 17%, Assyrian 42 → 33%; without tax skimming 2.25, padded levies 2.31, lost pay 2.19, sold offices
  2.27, corrupt governors 35.6% / 2.18 (best score; the governors channel may hurt), bribed gates 2.28, local reform 2.34, reform
  from the top 2.35 (both reforms matter); baseline + corruption 32.8 / 2.47 (turnover unmoved without rise). Per millennium: reforms
  from the top 25, backlashes 6.8, local checks arising 0.4, bribed gates 4.6, court falls 74. Egypt still no intermediate periods.
- **Run 143 re-read (2026-11-25):** same-seed likeness is about 0.27 between variants, so ablations within about ±0.1 error are
  chaos, not mechanism. Without corrupt governors (2.18 vs 2.22) is noise, and it costs Egypt's unification (21 → 4% in band) and
  Egypt turnover (4 → 3): channel kept. Local checks arose 0.4 a millennium (the mechanism was nearly dead).
- **Local reform fixed (inside `noreflocal`; knob `refl`).** Probe `chk.js` (seeds 1-2 to 2000 BCE, best + corruption): 6-9 cities
  in the region, records above 0.3 in 3-8 of them from 2750 BCE, but they sit by the court and are well bound (integration
  0.5-1.0), so corAt there was 0.005-0.03 against the threshold 0.1; and only 1-2 had caravans > 0.2 or a coast. Now a town with
  records sees g = max(corAt, half the realm's corruption), its stake is clamp(0.3 + caravans/0.2 + 0.5 coast, 0, 1), no threshold:
  0.2 × refl × g × stake a decade.
- **Peopled frontier (opt-in `frontpop`, knob `fpw`; proposed after probe `front2.js`).** `frontWeight()`: a province on a line with
  another people or faith gets f = min(1, people across (riders × 3) / (0.5 × fpw × own people)), spread 0.75 inward as the band was;
  asabiya += asR × f × s(1 − s) − decay × (1 − f) × s (the thrcoh form). With every edge peopled it is the old band.
- **Intelligence, corruption phase 2 (opt-in `intel`; sub-switches `nosecret`, `noweakpt`; knobs `ibias`, `ifalse`, `iweak`).**
  `intelOf(o)` yearly in `cwPass`: (0.45 records + 0.25 messenger speed + 0.3 min(1, cplx/0.8)) × (1 − 0.5 unpaid) × (1 − 0.5 cor).
  Replaces the fog in the war choice: `seenPow` = power × wf^I, wf = (0.5 if in civil war) × (1 − 0.5 failOf) (a court that knows
  little sees size, not failings; this takes over the vulture discount for states); `tempOf` = exp(0.8 × ibias × (1 − I) ×
  (aggression − 0.5)) on the odds (bold overrates, cautious waits). Secrets: the court sees a rival with I + (1 − I) × 0.5 × the
  rival's corruption (leaks); a rival with I > 0.3 plants false reports, believed at 0.5 × (1 − I): seen power × (1 + 0.5 × ifalse
  × its I) (`ev.falseRep`). Weak points: the province to strike weighted × (1 + 1.5 × iweak × I × clamp(1.2 − integ − 0.7 walls)).
  With judgment's lessons on (no `nojudge`), learning per war × (0.3 + 0.7 I). Probe `intel.js`.
  Probe seed 1: intelligence 0.07-0.16 before writing; a Mesopotamian court with records 0.6-0.66 from 3000 BCE; Egypt's leader
  0.17-0.24 until about 2250, then 0.65. Egypt's frontier weight stays 0.72-0.93 (its leader then holds 0.3-0.4 of the Nile, with
  populous rivals across), cohesion 0.90-0.95. Smoke test on the combined set-up passed (8.9 min); default fingerprint unchanged.
- **Run 144 (launched 2026-11-25, region, 24 histories to 200 BCE):** baseline; best + corruption with the local-reform fix; + peopled
  frontier; + intelligence (no fog, no lessons); + intelligence with lessons; + intelligence + peopled frontier; that without
  secrets; without weak points; + peopled frontier at fpw 2; best (no corruption) + peopled frontier.
  **Result (b65baa69, error; baseline 34.2% / 2.44):** best + corruption with the reform fix 32.5 / 2.26 (run 143 without the fix
  2.22: same within noise); + peopled frontier 30.3 / 2.24; **+ intelligence 32.8 / 2.23 ▲**; + intelligence with lessons 32.2 / 2.23
  ▲; + intelligence + peopled frontier 29.4 (▼) / 2.30; that without secrets 2.36, without weak points 2.35 (both pieces pull their
  weight inside the combination); peopled frontier at fpw 2 25.6 (▼) / 2.52 (too strong); best (no corruption) + peopled frontier
  32.5 / 2.24 ▲ (Assyrian pattern 38% ▲, Persian 17%). **Intelligence is the first change to bring Egypt's unification earlier:**
  two thirds of the Nile under one realm 1786 → 2211 BCE (21 → 25% in band; with lessons 2156), a third lasting 2686 BCE; Akkad
  later (1706 → 1451). Realms in turn: Mesopotamia 4 everywhere but fpw 2 (3); Egypt 3 (best + corruption, intelligence) or 4 (with
  the peopled frontier, 54% in band). **Egypt's intermediate periods still median 0.00 in every variant** (in band 4-21%): the peopled
  frontier did not deliver its purpose (probe: Egypt's frontier weight stays 0.7-0.9, cohesion 0.9+). Local checks now arise 1.1-1.8
  a millennium in 23-24 of 24 histories (were 0.4); reform from the top 25, false reports believed about 55, lessons 430 (with
  lessons), court falls 71-77. Egypt's people still low under works (2500 BCE 1.0-1.1M, 1250 BCE 1.3-1.6M).
  **Proposed next (to Nein):** keep `intel` and `frontpop` opt-in; next a probe of Egypt's leading realm under best + corruption +
  intelligence (cohesion, stress, civil wars and how deep they reach, what holds it) before any new rule for intermediate periods.
- **Probe `egypt2.js` (2026-11-25; seeds 1-4 to 300 BCE, best + corruption + intelligence): what holds Egypt together.**
  (1) Once a realm holds most of the Nile it keeps it for 600-1,500 years (seed 1: 1200-300 BCE at 0.63-0.97; seed 4: 1800-300 BCE at
  0.97-0.98; seed 2: two realms 2200-300 BCE). Successions pass Egypt whole from one realm to the next (the court falls and the
  winner takes its lands), never through a gap. The one long gap (seed 3, 1700-1300 BCE) followed a conquest by herders' clans.
  (2) Stress after unification is almost only elite overproduction (pE): E/Et climbs over centuries to its cap 3.0 (o.E ≤ 0.12),
  psi about 2.3; otherwise psi under 1. **The treasury sits at its cap 1.0 throughout** (burden well under 1): `statecraft`'s upkeep
  = 0.28 × cplx^1.6-1.8 × (people + 12000 × land) does not depend on the elite, so a court with three times the elite its offices
  carry pays nothing for them, and the pay, corruption (unpaid officials), protection and holding-back channels never bite. Cohesion
  0.9-1.0 (0.5-0.7 when Egypt is a part of a large empire). (3) Civil wars in the realm holding Egypt: 4-8 per 1,500 years at psi
  1.5-2.7; most leave Egypt untouched (share 0.97 → 0.97: rebels rise far from the court, and Egypt is the integrated heartland);
  when the court falls, one successor takes Egypt whole.
  **Proposed to Nein:** (a) surplus elites cost the court (stipends, offices, estates): upkeep × (1 + k × (E/Et − 1)), the
  fiscal-structural link of Turchin's model, routing elite overproduction through the treasury into channels already built;
  (b) if Egypt still passes whole, fault lines inside the heartland in a crisis (provincial lords with their own people and
  water, as the nomarchs of the First Intermediate Period).
- **Elite cost (opt-in `ecost`, knob `ecost`; Nein approved (a) 2026-11-25).** First form, upkeep × (1 + 0.5 × knob × (E/Et − 1)):
  probe `egypt2.js` seeds 1, 4: Egypt's burden 0.04-0.48, treasury still at its cap (upkeep is a tenth to a third of revenue). Now
  surplus elites claim revenue: burden += 0.5 × knob × max(0, E/Et − 1) (d9fd8fe1). Probe (seeds 1, 4): burden 1.07-1.10 when E/Et
  reaches 2.5-2.7, treasury dips to 0.4-0.7, not below 0; Egypt still passes whole between realms (seed 4: one realm 2600-1139 BCE).
  Smoke test passed (11.3 min); default fingerprint unchanged.
- **Run 145 (launched 2026-11-25, region, 24 histories to 200 BCE):** baseline; best + corruption + intelligence (reference); + elite
  cost k 0.5 (knob 1), k 1 (knob 2), k 2 (knob 4); + elite cost k 0.5 + peopled frontier; best + corruption + elite cost; best + elite
  cost.
  **Result (80129177, error; baseline 34.2% / 2.44):** best + corruption + intelligence 32.8 / 2.23 ▲ (reproduces run 144); + elite
  cost k 0.5 29.7 / 2.28; k 1 30.3 / 2.32; k 2 30.8 / 2.33; k 0.5 + peopled frontier 28.6 / 2.29; best + corruption + elite cost 30.6
  / 2.28; **best + elite cost (no corruption, no intelligence) 33.9 / 2.15 ▲ (lowest error yet, within noise of run 142's 2.16)**.
  **Elite cost raises turnover:** realms in turn Mesopotamia 4 → 4 / 5 / 5 (k 0.5 / 1 / 2; 42-67% in band), Egypt 3 → 4 / 4 / 5 (k 2:
  75% in band, error 0.8); court falls 76 → 86 a millennium at k 2, provinces going over to protectors 2.9 → 6.1. Costs: Egypt's
  unification later at k 1-2 (2211 → 1231-1331 BCE), Akkad later. **Egypt's intermediate periods still 0.00-0.01** in every
  variant: Egypt changes hands more often but still whole. Elite cost stays opt-in.
  **Next (to Nein): (b) heartland fault lines**, since Egypt still passes whole.
- **Heartland fault lines (opt-in `fault`; Nein 2026-11-25 approved (b) and added: some regions stay loyal, so the court is left with
  a patchwork of unconnected pockets, and in the confusion it must choose where its troops go, which opens vacuums for more to rise,
  and on and on).** Deep crisis `deepOf` = clamp(max((psi − 1.5)/1.5, (−treasury − 0.3)/0.7, owed − 0.3)); a province's power base
  `faultBase` = (0.5 + lords' share) × (1.3 − integ) × (1 + min(1, water leverage / people)). `nofaultseed`: with deep > 0.3, rebel
  seeds drawn from the whole realm by sqrt(people) × base (spacing 0.04 rad), and not kept loyal (`ev.fseed`). `novacuum`
  (`vacuumPass`, yearly in politics after cwPass, rsd 'vac'): each court province in a civil war rises at 0.02 × knob vac × deep ×
  base × exp(−2 × army cover), cover = Σ over the court's armies exp(−km/600) (0.3 while marching), halved if cut off; it joins a
  neighbouring rebel of that war or rises as a new rebel in it; the court's armies are drawn there (lostAt) (`ev.vac`). `nocutoff`:
  provinces not connected to the capital through the court's own land lose 0.02 integration a year. `nofaultreach`: a decisive winner
  of the court's fall with other rebels beside it takes the capital and what lies nearest it; each rebel takes what lies nearest
  its own land (BFS), the rest to their lords (`ev.fReach`). Probe `egypt2.js` prints the counts.
  Probe (seeds 1, 4, best + corruption + intelligence + fault): fault seeds 110-119 a history, vacuum risings 2-11, split falls 7-9;
  decades without a realm holding a third of the Nile 53 and 0 of 271 (seed 4's empire held Egypt 2600-1277 BCE; its civil wars
  broke out elsewhere). Smoke test passed (7.9 min); fingerprint unchanged.
- **Both sides feel the war (inside `fault`; Nein 2026-11-25: losing battles costs momentum on either side, making defection and
  secession likelier, weakening troops and raising corruption as people loot the dying carcass).** `noswing` (knob `swing`):
  momentum moves (1 + swing) times as far in civil wars and fades 7% a year instead of 15% while one lasts. `nodefect`: vacuum risings
  × (1 + 2 × the court's lost momentum); a rebel with momentum below −0.15 loses provinces beside the court's land back to it at 0.05
  × (−mom) × (1.2 − integ) × min(1, 0.3 + cover) a year (`ev.defBack`). `nocarcass`: corruption drivers + 0.3 × lost momentum.
  An army now covers about 250 km (exp(−km/250); at 600 one camp covered all of Egypt). Probe with elite cost k 1 (seeds 1, 4):
  vacuum risings 2-22, rebel provinces back 3-5, gaps 126 and 20 of 271 decades (before cover was narrowed).
- **War weariness and the calculated truce (opt-in `truce`; Nein 2026-11-25: wars can become a slog; a reunifier dies, a weak heir
  starts losing and offers a truce, the rebels accept if they cannot expect to take it all within their horizon; a weary,
  war-torn people wants peace).** `noweary` (knob `weary`): each engagement kills 0.25 × 0.02 of the people of the province on the
  losing side (0.4 of that on the winning side); o.wy = 0.92 o.wy + weary × (40 × dead / people + 0.01 at war), ≤ 1.5; stress part
  pV = 0.6 wy ("a people worn out by years of war"); armies × (1 − 0.25 min(1, wy)) via cwForce. `nocalc` (knob `thor`): each year
  of a war (2+ years, both sides states, civil wars included) the years each side needs at the war's pace (lands left / net gains a
  year) against its horizon thor × (5 + 30 × ruler's aggression) × (1 + momentum) × (1 − 0.6 wy); when neither expects to win in
  time, a truce at 0.15 × (1 + 2 × custom of treaties) a year, ×2 in a new ruler's first three years (`ev.truce`, `ev.truceC`); a
  civil truce leaves each side what it holds, truce 10-40 years.
  Probe (seeds 1, 4; best + corruption + intelligence + fault + truce + elite cost k 1): truces about 1,000 a history (34-39 civil),
  vacuum risings 1-6, rebel provinces back 0-1, fault seeds about 150, split falls 12-15; gaps 110 and 7 of 271 decades. Smoke
  test passed (7.9 min); fingerprint unchanged.
- **Run 146 (launched 2026-11-25, region, 24 histories to 200 BCE):** baseline; best + corruption + intelligence; + fault; + truce;
  + fault + truce; + fault + truce + elite cost k 1 ("all"); all without vacuum risings, without defection, without the calculated
  truce, without weariness; all with vacuum at half.
  **Result (5269fd0f, error; baseline 34.2% / 2.44; per millennium):** best + corruption + intelligence 32.8 / 2.23 ▲; + fault 27.8
  (▼) / 2.41; + truce 31.4 / 2.37; + fault + truce 25.0 (▼) / 2.45; all (+ elite cost k 1) 28.1 (▼) / 2.38; all without vacuum 2.40,
  without defection 2.39, **without the calculated truce 32.5 / 2.19 ▲**, without weariness 23.9 (▼) / 2.58, vacuum at half 2.34.
  Turnover: realms in turn Mesopotamia 4-5, Egypt 4-5 in "all" variants (all without the calculated truce: 5 and 5, 50% and 75% in
  band); Egypt intermediate periods still median 0.00 everywhere (in band 8-25%). Costs: Egypt's unification 2211 → 1200-1870 BCE,
  Akkad 1451 → 400-920 BCE. **The calculated truce is far too eager:** about 340-390 truces a millennium (12 in civil wars), in
  ordinary wars of conquest too, cutting short the gathering wars and the civil wars before the cascade builds: vacuum risings 1-3 a
  millennium with it, 19 without. Weariness helps (removing it +0.20 error). Fault seeds 45-56, split falls 3-6, rebel provinces back
  under 1.
- **Probe after run 146 (seeds 1-4, all without the calculated truce):** the gaps it found all come before Egypt's first unification
  (the scorer counts only after the first realm holds a third); afterwards each court fall passed Egypt whole: Mamiya → Shimusha 1894
  BCE (0.61 → 0.60), Sariya 1227 BCE (0.70 → successor 0.69), Shimusha 874 BCE (0.72 → 0.71). The rebellion that topples the court has
  one rebel inside Egypt (nearest the capital, joined by the surplus elite); the others rise in the outer provinces. Fiscal stress now
  shows in those crises (pT, pF with elite cost).
- **Calculated truce only in a slog (5a2af056):** weighed after six years without gains or with a side's weariness above 0.5.
- **Provinces decide for themselves whether to rise (7db55b1d, inside `fault`; Nein 2026-11-25: no set number of rebels; discontented
  areas spawn their own rebels if they have the supplies or think they can win).** `riseOdds(o,i,cover,mean people)` = discontent ×
  x/(1 + x); discontent = (1.2 − integ) × (0.6 + 0.4 × another people or faith) × (1 + hunger + 2 × corAt); x = means / (0.3 + cover) ×
  (1 + 2 × the court's lost momentum), means = (0.5 + lords' share) × (1 + water leverage) × min(2, sqrt(people / realm mean)) × (1 + 0.5
  walls) × (0.5 + solidarity); cover = Σ court armies exp(−km/250) (`coverAt`). Outbreak (`nofaultseed`): each province rises at
  clamp(1.5 × knob frise × max(0.3, deep) × odds, 0, 0.9); risen neighbours band together behind the most populous; the rest stay loyal,
  connected or not; none risen: the old seeds. Yearly vacuum risings: 0.1 × knob vac × deep × odds (cover halved if cut off). Probe
  (seeds 1, 2, 4; all with elite cost k 1 and the slog truce): vacuum risings 76-399 a history, split falls 45-63, civil truces 28-44;
  Egypt's empire in seed 2 went 0.97 → 0.74-0.83 in civil wars at stress 2.8-4.2 and won it back within 20 years; after first
  unification the leader was under a third in 2-6 of 35-59 fifty-year snapshots. Smoke test passed (10.6 min); fingerprint unchanged.
- **Run 147 (launched 2026-11-25, region, 24 histories to 200 BCE):** baseline; best + corruption + intelligence; all (fault + truce +
  elite cost k 1); all without the calculated truce; without provinces deciding (old seeds); risings at half and double (frise 0.5, 2);
  without vacuum risings; without defection; without weariness; without elite cost.
  **Result (ff7443e1, error; baseline 34.2% / 2.44; per millennium):** best + corruption + intelligence 32.8 / 2.23 ▲; all (fault +
  slog truce + elite cost k 1) 30.0 / 2.35; without the calculated truce 25.8 (▼) / 2.43 (with the slog rule the truce now helps);
  **without provinces deciding (old seeds) 28.9 / 2.33, realms in turn Mesopotamia 5 (63% in band), Egypt 4 (83%)**; risings at half
  2.36, at double 2.52 (worse); without vacuum 2.34; without defection 2.49 (defection helps); without weariness 2.41 (helps); without
  elite cost 30.3 / 2.29. **Egypt's intermediate periods now median 0.01-0.03** (was 0.00), in band 8-25%. Costs as before: Egypt's
  unification 1056-1771 BCE (reference 2211), Akkad 446-1271. Truces about 240 a millennium (11 civil), vacuum risings 50 (frise 0.5:
  340; frise 2: 8, since more rise at the outbreak), split falls 20, court falls 69. None of the packages beats the reference's error;
  they buy turnover and a first trace of intermediate periods at the cost of later gathering.
- **Rebels and reunification (09a3d06c; opt-in `rebel` and `reunify`; Nein 2026-11-25).** `rebel`: `notrust` (a rebel starts at
  mandate 0.35; victories +0.02 × province; −0.01 a year while a rebel at war, against +0.006 growth), `norebweary` (weariness gain × (1
  + 1.5 × (1 − mandate)) for rebels, × 0.6 for the court), `nodrift` (knob drift: a rebel's provinces beside the court's land go back at
  [0.05 × lost momentum + 0.03 × drift × weariness × (1 − mandate)] × (1.2 − integ) × min(1, 0.3 + cover) a year), `nocashin` (a rebel's
  horizon thor × (5 + 25 × mandate) × (1 − 0.6 wy), no momentum; ahead (net gains > 0) it may make a truce without the slog when it
  cannot take all in time and the court cannot win soon; × (0.4 + 0.6 give), give = clamp(0.3 + failOf + 0.4 (comp − 0.5) − 0.6 (aggr −
  0.5)); border provinces next to the rebels up to min(5, 10 × lead × give), `ev.cede`), `nocourtclock` (the court's weariness × in every
  province's discontent). `reunify`: `nopartclaim` (a civil truce calls `remember` on the court and its rebel pieces), `nonostalgia`
  (knob nost: `qolNote` at a civil war's outbreak records food per head × works and caravans per province, once a century; `qolPass`
  each decade: decline since, faded like the realm's memory; a failed attack by a claimant on such a province succeeds at 0.3 × nost ×
  decline (`ev.nost`); the claimant's own dead count × (1 − 0.5 decline); the war choice weight on a fellow successor × (1 + nost ×
  (own decline + target's decline [+ own lost trade]))), `nomerchant` (drops the lost-trade term). Probe (seeds 1, 2, 4, all + both):
  cessions 0-3 a history, gates to claimants 7-10, provinces drifting back 1-20; after first unification the leader under a third in
  16/50, 0/46, 0/52 fifty-year snapshots. Smoke test passed (10.7 min); fingerprint unchanged.
- **Run 148 (launched 2026-11-25, region, 24 histories to 200 BCE):** baseline; best + corruption + intelligence; all; all + rebels;
  all + reunification; all + both; that without cashing in, without drift, without fragile trust, without the decline in living,
  without claims after a partition, with the old rebel seeds.
  **Result (f1e10c63, error; baseline 34.2% / 2.44; per millennium):** reference (best + corruption + intelligence) 2.23 ▲; all 2.35;
  all + rebels 23.9 (▼) / 2.43; all + reunification 30.3 / 2.34; all + both 28.1 (▼) / 2.36; without cashing in 2.41, without drift
  2.47 (drift helps), **without fragile trust 32.2 / 2.33, Egypt's intermediate periods median 0.08 (33% in band)**, without the decline
  in living 2.42, without claims after a partition 2.41, **with the old rebel seeds 27.8 / 2.28 ▲, realms in turn Mesopotamia 5 (54%),
  Egypt 5 (79%), Assyrian pattern 38% ▲, but intermediate periods 0.00**. Intermediate periods (median) now 0.02-0.08 with provinces
  deciding (all + rebels 0.04, 29% in band; all + both 0.04, 33%), against 0.00 with the old seeds: provinces deciding breaks Egypt;
  the old seeds give turnover. Per millennium (all + both): civil truces 11, cessions 1, gates to claimants 7, rebel provinces back
  0.7, vacuum risings 40, court falls 65. **Still no variant beats the reference's error; the cost is late gathering throughout**
  (Egypt's unification 1166-1941 BCE against the reference's 2211 and the real 3100; Akkad 481-1161 BCE against 1451 and 2300).
  Proposed next (to Nein): probe the early gathering under all + both (3500-2000 BCE): whether the crisis machinery breaks the first
  would-be unifiers before they consolidate.
- **Probe `gather2.js` (seeds 1-3 to 2000 BCE; reference vs all + rebels + reunification):** the crisis machinery does not break the
  first unifiers more: civil wars and collapses of realms holding a fifth of a box, 3500-2000 BCE, reference 7 (Mesopotamia) and 25
  (Egypt), mean share lost 0.26 and 0.20; all + both 11 and 17, lost 0.07 and 0.20. Weariness stays under 0.1 and mandate at 1 in the
  leading realms. But realms gather less: a realm holding a third in 13 (Mesopotamia) and 15 (Egypt) of 93 fifty-year snapshots,
  against 25 and 28 in the reference. (Seed 1's all + both history had a herders' confederation overrun both boxes 2750-2650 BCE and
  break up: chaos between histories, not the packages.) Batch evidence on what delays Egypt's unification (reference 2211 BCE): elite
  cost alone k 0.5 2066, k 1 1331, k 2 1231 (run 145); fault alone 1376, truce alone (eager) 1201 (run 146); all without the slog truce
  1546 vs all 1366, all without elite cost 1771 (run 147). So the delay is in the gathering, from elite cost at k ≥ 1, the truce and
  some part of the fault lines.
- **Run 149 (launched 2026-11-25, region, 24 histories to 200 BCE; timing):** baseline; reference; all + rebels + reunification at
  elite cost k 0.5 (knob 1) and k 1; at k 0.5 without each of: provinces deciding, vacuum risings, cut-off pockets, split falls, the
  momentum swing, defection, looting, the calculated truce, weariness.
  **Result (3448cef1, error; Egypt two thirds under one realm, median BCE; Akkad):** baseline 2.44 (2321; 1786); reference 2.23 ▲
  (2211; 1451); all + both k 0.5 2.34 (1731; 986); k 1 2.36 (1466; 1001; intermediate periods 0.04, 33% in band); at k 0.5 without:
  provinces deciding 2.43 (1401; 1031), vacuum 2.37 (1351; 1106), cut-off 2.38 (1246; 1011), split falls 2.34 (1721; 926), swing 2.41
  (1691; 1231), defection 2.45 (1576; 856), looting 2.41 (1761; 931), **calculated truce 2.27 ▲ (1606; 1236)**, weariness 2.41 (1071;
  851). **No single part causes the late gathering:** every variant with the packages unifies Egypt between 1071 and 1761 BCE and
  Akkad between 851 and 1236, against the reference's 2211 and 1451; switching any one part off does not bring it back (the spread,
  ±300 years, is within the noise of a median of 24 histories: same part, run 148 vs 149, differs as much). The gathering was already
  late in the reference (real 3100 and 2300); the packages add breaking without adding gathering. Realms in turn 2-4 in both boxes
  here (fewer than in run 147-148, noise and k 0.5).
  **Proposed next (to Nein):** strengthen gathering by material means rather than weaken breaking; candidate: the river as a highway
  (armies, messengers and grain move fast along a navigable river, so a valley's court reaches farther and binds faster: the Nile and
  the Euphrates were the roads of their unifiers).
- **Weather and rivers, as they stand (checked 2026-11-26 for Nein):** yearly rain anomalies with wet and dry runs (`weather`, climVar,
  climPersist), regional dry epochs of decades (the 4.2 ka kind), slow climate drift and humid periods; river size (`w.rvF`) is
  recomputed every 50 years from the half-century's rain (`waterPass`). A drying climate shrinks rivers; a single low-flood year is not
  modelled (the Nile's flood comes from rain far upstream and yearly flow is not kept). Nein: yearly river flow and low-water years
  for the far future.
- **The river as a highway (05eeb3fa, opt-in `river`, knob `river`; Nein approved 2026-11-26).** In `distProv`, a step between
  neighbours one of which is downstream of the other (`w.down`) costs × (1 − 0.6 × knob × nav × boats), nav = clamp((min rvF − 0.2)/0.5),
  boats = 0.5 + 0.5 × sailing known. Egypt box: 19 of 69 provinces have a downstream link with both ends rvF > 0.3; Mesopotamia 15 of
  194. Only the court's distance for now (taxes, hold, rebel odds, overextension); armies marching faster on the river and grain moved
  on it not built. Knob above 1.67 saturates (step cost floor 0.1).
- **Next, agreed with Nein 2026-11-24 (to design with him after run 139):** (1) trade ties: provinces whose trade runs mostly to a
  neighbour lean toward it (less threat on that border, likelier to go over in a crisis or invasion); merchant regimes (trade
  income, merchant command weight) spread by influence (trading posts, treaties, clients), shallow and route-dependent. Hook:
  goods trade already keeps per-pair worth (`o.gp` in society.js goodsPass). (2) Dynastic kinship: royal marriages (already in
  `diplomacy`, chronicle only) and cadet branches make houses kin: fewer wars between them, readier alliances, less threat,
  prestige of old houses; extinction gives inheritance (peaceful union) or succession wars.
- **Later (Nein 2026-11-24): leaders learning from crises in general and codifying it** (law codes, manuals of statecraft and war:
  Hammurabi, the Arthashastra, Sunzi). Natural home: what a ruler learns passes in part into the realm's records (`s.recK`,
  `s.law`, `o.info.memo`) where writing exists, so the next ruler starts above where he otherwise would; not built.
- **Horse probe (seed 1, full world):** horses were first tamed in 2952 BCE at about 43 N, 120 E (the Liao, beside North China's
  farmers), not on the Pontic-Kazakh steppe (Botai 3500 BCE; modern horses from the Volga-Don about 2200 BCE: Librado et al.
  2021). Horse herds then spread only among North China's farmers (the provinces next to them are farmed, 0.99) and reach 69 E
  only by 750 BCE. Taming needs keepers (herders) and cold winters (full at -12 C), and the western steppe is farmed in the model
  (farming states on the Pontic steppe), so no keepers there. A world-model issue to raise with Nein; not touched.
- **Rise and fall probe (seed 1, region):** the Mesopotamian empire founded 3730 BCE still holds in 600 BCE all of Mesopotamia
  and Anatolia, 78% of the Levant, 60% of Iran (10M people, cohesion 0.88 → 0.39); Egypt's first kingdom lasts 4000+ years
  (cohesion near 1). Civil wars happen (11 in that empire) but only peel off the periphery (civilWar sorts provinces by
  distance from the capital); collapse needs cohesion below 0.12. Hence no Persian pattern (Egypt never weakens).
- **Egypt capacity probe (seed 1, region):** floodplain 27,876 km² (real about 30,000); capacity per km² of floodplain 23 (5000
  BCE), 35 (3500-1500), 55 (1000) against a real 50 (2500) to 100 (1250); **salt on Egypt's farmland 0.18 (5000 BCE) → 0.8
  (1000 BCE), cutting farm capacity about half** (salt rule: irrigated + dry + crowded, no flood timing or drainage; the Nile's
  late-summer flood flushed salt yearly, Sumer's spring flood and poor drainage did not: Jacobsen & Adams 1958, Powell 1985).
- **Egypt probe (seed 1, region):** capacity K 0.53M at 4500 BCE, 1.0 at 3500, 1.3 at 3000, then flat 1.0–1.5M to 1000 BCE;
  people track K; irrigation knowledge 0.99 from 4500 BCE. Irrigation as knowledge triples floodplain capacity at once, so the
  valley fills 2–3× too early (state gate opens) and nothing raises capacity later.

**Ports (1dc70b68, now opt-in `SW=ports`; run 116: −2.3):** a realm's port is its most populous coastal
province with sailing above 0.5, not only a coastal capital. Probe seed 1 at 500 BCE (before): 2 of the 25 largest states had
a coastal capital and any sea link; trade income was 1–8% of taxes; the eastern Mediterranean coast (30–42 N, 12–37 E) held
3.7M people. Smoke: about 4,800 sea links a millennium. Not yet built (to talk through with Nein): port towns growing with
the trade through them; grain as a traded good (Athens fed on Pontic grain), which would let ports live past their fields.

Batch target notes (run 114 reference): Egypt first kingdoms median 4576 BCE (real 3400, too early) but unification 916 BCE
(real 3100, too late); Indus first states 4% in band; Mesopotamia a third of the people 1691 BCE (real 2600).

**Built after run 112 launched (444072b; tested in run 113):** crop strains bred to the rain season (switch `noseas`, knobs
`sadapt` = breeding rate, default 5% of the gap a decade grown, 1.5% tried; `smis` = mismatch scale 0.25). A crop reached
through a neighbour takes its strain; fit × exp(−(mismatch/0.25)²); farming know-how crosses at 0.1 + 0.9 × the same factor
for the neighbour's grown strain. Replaces the diluted per-step penalty (kept under `noseas`; `noseas` gives the old history
exactly, fingerprint 2642f2ed8708 at 7000 BCE seed 1). Seed 1 (on / off, BCE): Karanovo 6930 / 7660, Koros 6400 / 6690,
Saxony 5660 / 5880, Paris 5010 / 5250, Wiltshire 4460 / 4680; Anatolia and the Aegean unchanged (their early start is not a
season shift); Apulia and Valencia, already late, a little later. Also: the rally sum reads one key per unit (exact; pass
−20%). Profile to 2500 BCE: politics ~17%, rally ~11%, techStep ~8%, band wars ~8%, computeK ~6%.

**Next steps, in order (plan agreed with Nein 2026-11-22/23):**
0. Testing plan: done (regional mode, continuous error, scorecard, streams, saved-start check, arrivals). Left: score run 123
   (world baseline after the reset; Fertile Crescent rows read from the world), build the arrivals table from it
   (`tools/arrivals.js --write`), then a regional batch with arrivals vs `noarrive`. Bands await Nein's review. Send Nein
   GitHub links for big changes.
1. **Rise and fall: talk through with Nein how a new power gathers a broken region (see step 4b above).** Earlier note: Rise and fall, candidates to talk
   through: civil wars that can take the centre (the strongest rebel takes the capital and founds a new realm); why usurpers
   never fire; cohesion of old cores wearing down under elite overproduction; hill and desert peoples (Gutians, Amorites,
   Kassites, Aramaeans) taking weakened lowland cores, as steppe hordes already can. Capacity and onset, **proposed:** built works (landesque capital) as a
   stock per province: built by labour where irrigation is known (faster with a state's corvée), decaying without upkeep, and
   raising floodplain capacity only as far as built (replacing irrigation knowledge in computeK's `(1+fp*(0.25+2.2*irrig*AQ))`).
   Expected: crowding and states delayed by centuries without a calendar; states grow their own land base (Egypt 1.6 → 2.9M);
   collapse has a lasting cost. And salt driven by flood timing and drainage instead of irrigated + dry + crowded.
2. Speed: Nein put it off (2026-11-21); options under "Speed" in the backlog.
3. Steppe threat: built, in run 114.
4. Mixed country: moot (the herders' label blocks no one; see the probe).
5. Irrigation from springs, terraces and (later) qanats in dry hill country.
6. State test on the farmed land: built (farmed share), in run 115.
7. Sea economy: ports alone did not help (run 116, opt-in); port towns, grain trade and seaborne colonies to talk through.
8. When the NOAA monthly data arrives: real summer-dryness field.

## Agreed but not built (backlog)

- **Speed (options put to Nein 2026-11-21):** (a) a Turbo speed in the page: the simulation takes most of each frame and the
  map redraws about once a second (now 26 ms of each frame at Max, map every 110 ms); no change to histories. (b) Exact
  speed-ups from the profile, each checked by fingerprint (rally done). (c) Start from a saved history at about 4000 BCE in
  the page (half of a run is before then); needs the snapshot size measured. (d) The background worker (smooth page, same
  throughput as Turbo; large restructure). (e) Several cores for per-province passes (1.5–2×; SharedArrayBuffer needs
  headers GitHub Pages does not send). (f) Slower clocks for slow passes in the farming era (changes histories; batch).

- **Transmission network** (the big consolidation): one contact weight per pair of places per year (border, people,
  caravans, roads, same realm, war, sea links between busy ports), with each kind of thing (techniques, faith, disease,
  crops, skills, people) applying only its own receptivity. Roads and ports then work for everything at once.
- One rule for learned habits (nine separate habits today); three stability numbers (asabiya, legitimacy, stress grouped
  by kind, instead of a 19-term sum); one review per ruler weighing all options.
- Audit leftovers: one riding system (people-level and province-level riding both exist); one threat memory (state-level
  `o.thr` is dead unless the opt-in `threat` switch is on); `o.cells` means province count then area within one year;
  horde prestige fades 2% a year regardless; three copies of the move-people code; 15 opt-in switches that never run
  (adopt or delete each); one list of each realm's provinces instead of 26 full-map scans.
- Frontier horsemen still almost never rise or take a throne; saddle-and-court outcomes should come from that rising.
- Rulers and councils (sword, altar and purse triangle; ability, boldness, good faith; dynastic drift; councils shaped by
  how they arose); horses as a traded good with border markets; hired steppe fighters; relay stations for hordes that think
  in kind.
- Roads: disease and faith along them, raids running deep along them, relay stations; sea routes and ports as long links.
- Testing: use saved starts in the batch workflow (share prehistory between versions, fewer seeds per question); shape
  targets.
- Interface (after testing tools): group tabs; "why" in Inspect; Setup toggles for new features; innovation ranking;
  end-of-run overview; follow a state; scrub bar; routes and armies as lines; background worker. The States tab has been
  checked only on the grid map.
- Chronicle: write about small realms (city-states, islands) by people and cities, not land area (low priority for Nein).
- Open tuning: population stall after 1 CE; largest state at 1000 BCE too big; gunpowder and American/West African states
  never happen.
