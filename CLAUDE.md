# Asabiya (WorldSim): notes for Claude

A world history simulation (World3-style material model plus cliodynamics). Nein owns the project and its design.

**Start every session by reading `docs/handoff.md`** (state of play, how to test, every run's results, what is next). Current
design work is in `docs/corruption-plan.md`. Probes are in `tools/probes/` (see its README).

## Standing rules
- Work on branch `claude/rebuild-from-v052`. Push only to `claude/` branches. Update `main` only for the test build under
  `/try/current/` (worktree of origin/main, copy index.html to try/current/index.html, commit, push HEAD:main).
- Commit and push before ending a turn; leave no untracked or modified files. Never `git reset --hard` (revert instead).
- Talk designs through with Nein first; build when he says go. Every feature has an off switch (`SW=no…`, or an opt-in name
  such as `works`, `rise`, `corrupt`), strengths are knobs (`KV=name:value`). Nothing hardcoded: behaviour flows from
  incentives and material conditions, never from labels or calendars.
- New features stay opt-in until a batch shows them sound; keep defaults unchanged unless fixing a bug, and check the
  default fingerprint (below) after every change.
- Send Nein GitHub links for big changes. Write concisely; Nein dismisses fixes that don't address observable behaviour.
- Never kill processes by a pattern that can match your own command line; kill by PID. No long foreground sleeps; run long
  jobs in the background and wait with until-loops.
- Use `ymod` for remainders of negative years.
- Keep personal information out of the repo. Don't reverse-engineer World Climate Lab.
- Untrusted downloads go in their own folder; run Python on them with `-I`.
- Keep `docs/handoff.md` current (results of each run, what was decided, what is next).

## Code conventions
- Simulation code: `src/hist.js` (main loop, politics, war, growth), `src/society.js`, `src/herds.js`, `src/crops.js`,
  `src/tech.js`, `src/world.js` (land, climate, switches `swOn`, knobs `knob`), `src/provinces.js`. Build the page with
  `python3 src/build.py`.
- Random streams: a new pass that draws must call `rsd('name')` first in `stepG`; per-entity loops call `rk(key)`.
- A comment placed mid-line hides the rest of that line from the build; a new function with an existing name silently
  replaces the old one.
- Passes run on fixed years of the decade: a yearly rate inside a decade pass is ten times too slow.

## Testing
- **Batch:** edit `tools/ensemble-request.json` (variants with env strings), commit, push: GitHub Actions runs it (pushing a
  changed request cancels a running batch; an unchanged request starts nothing). Results land on branch `ensemble-results`.
- **Score a batch:**
  ```
  git fetch -q origin +ensemble-results:refs/remotes/origin/ensemble-results
  git worktree add <dir> <batch commit>
  cd <dir> && mkdir -p reports && git -C <repo> archive origin/ensemble-results cache | tar -x -C reports
  timeout 280 node tools/ensemble.js --variants tools/ensemble-request.json --seeds 1-24
  ```
  Then remove the worktree (`git worktree remove --force <dir>`).
- **Regional mode** (the current focus, the Near East): `WORLD=prov REGION=neareast SW=nowinrain,noardfal` is the baseline.
  Best set-ups so far: `SW=nowinrain,noardfal,works,rise,nojudge KV=wbuild:0.5` (error 2.16, run 142) and the same plus
  `corrupt` (error 2.22, realms in turn 4 in Mesopotamia and Egypt, run 143).
- **Default fingerprint:** `WORLD=prov REGION=neareast SW=nowinrain,noardfal node tools/run1.js 1 -2500` must print
  `"chk":"a1a55711e6ff"` unless a change is meant to alter the defaults (it was 2e9870aeb792 until the 2026-11-27 NaN fixes).
- Single runs: `node tools/run1.js <seed> <endYear>` with the env; smoke test `node tools/smoke.js --seeds 1,2 --end -1000`.
