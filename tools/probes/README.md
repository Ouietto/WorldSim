# Probes

Diagnostic scripts: each evals the simulation's `src/*.js` the way `tools/run1.js` does and prints a readout. They are for
diagnosis only (single histories mislead; judge changes by batches). Run from the repo root with the same environment as a
batch variant, for example:

```
REGION=neareast WORLD=prov SW=nowinrain,noardfal,works,rise,nojudge,corrupt KV=wbuild:0.5 node tools/probes/gather.js 1 -500
```

Most take `<seed> <endYear>`. `SRC=<dir>` points a probe at another copy of `src/` (a worktree, or a copy with debug prints).
Regional histories to 1000 BCE take roughly 10-25 minutes on a 2-core machine.

## Rise and fall (2026-11-24)
| Probe | What it shows |
|---|---|
| `diag.js` + `diagsum.js` | who holds Mesopotamia and Egypt decade by decade, the leader's power against rivals, provinces lost and regained (`diag.js <seed> <out.json>`, then `diagsum.js <out.json>`) |
| `gather.js` | the gathering phase: decades with no realm holding a third, the top realms' wars, attacks, wins, and spell lengths |
| `cwout.js` | civil wars in realms of 8+ provinces: the court's condition at outbreak and how each ended |
| `newreb.js` | rebel states' first years: tax, distance, burden, treasury (found the newborn-tax bug) |
| `claimw.js` | claim wars between successor states and their outcomes |
| `crisis.js` | the leading Mesopotamian realm's share through its civil wars |
| `psi2.js` (`psi.js`: full world) | the leading realm's stress index and its biggest parts, with civil-war depth |
| `front2.js`, `front3.js`, `front4.js` | the metaethnic frontier band, threat cohesion, and who is across the line |
| `learn.js` | rulers' and generals' war skill, momentum and veterans |
| `cor.js` | corruption of the largest states, with its drivers and the reform counters |
| `nan.js`, `nan2.js`, `nanS.js` | hunting non-finite battle odds (found the sea-attack NaN) |

## Batch readers (run inside a worktree with the batch cache extracted to `reports/`)
| Probe | What it shows |
|---|---|
| `evs.js <worktree> ev.a,ev.b` | medians of event counters per variant |
| `pairs.js <worktree> keys` | per-seed values of chosen keys per variant |

## Older probes
`egypt.js`, `egyptK.js`, `ffit.js`, `works.js` (Egypt capacity, flood timing, works); `necomp.js`, `necomp2.js` (Near East box
readout); `stfail.js`, `fsh.js`, `turf.js`, `front.js` (state test, farmed share, sod, farming front); `horse.js` (horse taming
and spread); `butterfly.js` + `divcmp.js` (same-seed divergence); `arrtest.js`, `region.js` (arrivals, regional mode);
`empires.js`, `nob.js`, `wargoal.js`, `thr.js`, `trade.js`, `knob.js`, `lon.js`, `sdpath.js`, `snaptry.js`, `hashchk.js`,
`wdiff.js`, `best.js` (assorted; read the file before use, some may predate later code changes).
