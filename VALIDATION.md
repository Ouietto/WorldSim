# Asabiya v0.7 validation — 2026-10-21

The deliverables are identical `index.html` and `asabiya.html` pages, rebuilt
from `src/` using `python src/build.py`. Rules and explicit simplifications are
in `MODEL.md`. A local pre-change backup is retained in the original workspace
and excluded from version control and the deployed site.

## GitHub Pages packaging

- Both entry points and the separate `_site` build have identical contents.
- The deployment folder contains only `index.html`, `asabiya.html` and
  `.nojekyll`; source files, development reports and local backups are excluded.
- The Pages workflow runs syntax, climate, society, transport/politics and
  generated-world checks before deploying from `main`.

## Focused checks

- All JavaScript source files pass Node syntax checks; the standalone build succeeds.
- `node src/climate.test.js`: observed numeric climate registration, units,
  interpolation, missing data and representative Earth rainfall checks pass.
- `node src/society.test.js`: household/public food accounting, settlement,
  actual sponsored colonization, finite campaigns and ships, cultural minorities,
  displaced people, inheritance, collapse and deterministic replay pass. A
  220-year political scenario exercises multiple rulers. Actual state and
  province inspector functions render finite values, including the new fields.
- `node src/dynamics.test.js`: actual animal transfers and fodder, staged breeder
  diffusion and animal accounting, river directions and round trips, separate
  supply routes, transverse crossings, mountain defenses, transport-dependent
  frontiers, viable urban steppe enclaves, city-state classification, succession
  fragmentation, maintained preparedness in peace, clan departures, bounded
  raider learning, elite bargains, migrant grants and broken compacts pass.
  Recruitment into mixed mobile coalitions preserves people, animals and
  cultural minorities. Coastal investment needs actual funds. Tests execute the
  actual city-filter function against towns with different rural/urban populations.
- The developed mixed-frontier scenario runs 300 years twice with identical
  seeded results, including real fiscal, war and succession interactions.
- `node src/generated.test.js`: a 250-year developed-world scenario on generated
  terrain passes conservation and finite-stock checks across governments,
  coastlines and river networks.
- Earth batch and generated-world command-line entry points initialize and
  advance successfully. Their loaders include the new dynamics module.

The final habitat checks ensure that buffalo and camel founders have viable
locations and can breed over twenty years. Buffalo suitability includes river
water, and camel carrying capacity includes arid scrub. These corrections
followed the long development runs below; they have focused regression coverage.

## Long development histories

`node src/verify.js 7 1500` reached 1500 CE after 10,500 simulated years. State
values are checked annually; province values, animal stocks, migrating cohorts
and resource ledgers are checked periodically. Final annual economy discrepancy
was approximately 0.0000012 person-year rations. The history exercised clan
separations, elite defections, migrant admission, leagues, sponsored settlement,
failed settlement and succession fractures. A snapshot is preserved in
`validation/v07-seed7-development.json`.

This first history preceded the directed trade upgrade. The second development
history, `node src/verify.js 23 1500`, also reached 1500 CE with directed trade.
Its final food discrepancy was approximately 0.0000012 annual rations and its
animal-phase discrepancy approximately 0.00000008 animals. It exercised 50
admissions, one broken compact, 91 leagues, 137 clan departures and 78 elite
defections. Results and checkpoints are preserved in
`validation/v07-seed23-development.json`. Regional-first dates in these files
use an intermediate classification that could count a large city state; the
final kingdom-consolidation diagnostic excludes city states. Small final diagnostic,
canal-maintenance, enclave and animal-habitat corrections are covered by the
focused and generated-world scenarios; long-run figures are development
snapshots, not a claim that every final rule has been historically calibrated.

## Browser checks

The rebuilt standalone page loads, advances and pauses. Hidden, capitals,
major-plus-capitals and all-cities choices work, along with the independent
names switch. A real seeded province displays breeding cattle, traction and
pack capacity separately from riding access. The added province readouts are
visually readable. `asabiya-v07-preview.png` records the browser check.
Temporary browser tabs and the local preview server are closed after checking.

## Remaining limits

These checks establish software behavior and accounting, not historical truth.
Technology timing, regional consolidation and the distribution of polity sizes
remain uncalibrated. Development histories still produced very early paper,
weapons and some institutions. Spatial clans, local elite interests and two-part
provincial culture/ancestry are coarse proxies. River navigation, passes and
seasonal access are inferred from a roughly 100-km grid. The modern observed
climate baseline is not a Holocene reconstruction. Climate Lab's encrypted
numerical engine has not been recovered or copied.
