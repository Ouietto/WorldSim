# Checking the model against history

`tools/ensemble.js` runs many Earth histories in parallel and scores them against the targets in `tools/targets.js`.

```
node tools/ensemble.js                          # 16 seeds to 1500 CE, the working tree
node tools/ensemble.js --seeds 1-24 --end 1     # more seeds, a shorter run (later targets are skipped)
node tools/ensemble.js --ref HEAD~1             # also run another commit on the same seeds and compare
node tools/ensemble.js --env P_pull=0.5         # a variant: slider overrides (P_<name>) or ablation switches (ABL=...)
node tools/ensemble.js --base-env ABL=sack      # compare against the working tree with something switched off
```

Each run is cached under `reports/cache` by its source files, seed, end year and settings, so repeating a baseline costs nothing. Reports are written to `reports/ensemble-<time>.md` and `.json`.

## Reading a report

- **In band:** share of seeds whose value falls inside the plausible band. The headline score is the average over all targets.
- **Median, middle half:** typical value and spread across seeds.
- **Never:** seeds where the event never happened before the run ended.
- **Closer / farther** (comparisons): seeds where the new version lands nearer the band (or, inside it, nearer the real value) than the old one, and the reverse. Seeds diverge chaotically after a few centuries, so a change only means something when most seeds move the same way.

Histories are chaotic: dates such as the first iron or paper vary by about ±1,000 years between seeds of the same version. Judge a change on 16 or more seeds, never on one.

`tools/run1.js <seed> <end> [srcDir]` runs a single history and prints its measurements, including a hash of the final map; two versions that should behave identically (a pure speed-up) must give the same hash.

## Targets and sources

Bands are wide on purpose: they describe a plausible history, not a replay of ours.

| Target | Real | Band | Notes and sources |
|---|---|---|---|
| Mesopotamia: first kingdom holding 30% of the region's people | 2600 BCE | 3200–2000 BCE | Early Dynastic kings of Kish and Uruk; Akkad about 2334 BCE (Van De Mieroop, *A History of the Ancient Near East*). |
| Egypt | 3100 BCE | 3400–2700 BCE | Unification under the First Dynasty (Shaw, *Oxford History of Ancient Egypt*). |
| Indus | 2600 BCE | 2900–2000 BCE | Mature Harappan phase (Possehl, *The Indus Civilization*). Whether it was one state is debated. |
| Yellow River | 1900 BCE | 2200–1500 BCE | Erlitou, then Shang (Liu & Chen, *The Archaeology of China*). |
| Mesoamerica | 500 BCE | 1200 BCE–300 CE | Olmec centres, Monte Albán, early Maya kingdoms. |
| Central Andes | 200 BCE | 900 BCE–600 CE | Chavín horizon to Moche and Tiwanaku. |
| Western Europe | 50 BCE | 600 BCE–500 CE | Roman Gaul; the band allows earlier Celtic or later Frankish states. |
| West Africa | 700 CE | 300–1100 CE | Ghana (Wagadu); Mali later (Levtzion, *Ancient Ghana and Mali*). |
| Writing | 3200 BCE | 3500–2800 BCE | Uruk proto-cuneiform; Egyptian hieroglyphs. |
| Iron | 1200 BCE | 1600–800 BCE | Widespread iron working in Anatolia and the Levant. |
| Coinage | 600 BCE | 900–300 BCE | Lydia, about 630 BCE; Chinese spade money about the same time. |
| Paper | 100 BCE | 400 BCE–300 CE | Early Han paper; Cai Lun's process 105 CE. |
| Gunpowder | 1200 CE | 950–1400 CE | Song dynasty weapons. |
| World population 3000 BCE | 30 M | 14–60 M | McEvedy & Jones (1978) 14 M; HYDE 3.2 and others higher. |
| 1 CE | 230 M | 170–300 M | McEvedy & Jones 170 M; Durand 270–330 M; HYDE about 230 M. |
| 1000 CE | 290 M | 240–350 M | McEvedy & Jones 265 M; Biraben 254 M. |
| 1500 CE | 460 M | 400–540 M | McEvedy & Jones 425 M; Biraben 461 M; Maddison 438 M. |
| Largest state at 1000 BCE | 120 provinces | 40–250 | Western Zhou or New Kingdom Egypt scale, about 1 million km² (Taagepera 1978). |
| Largest state at 1 CE | 500 provinces | 300–800 | Han and Roman empires, 4.5–6 million km² (Taagepera 1979). |
| China over half held by one state, after 250 BCE | 65% of the time | 45–85% | The engine's own China reference series (`CHINA_REF` in `world.js`). |
| Mediterranean coastlands under one state at best | 95% | 50–100% | Rome; the band allows histories where no Rome appears but a large empire does. |
| Large empires wider than tall | 65% | 50–85% | Turchin, Adams & Hall (2006): Eurasian empires are elongated east–west. |
| New Guinea, Congo interior, Amazon interior under kingdoms at 1500 CE | 0%, 15%, 0% | 0–10%, 0–35%, 0–10% | New Guinea and Amazonia had no kingdoms; the Kongo and Luba kingdoms reached the Congo basin's edges. |
