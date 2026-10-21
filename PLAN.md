# Asabiya history engine — build notes and plan

A standalone browser app that simulates peoples, states and their rise and fall on a world map. It is separate from Draggable World and takes Draggable World's heightmaps as input.

Source is split into `world.js` (Earth data, climate, world), `lang.js` (sound families) and `hist.js` (history engine), plus `ui.js` and `shell.html`. `build.py` inlines everything, including the Earth and Köppen assets, into one page.

## v0.3 (2026-10-18): nomads, migrations, names, lineage, faith politics, climate epochs, culture
- **Seeds**: each visit starts a random history seed. The URL hash `#seed-NNN` replays a seed, and Setup has a "Copy link" button.
- **Names**: 27 sound families in 10 macro-families modelled on real language families (Romance, Germanic, Slavic, Celtic, Greek, Semitic, Kemetic, Berber, Persian, Indic, Dravidian, Sinitic, Japonic, Tibetan, Turkic, Mongolic, Uralic, Bantu, Mande, Austronesian, Thai, Pama, Nahuatl, Maya, Algonquian, Quechua, Tupi).
  - Each family has its own place, people and city affixes and native titles (malik, shah, raja, wang, khan, mansa, tlatoani…).
  - The Earth founding stocks keep their region's macro-family; a toggle shuffles them.
  - When a people splits, its language takes real-style sound changes, and with 22% chance switches to a sister family within the same macro-family.
- **Nomads**:
  - Herders form hordes that rule no farmland. Confederations form rarely, hordes fight each other freely, and tiny hordes dissolve. A horde often splinters when its leader dies.
  - Hordes raid settled neighbours. Raids displace people and build up loot that raises the horde's gate.
  - A horde that comes to hold enough farmland settles as a conquest dynasty, which is assimilated after about 90 years under a foreign core people.
  - Settled states attacking the steppe face ×2.5 defence, reduced by gunpowder.
- **Migrations**:
  - Displaced people (from raids, horde conquest, and famine among stateless peoples) build up pressure per people. Above about 80k people a migration starts, with a 150-year cooldown per people.
  - Hordes migrate when drought hits or when led by an aggressive leader with high cohesion.
  - A migration moves across cells, breaks through frontiers, displaces locals (which can trigger chain migrations) and settles. It founds a state if it numbers over 100k.
  - Migrations have their own encyclopedia pages and route maps, and show as amber trails on the map.
- **Terrain**: distance is travel cost via a Dial algorithm. Desert costs 8, rainforest and tundra 6, boreal 3, plus roughness; rivers halve the cost and roads cut it to 0.6×. Camels and hordes cross deserts and steppe cheaply.
  - New camel technique: hearth in Arabia, 1200 BCE.
  - The tsetse belt neutralizes horses and chariots, and invaders from outside the tropics fight at a disadvantage there (malaria).
- **Fortifications**: cohesive (S>0.45), solvent (gate>0.7), literate states fortify frontiers facing hordes or enemies. Forts cost gate, decay without upkeep, multiply defence by up to 3.5× and cut raids. The chronicle notes when a state begins a great wall.
- **Lineage**:
  - Each state records its origin: emerged, rebellion (with causes), migration, restoration (a new state in a fallen great power's heartland, same family of peoples, can revive its name), or settled nomads.
  - Successor states are recorded from sampled cells.
  - The state page shows a family tree with ancestors → this state → breakaways and their breakaways.
- **Mixed peoples**: each cell can hold a second people and its share, fed by migration, conquest elites and settlement. After about 150 years of balanced mixing over at least 5 cells, a hybrid people forms with a blended language and two parents.
- **Islands**: a state holding at least 80% of an island's peopled cells (island of 4 to 700 cells) has 0.4× civil-war risk, half the interior decay and a lower collapse threshold. The island gets a name when first unified.
- **Farming limits**: suitability now includes growing-season months above 6 °C (from the seasonal swing), a permafrost penalty and a 0.45× boreal soil factor. Siberia fell from 33% to about 6% farming at 1 CE.
  - A farming check in Checks covers Siberia, Australia, northern North America and southern Africa.
- **Faith**:
  - Each faith has a holy city with a city name, and a centralization level that rises while the faithful hold the holy city and falls when they lose it.
  - Councils can avert schisms in centralized faiths. Schism risk rises with low centralization, paper, faith age and distance.
  - Rulers have a piety trait. Holy wars over holy cities pull in same-faith neighbours as a coalition.
  - Shared faith adds 0.45 to alliance affinity, more against a foreign-faith threat; different faiths subtract 0.2.
- **Climate**:
  - A random global temperature drift on a 150-year timescale.
  - Random epochs (about 0.0007 per year): cold (−0.7 to −1.3 °C for 150–380 years), warm, or regional great droughts.
  - Orbital monsoon forcing of the Saharan, Arabian and Thar zones. On Earth it fades with a logistic curve centred at −3300; on generated worlds it follows a random-phase 23,000-year cycle.
  - The chart shows a climate strip.
- **Culture**:
  - Cultural output per state combines surplus, stability, literacy, cities, connections and elite patronage.
  - It drives invention rates (×0.7 + 0.9 × culture) and whether knowledge is kept: writing, law, coinage, roads and paper decay in low-culture states and outside states.
  - Sages and great works appear in a flowering, and the chronicle names flowerings in retrospect.
  - "Dark ages" are detected: writing lost a century after a literate great power falls.
- **Names that recur**: regnal names repeat with numerals (40% reuse). A great conqueror's name can become the title of rulers of their family of peoples (25%).
- **Interface**:
  - Event highlights: a toast plus a ring on the map, and an optional "follow major events" camera.
  - New Mixing map mode; hatched hordes; dashed fortified frontiers.
  - Chronicle types Migrations and Culture; Sages filter in Figures; migration pages; family trees.
- **Typical runs**:
  - Seed 7: writing −2202, iron −1712, coinage −1265, paper −474, crop rotation 297, ocean navigation 1625.
  - The largest Mediterranean share is about 20–27%.
  - About 15–28 ms per year; a full run takes about 2.5 minutes.

## v0.4 (2026-10-18): first pass on unification and the rainforest
**Built:**
- **Fiscal strength**: military strength = 1.6 × tax + 0.25 × population. Tax = population × farming × cereal share × distance decay × (0.5 + 0.5 × province loyalty). A new "Returns to scale" slider (default 0.8) sets how strongly size turns into reach.
- **Provincial integration**:
  - Each province has a loyalty value. It starts low when conquered (higher for related peoples and the same faith) and grows with administration, roads, law, shared family of peoples and shared faith.
  - Poorly integrated provinces defend worse and add to instability.
  - Civil wars break out first in distant, poorly integrated provinces.
- **Decisive wars**: taking the enemy capital when the defender is much smaller or demoralized either annexes the whole realm or makes it a vassal. Annexation is likelier between related peoples.
- **Idea of unity (simple form)**: conquest is easier between states of the same family of peoples and the same faith.
- **Mandate**:
  - Each dynasty has a legitimacy value. Famine years and losing provinces wear it down.
  - Low legitimacy raises the chance of a usurpation and adds to instability.
  - A usurper starts at 0.75; legitimacy recovers slowly.
- **Heartlands**: stronger gains from irrigation, river plains, iron and crops.
- **Rainforest**:
  - Leached soils cut farm suitability in hot, wet lowlands except on major floodplains.
  - A tropical disease factor of up to −30% applies to capacity.
  - A cereal-share technique (Grain crops) spreads from cereal hearths; the New Guinea hearth carries tubers.
  - State formation scales with cereal share squared; expansion into low-value provinces is discounted.
  - Untaxable, poorly integrated provinces drift out of states, and civil wars shed them.
- **Checks**: a new "Where states should be rare" table covers New Guinea, the Congo interior and the Amazon interior.
- **Bug found**: provinces annexed in one go got an infinite distance, which made new empires collapse at once. Now fixed.

**Results** (seeds 5, 7, 11, 23):
- Mean state size about 15 provinces versus 8–11 in v0.3.
- Largest Mediterranean share 19–26%; China peaks 18–31%.
- Congo interior under states at 300 CE: 100% → 42%. New Guinea and the Amazon 0%.
- First Yellow River states still come late (about −1400 to −900).

**Still to do from the v0.4 plan:**
- A proper regional identity that persists after division.
- Navies and sea control.
- Vassal layers counted in unification.
- Grain spread is currently near-global (tubers get overwritten by diffusion).
- Ensemble calibration over 20–40 seeds.
- Earlier Chinese bronze and state formation.
- Some seeds still lose writing or iron to chaotic warfare.


### v0.4 second pass (2026-10-18): calibration
**Changes:**
- **Civil wars no longer shatter states.** Rebels take only the outer 60% of provinces; the centre keeps the rest plus highly loyal provinces. Rebel count is 1–3, plus 1 per 250 provinces.
- **Great empires can fragment** when instability is extreme (ψ>2.2, at least 40 provinces). The capital keeps no core in that case.
- **Imperial overreach** adds instability: "an empire grown too large to govern" kicks in above about 170 provinces, scaled up by roads, writing and paper. The overextension term is stronger.
- **Distance bug fixed:** cells with unknown distance no longer inflate a state's mean distance (capped at 60).
- **Regional identity:**
  - Builds slowly (about 0.07% per year toward 1) in peopled, loyal provinces of states with at least 60 provinces. It belongs to the ruling family of peoples and fades with a half-life of about 1,400 years.
  - Heirs of that family conquer those provinces 1.5× more easily; foreign holders are easier to dislodge; annexation of fellow successors is likelier.
  - Shown as the new Identity map mode.
- **Loyalty map mode** (province integration). Integration now takes centuries.
- **Vassals:**
  - Kin vassals of a much stronger overlord can be absorbed after 40 years.
  - Vassal provinces count at 0.6 toward the overlord's share in the China and Mediterranean checks.
- **Navies:** a sea attack's strength depends on both sides' navigation, ocean sailing and coastal share (0.15–0.9×) instead of a flat 0.6.
- **Soils:**
  - Loess and black-earth bonus for semi-arid temperate grassland (330–850 mm, mean temperature 9.5–18 °C).
  - Heavy wet temperate forest soils cut farm capacity by up to 50% until iron.
  - State formation needs a density of 4.5/km² (was 7), with a dense-farming pathway.
- **Tropics:**
  - Grain spreads slowly into wet tropics, so New Guinea keeps tubers.
  - Outsiders from the temperate zone fight at 0.45× in disease-heavy tropics.
- **Knowledge:** it decays more slowly in disordered states, and only when no neighbour still has it.

**Results** (six seeds, 1500 CE):
- 90–320 states (most around 110–155); largest states 600–900 provinces; population 250–510 million.
- **China:** largest state holds over half the heartland 0–96% of the time after 250 BCE (mean about 0.4); peaks 44–85%.
- **Mediterranean:** best share 26–53%.
- **Stateless regions:** New Guinea 0–4%; Congo interior 29–36%; Amazon 0–15%.
- **First states:** Yellow River −1900 to −1300 (real −1900); Indus about −2500 (real −2600).
- **Technology:** iron −2600 to −500; paper in most seeds.

**Still off:**
- Egypt (about −4400) and West Africa (about −2000) form states too early.
- Southern Africa farming at 41% by 1 CE.
- A few seeds keep a tiny Siberian forest-steppe empire.
- States still claim empty desert and tundra.
- Batch harness: `node batch.js 1,2,3 1500`; diagnostic: `node diag.js <seed> <year>`.


## v0.5 (2026-10-18): land, ecology, disease pools, contact, inequality, synthesized techniques
Built from the reading-list discussion (Tainter, Smil, Catton, Carneiro, Herbst, Scott, Crosby, W. H. McNeill, Tilly, Turchin, Scheidel, Goldstone, Boserup, Goody, Arthur/Kauffman).

**Land and states**
- **Claimed wasteland:**
  - A province is waste when it is empty, or thinly peopled with poor farmland.
  - States keep waste only while it is supported: a fort, a caravan route, or being near the capital with good cohesion and an affordable government. Otherwise it reverts to stateless land (30% chance per 5 years).
  - States now rarely annex empty land beyond their reach.
  - Waste is drawn pale on the States map and does not count toward tier.
- **Circumscription (Carneiro) and the exit option (Herbst, Scott):**
  - The static part is good land hemmed in by poor land or sea, measured with a 7×6-cell blur.
  - The dynamic part (every 10 years) measures free land within 3 cells against a potential density of 7 × land quality. Forest counts as land for shifting cultivation; land inside states counts at 0.4.
  - Effects:
    - State formation probability ×(0.2 + 1.6 × circumscription).
    - Taxation ×(0.6 + 0.4 × circumscription).
    - Peasants flee overtaxed or highly unequal states into stateless land.
  - New Exit option map mode.
- **Population floors** (scaled by the new "Population floor" slider):
  - A kingdom needs 60k people and an empire 600k; otherwise the state demotes.
  - A state under 5k for 25 years dissolves "back into villages and kin-groups".
  - State formation needs about 15k people locally.
  - The region checks now count only kingdoms and larger.
- **Tainter complexity:**
  - Each state has a complexity level that rises with writing, law, roads, paper, size, forts and wars, and is sticky downward.
  - Upkeep = 0.28 × complexity^1.8 × population, against tax. The ratio is the burden; above 1 it adds instability ("a government that cost more than it returned").
  - Complexity extends reach ×(0.75 + 0.5 × complexity).
  - Civil wars simplify: the centre ×0.85, breakups ×0.7, rebels start at 0.55 of the parent.
- **Treasury (Goldstone):**
  - Builds with surplus and drains in war.
  - Debt adds instability.
  - Deep debt in a literate state ends in either a debt jubilee (Graeber: cancels debts and lowers inequality) or a default.
- **Inequality (Turchin's wealth pump; Scheidel's levellers):**
  - Rises with crowding and peace, faster under plough farming (Goody).
  - Drops with civil war and fragmentation, and by 0.15 after a "great dying" (a fall of over 20% with plague deaths over 10%), with a chronicle line about wages rising.
  - Speeds up elite growth and adds "a widening gulf" to instability.
  - New Inequality map mode; plough or hoe farming is shown on the state page.

**Ecology (Smil, Catton, Diamond, Boserup)**
- **Forest cover per province:**
  - Farmers clear it (about 1.2% a year, faster with iron), and abandoned land regrows.
  - Uncleared forest caps farm yield at 45%.
  - Bare rough land erodes soil.
  - New Forest map mode.
- **Soil fertility:**
  - Depletes under crowding, faster on leached soils.
  - Slowed by crop rotation and manure; floodplain silt protects it.
  - Recovers with fallow and herds.
  - New Soil map mode.
- **Salinization:** irrigated dry land accumulates salt (cutting yields by up to 60%) and recovers only when abandoned.
- **New techniques:**
  - Scratch plough: Earth hearth in Mesopotamia, 4300 BCE. Spreads fast on light soils and not at all in tsetse country, since it needs draft animals.
  - Heavy plough: needs iron; invented under population pressure in states holding heavy soils. Lifts the wet-clay penalty.
  - Intensive manuring: Boserup-style, invented under pressure.
  - Crops from across the ocean: exchanged at the first ocean contact between big landmasses (Crosby). Boosts poor and leached soils, spreads slowly.
- **Boserup:** pressure-gated techniques get ×0–2 odds by population pressure.

**Disease (McNeill, Crosby)**
- **Disease pools:**
  - A per-province crowd-disease load built from density, herding and cities.
  - Spreads along contact and sea links.
  - The gap between pools drives virgin-soil epidemics, with mortality ×(1 + 2.5 × gap). Survivors join the bigger pool.
- **Malaria** in hot, wet lowlands:
  - Up to −50% capacity, with local adaptation capped at 0.55.
  - Settlers carry their (lack of) adaptation.
- **River blindness** in fast tropical rivers in rough country, cutting yields by up to half.
- **Cattle plagues:** occasional regional collapse of herding capacity, which pushes herders out.
- **Volcanic winters:**
  - Small eruptions cool the world for 1–2 years.
  - Great ones (15% of eruptions) cool by 2.3 °C for 4–6 years, hit every state's mandate, and half the time are followed by a plague.

**Contact (population gaps)**
- **Diffusion along populated paths:**
  - Contact strength between provinces is 0.25 + √(pop × pop)/6000 + caravan traffic.
  - Foragers do not take up or relay metallurgy, writing or ploughs.
  - Faith spread is weighted the same way.
- **Caravan routes (every 20 years):**
  - Search from literate, settled desert-edge provinces with camels (or wind wagons) across arid land, 8 to 70 steps, to another state's peopled edge.
  - Routes carry ideas, faith and toll revenue, and keep desert provinces claimed.
  - Drawn as dotted tan lines; the chronicle records the first crossing between two families of peoples.
- **Earth hearths:** copper hearths added in Gansu (2600 BCE) and the Andes (1200 BCE); the Anatolian copper hearth moved to 4700 BCE.

**Synthesized techniques (need/energy space; Arthur, Kauffman)**
- Every technique has a position on two axes: need versus plenty, and energy versus frugality.
- Each state is placed in the same space from its pressure, wars, burden, draft animals, iron, coasts, rivers, camels and wheels.
- Real techniques get odds ×(0.6 + 0.8 × fit). Synthesized ones get fit² × 2.5 and low base rates.
- **Eight synthesized techniques:** Kite signalling, Wind wagons, Forest fungal gardens, Clockwork ledgers, Tide mills, Fever-bark medicine, Salt-flushing canals, Courier birds.
  - Each has a modest real effect.
  - The chronicle marks them "a path our own history never took".
  - They are tagged ✦ in the Knowledge chips.

**Results** (three seeds to 1500 CE):
- 240–300 polities (most are chiefdoms); largest 760–1040 provinces; population 470–580 million.
- **First states:** Egypt −3700 to −3500 (real −3100; was about −4400); Yellow River −1960 to −1800 (real −1900); Indus −2170 to −1790; West Africa −1560 to −980 (was about −2000).
- **China:** over half held 0–74% of the time after 250 BCE; peaks 40–84%. **Mediterranean:** best 26–80%.
- **Congo interior:** 31% under any state at 1000 CE, mostly one southern-savanna empire plus chiefdoms. The check now counts only kingdoms and larger.
- **Amazon:** about 18% (Bolivian lowland kingdoms). **New Guinea:** 0%.

**Still off:**
- A full run takes about 5 minutes in the browser (was 2.5), so a Web Worker or optimisation is due.
- Some seeds still put states over most of sub-Saharan Africa and parts of Siberia by 1500.
- Congo density is about 10/km² by 1000 CE (real perhaps 1–3).



## v0.5.1 (2026-10-18): ecological reach, empire shapes, smoother running
- **Smoother running:** each simulated year is split into about 7–17 slices (techniques and the exit-option pass in parts, and the periodic passes separated). The page runs slices within a 14 ms frame budget.
  - Frames at Max speed: median about 17 ms, 95th percentile about 50 ms (rendering).
  - A Web Worker was dropped: copying the history state across threads cost about 1 s per snapshot (2,900 states, 3,100 peoples), so it would need a deep restructure first.
  - A full run to 1500 CE still takes about 5 minutes; the knowledge-spread step is about 30% faster.
- **Ecological niche (Turchin, Adams & Hall 2006):**
  - Each province has a niche: temperature at its altitude, moisture, way of life (nomad or desert) and disease (malaria, tsetse).
  - Each state's niche is the population-weighted average of its core, smoothed over about 5 years.
  - Effects of distance from it:
    - Conquest odds ×exp(−eco × 1.2 × (d − 0.4)^1.3), with hordes at 0.4 instead of 1.2.
    - Tax ÷(1 + 0.3 × eco × d) and integration ÷(1 + 0.8 × eco × d).
    - Civil wars break out first in distant, alien provinces.
    - Identity builds only where d < 0.6.
    - A new instability term, "rule stretched over lands unlike its own", when over 35% of the population lives at d > 0.8.
  - New "Ecological reach" slider (default 1) and a Home ground map mode.
- **Grid geometry fix:** cells are narrower east–west at high latitude.
  - East–west travel cost ×cos(latitude).
  - Conquest target choice weights north–south neighbours by cos(latitude).
  - Knowledge spread north–south is slowed the same way.
  - Before this fix, empires spread evenly in cells, which made them north–south-elongated in km.
- **Waste:**
  - For settled states, waste is land with capacity under 2.5/km² and no caravans or cities. Hordes still count herding land.
  - Wasteland bordering a state's productive land is kept as a rim.
- **Circumscription warfare (Carneiro):**
  - Attack rates ×(1 + 3 × circumscription) and success ×(1 + 0.8 × circumscription) between states.
  - Equal sides get a 0.1 "fortunes of war" base chance.
  - River cells are no longer treated as desert for defence.
- **Tiers and checks:**
  - A crowded river polity of 4× the kingdom floor counts as a kingdom even on fewer than 4 provinces.
  - The region check now asks for the first kingdom holding 30% of the region's *people*, not its land.
- **Empire shape check:** each state is measured at its peak (east–west and north–south extent in km, waste excluded). Checks shows the share that is wider than tall, and the state page shows its extent.

**Results** (four seeds, 1500 CE):

| Measure | Before this round (eco 0) | After |
|---|---|---|
| States | — | 116–167 |
| Large empires wider than tall | 28–34% | 42–59% (median ratio 0.93–1.10) |
| Long north–south empires | 7–8 per run | 0–1 per run |

- **First states:** Egypt −3270 to −2530 (real −3100); Yellow River −1770 to −1570.
- **China:** over half held 23–95% of the time after 250 BCE. **Mediterranean:** best 24–72%.
- **Congo interior** (kingdoms or larger): 16–19%.

**Still off:**
- Indus (−1530 to −100) and West Africa (−940 to −60) are late on the people-based check.
- Iron and paper come late in about half the seeds.
- Some seeds have many hordes (100+).
- Claimed tundra rims still show pale along the far north.


## v0.5.2 (2026-10-18): frontier resistance, slower clearing
- **Stateless peoples resist:** when a settled state attacks unclaimed peopled land, the defence is multiplied by (2.2 + 2 × forest + 2 × roughness) ÷ (1 + 3 × the attacker's gunpowder). Before gunpowder it is easier to conquer a state (one capital to take) than the wilderness.
- **Settlers limit expansion:** the attempt rate into unclaimed land scales with frontier density (population ÷ area ÷ 6, clamped 0.1–1), with population pressure (0.3 + 0.7 × pressure) and with gunpowder (× (1 + 2 × gunpowder)).
- **Forest clearing is need-driven and slow:** 0.15% a year of remaining forest when pressure is above 0.6, × (1 + 2.5 × iron + 0.5 × metal).
- **Heavy soils:** the penalty is 70% until heavy plough or iron (was 50%).
- **Overstretch:** states without writing overstretch 2.2× faster.
- **Invention:** population thresholds ×0.6.

**Results** (four seeds):
- Largest state at 1000 BCE: 164–543 provinces (was 316–569), at 1 CE 304–520. Real was about 100–150 at 1000 BCE.
- Egypt −3260 to −2480; Yellow River −1450 to −1150.
- Congo kingdoms 12–18%; Amazon 0–7%.

**Diagnosis:** the remaining Bronze Age giants sit where the Earth climate model is too wet.
- Poland, Ukraine and the Volga come out at about 1,200 mm a year (real 450–650).
- The Hungarian plain and the Sudan–Uganda interior are also too wet.
- Meanwhile Mesopotamia and the Indus average only 200–270 mm over their boxes, though their river cells carry them.
- The Köppen grading cannot catch rainfall magnitudes, so capacity is overstated in continental interiors.
- **Fix:** a real annual precipitation and temperature layer for Earth (WorldClim, CRU or the user's World Climate Lab output), inlined like the Köppen map.
- **Also still late:** writing (−2600 to −1100), iron (−300 to +350) and paper.

## Sources the model leans on
- Turchin et al. 2013, *PNAS*; Turchin 2003; Turchin & Nefedov 2009.
- Ibn Khaldun (conquest dynasties' asabiya cycle); Barfield 1989 (shadow empires).
- Scheidel 2019, *Escape from Rome* (geography of Chinese unity and European fragmentation).
- Mayshar, Moav & Pascali 2022, "The Origin of the State: Land Productivity or Appropriability?"; Scott 2017, *Against the Grain*.
- Meadows et al. 1972 (World3); Pederson et al. 2014; Diamond 1997; Henrich 2004; Axelrod 1997; the Miami NPP model.
- Beck et al. 2018 (Köppen-Geiger); orbital forcing of the African Humid Period (precession).
- Validation targets: the Seshat databank; HYDE historical population maps, if obtainable.

## v0.4 full plan (agreed 2026-10-18; first pass built above)
**Unification**
- **Fiscal power and logistics**: state strength = taxable surplus collected minus the cost of moving it along travel-cost routes. Rivers, canals, roads and the sea become what holds empires together.
- **Decisive wars**: taking the enemy capital, or a lopsided war, can end in surrender, vassalage or annexation of the whole state, so rivals can be swallowed one after another.
- **Provincial integration**: each province's loyalty grows with years under rule, shared culture and faith, roads and literacy. Rebellions start in the least integrated provinces.
- **The idea of unity**: long-unified regions build a shared identity. Successor states that share it resist each other's conquest less, and a strong claimant can unify the region. The identity fades with long division.
- **Legitimacy and the Mandate of Heaven**: a dynasty's mandate wears down with famine, plague and defeat.
- **Vassal and tributary layers** inside states; loose empires count as partial unification.
- **Navies and sea control**, so sea crossings are contested rather than a fixed penalty.
- **Denser heartlands**: intensification (irrigation, rice, plough, iron) raises yields more in river plains than in marginal land.

**Tropical forests and taxable crops**
- **Leached soils**: lower farmland quality where it is both very hot and very wet, except on floodplains and volcanic soils. Iron tools and new crops recover part of it.
- **Crop packages**: each hearth's package is tagged cereal, tuber or mixed, and spreads with farming. State formation and tax depend mostly on the cereal share (appropriability), so tuber farmers form chiefdoms but rarely kingdoms.
- **Tropical disease burden** on growth and capacity in hot, wet lowlands. Locals adapt; newcomers suffer.
- **Forest farming improves slowly** with iron and introduced crops (e.g. bananas arriving in Africa as a hearth event). Rivers stay cheap highways through forest.

**Calibration across many runs** (20–40 seeds per setting, tuned toward targets):
- China reunifies repeatedly and is mostly united for long periods after about 250 BCE.
- A Mediterranean-wide empire forms sometimes, not always.
- Western Europe stays mostly divided after an empire falls.
- India unifies only occasionally.
- New Guinea farms early but never forms a state.
- The Congo and Amazon interiors stay mostly stateless.
- African states appear first in the Sahel and on the savanna edges.
- Egypt's and the Yellow River's first states arrive near their real dates.

## Later
- **v0.6**: forks and interventions, ensemble view, a Histomap stream view, save/load, timelapse GIF.
- **v0.7**: trade routes and cities, dynasties as agents, music from culture.
- **Other ideas to consider**: military revolutions changing economies of scale; scripts and common languages aiding administration; capital relocation toward threats or wealth; labour scarcity after plagues.
- **Later**: the industrial and World3 layer. EU5 export last.
- **Performance**: move the sim into a Web Worker.
