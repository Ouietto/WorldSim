# v0.12 validation

## Scope

This release implements the first three corrections in
[CONSOLIDATION.md](CONSOLIDATION.md), military household settlement and the
local-town formation correction. The separate persistent-siege redesign is
deferred. Climate, epidemic rates and general collapse probabilities have not
been retuned to obtain a target empire.

## Mechanism and interface checks

The ten suites in the Pages workflow pass locally. They cover climate data,
society and accounting, transport and political dynamics, frontiers,
epidemics and civic networks, map gestures, civic development, settlement,
consolidation and a generated world. JavaScript syntax checks also pass.

The consolidation scenarios check retained officials and garrisons, actual
local payroll, funded integration without duplicating troops, finite paid
seasonal musters, source-household casualties, harvest costs, protection
bargains before charters, allied contingents withheld from their home army,
local market-town foundations and military household settlement with gradually
hereditary service grants. The generated-world scenario runs for 250 years
with food and animal accounting, bounded institutions and actual epidemics.
These are controlled scenarios, not unassisted historical runs.

The browser preview uses a clearly labeled controlled scenario. Polity and
province inspectors, the campaign-target link and Largest map focus are
checked at desktop and phone widths. No browser errors or warnings are
reported. Existing map-gesture tests cover pinch anchoring and pan transitions.
The four standalone build outputs have identical bytes.

## Old-source comparison

An additional unmodified v0.11 Earth run uses seed 7 and source `f2b0f2d`:

```
node src/consolidation-report.js 7 -2700 f2b0f2d
```

At 2700 BCE this run has 10 settled polities, averaging 1.4 provinces, with a
historic maximum of four provinces. There are 14 settled-state foundations
across the run. All 1,511 observed holdability checks fail, and there are no
rural agreements, rural incorporations or civic unions. Mean payroll fulfillment
is 96.5% and institutional health 88.7% at the endpoint. The shortage of local
foundations and first-expansion opportunities is not explained by universal
bankruptcy at that checkpoint. Raw observations are in
`validation/consolidation-v11-seed7.jsonl`.

At shared checkpoints, the same history seed gives these bundled-release
comparisons:

| Checkpoint, seed 7 | v0.11 settled polities | Initial v0.12 settled polities | v0.11 historic maximum provinces | Initial v0.12 historic maximum provinces |
|---|---:|---:|---:|---:|
| 4500 BCE | 2 | 82 | 2 | 9 |
| 3000 BCE | 8 | 255 | 4 | 12 |

The initial v0.12 local-town pathway has produced 43 foundations by 4500 BCE and 127
by 3000 BCE. These global pathway counts exclude ordinary rural foundations
and political breakaways. The town shortage is substantially relieved in this
run, while territorial growth is slower. More foundations alone do not prove
that their density, location or dates are realistic. A shared seed does not
pair individual events after changed rules consume different random draws.

## First-pass Earth histories through 1 CE

The first-pass diagnostics use Earth seeds 7 and 23, default parameters,
and unassisted histories from the normal 9000 BCE start through 1 CE,
using Node v24.19.0 on Windows:

```
node src/consolidation-report.js 7 1
node src/consolidation-report.js 23 1
```

These first-pass logs are `validation/consolidation-v12-initial-seed7.jsonl`
and `validation/consolidation-v12-initial-seed23.jsonl`. Their loaded-module
digest is `d1fefb0b5f041098c03c496fbc91454d6dec2b481ef5d92735636a44cef092fb`.
The model from that build is preserved, with normalized line endings, in
`validation/v12-initial-core.js` (digest
`91be6d76397fedc47a1d5025c10daed4a332a9471e941c2faa4f5fc37ae0534f`).
It can be replayed with the current assets by setting
`WORLDSIM_MODEL_SNAPSHOT=validation/v12-initial-core.js` for the reporting
process. The different archive hash reflects the standalone build's normalized
source formatting; the early calibration logs are not claimed to use the final
revised model.

| First-pass endpoint, 1 CE | Seed 7 | Seed 23 |
|---|---:|---:|
| Largest settled polity ever, provinces | 20 | 25 |
| Largest direct population share, Nile Egypt | 20.3% | 12.5% |
| Largest direct population share, North China | 13.9% | 19.9% |
| Largest direct population share, wider China | 8.2% | 9.9% |
| Regions ever meeting the diagnostic consolidation threshold | 0 | 0 |
| Military household settlements | 0 | 0 |

These runs recover local foundations and permit more conquest and rural
incorporation, but do **not** achieve the requested regional consolidation by
1 CE. Inspection exposed two remaining implementation issues: central staffing
demand still duplicated direct administration in delegated provinces, and
military grants excluded populated rural districts already held by the state.
The revised model corrects both, with focused accounting, land-capacity and
troop-reserve scenarios. It retains the unassisted first-pass failures as
evidence rather than presenting them as a successful final calibration.

## Revised-model protocol

A fresh seed 23 Earth history runs through 1 CE after those corrections; its
output is `validation/consolidation-v12-final-seed23.jsonl`. Its source digest
must match the final loaded modules, independently of the initial snapshot.
Replay the final model with `node src/consolidation-report.js 23 1` and no
snapshot override. The first-pass table above is not its outcome.

The reporter consumes no extra random draws. It checks food accounting and
finite, nonnegative material and institutional fields every 50 years, records
regional audits and prints snapshots every 500 years plus the endpoint. Each
snapshot includes a SHA-256 digest of the loaded model modules. Mediterranean
foundations are counted by local, mobile-pastoral and migrant origin.
Here "local" includes settled political breakaways; it is not a full audit of
the founders' cultural ancestry. The separate local-town-pathway counter
records spontaneous farming and market foundations.

The diagnostic definition of regional consolidation is at least 60% of the
region's resident population under one settled government, at least five
provinces, institutional health at least 55%, administrative skill at least
30%, and no more than half the polity's population in delegated provinces.
Tributaries are not counted as direct territory. This is an explicit diagnostic
threshold, not a universal historical definition of centralization. The report
distinguishes the first qualifying checkpoint from endpoint control and from
the maximum territorial share. The regions use the simulator's existing
geographic sets, including Nile Egypt, North China and wider China.

Two seeds can expose regressions and demonstrate possibilities. They cannot
establish a reliable frequency of unification, validate historical dates or
justify forcing China or Egypt to unify by a programmed deadline.
