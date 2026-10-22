# Asabiya v0.8 validation — 2026-10-22

The current release adds `ecology.js` and `frontiers.js` to every browser and
command-line loader. The Pages workflow includes the new frontier suite.

- JavaScript syntax, numerical climate checks, society conservation and
  deterministic replay, transport/politics, and the generated-world suite pass.
- `frontiers.test.js` checks crop access and staged diffusion, viable Andean
  highland crops, terrace and dry-plateau water benefits, practical technology
  bottlenecks and actual firearm stocks.
- Public freight cannot spend a remote capital's reserves through uncontrolled
  transit. Public/private route capacity, transport losses, local wall upkeep,
  deterioration, repairs and breaches are exercised against actual resources.
- Scouted movement routes avoid an intact wall and prefer a usable gap.
  Planning cannot open a breach or spend supplies. Joining clans and retreating
  coalitions transfer actual people and herds; a strong opponent can resist.
- Foreign-service tests reserve existing warriors, remove overseas casualties
  from their home base, return bounded experience and partial knowledge, and
  transfer equipment from real stocks. Clan incorporation ends an outstanding
  contract without duplicating its contingent.
- Tribute is a shipment, with delayed arrival; repeated missed payments can
  break protection. Expulsion preserves surviving refugees and their herds.
  Selective adult mortality changes sex composition while preserving child
  cohorts. Funded coercion/contact can shift a cultural majority within sixty
  simulated years while keeping ancestry separate.
- An aging confederation gains less strain with delivered patronage; age alone
  does not dissolve it. Display filters preserve ownership and random state,
  and test proximity plus ten years of visibility grace.
- An 80-year integrated scenario combines actual military contracts, war,
  migrating cohorts and annual food accounting. The existing developed
  mixed-frontier scenario runs 300 years twice with deterministic results.
- The developed generated-world scenario passes 250 years of food/animal
  accounting and bounded government fields. It ends with 63 surviving
  polities for its fixed seed; this count is a software observation, not a
  historical target.
- A development Earth history for seed 7 advances 1,101 years to 7900 BCE with
  finite stocks and a final food discrepancy of about 0.00000006 annual
  rations. Its report is `validation/v08-seed7-early-history.log`. It exercises
  early subsistence, record keeping, irrigation and succession; it does not
  validate late empires or technology dates. A preceding longer attempt found
  floating-point overshoot in aggregated payroll funding; payroll is now
  clamped to its defined 0–1 range and the generated suite checks that bound.
- The local browser advances over a thousand years without console errors.
  Map view, confederation visibility, city filtering and names controls work.
  Both standalone entry points and a separately built Pages folder are checked
  for identical bytes.

Remaining calibration work includes multi-seed first-state distributions in
Iran, the Andes and the Pampas; steppe occupation rates; confederation duration;
the frequency and direction of migration cascades; and advanced technology
chronology. Conditional scenario checks establish that these mechanisms can
operate, not that their default frequencies reproduce history. No complete
v0.8 Earth history to 1500 CE is claimed here.

## Archived v0.7 validation — 2026-10-21

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
