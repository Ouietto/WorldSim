// Historical targets for Earth runs. Each has a best estimate (real) and a band of acceptable values (lo..hi).
// Bands are deliberately wide: they say "plausible history", not "our exact history". Sources are listed in tools/VALIDATION.md.
// kind: 'year' (date of first occurrence; missing = never), 'num' (a measured quantity), 'share' (0..1)
// cls: none = scored; 'guard' = hit in every version so far, kept to catch breakage but not scored; 'context' = reported, not
// scored, because another target already carries it (moved together across 33 versions, r >= 0.94) or a ratio replaced it.
// get: computed from other measurements (old cached runs can be rescored with it)
// Years are engine years: 1 CE is 1 and 1 BCE is 0, so B(n) is the year n BCE.
const B=n=>1-n;
module.exports=[
  // where farming locks in on its own (emergent origins): domestication dates (Zeder 2011; Fuller 2007; Piperno 2011; Denham 2003;
  // Manning et al. 2011; Smith 2006). Bands are wide: the dates themselves are argued over.
  {k:'o_fc',g:'Farming origins',n:'Fertile Crescent (wheat, barley)',kind:'year',real:B(8500),lo:B(9500),hi:B(7500),cls:'guard'},
  {k:'o_yz',g:'Farming origins',n:'Yangtze (rice)',kind:'year',real:B(6500),lo:B(8000),hi:B(5000),cls:'guard'},
  {k:'o_yr',g:'Farming origins',n:'Yellow River (millet)',kind:'year',real:B(6500),lo:B(8000),hi:B(5500),cls:'guard'},
  {k:'o_ng',g:'Farming origins',n:'New Guinea (taro, bananas)',kind:'year',real:B(5500),lo:B(8000),hi:B(4000),cls:'guard'},
  {k:'o_ma',g:'Farming origins',n:'Mesoamerica (maize)',kind:'year',real:B(5000),lo:B(7000),hi:B(3000)},
  {k:'o_an',g:'Farming origins',n:'Andes (potato, quinoa)',kind:'year',real:B(5000),lo:B(7000),hi:B(3500)},
  {k:'o_sa',g:'Farming origins',n:'Sahel (sorghum, pearl millet)',kind:'year',real:B(2500),lo:B(4000),hi:B(1500)},
  {k:'o_wa',g:'Farming origins',n:'West Africa (yams)',kind:'year',real:B(2500),lo:B(4000),hi:B(1000)},
  {k:'o_ea',g:'Farming origins',n:'Eastern North America',kind:'year',real:B(2500),lo:B(3500),hi:B(1500)},
  // only with switch mehr: the Kachi-plain hearth (Mehrgarh, barley and zebu by about 7000 BCE; Jarrige 1995)
  {k:'o_mh',g:'Farming origins',n:'Mehrgarh (barley, zebu) [switch mehr]',kind:'year',real:B(7000),lo:B(8000),hi:B(5500),cls:'context'},
  // farming arrival (half the peopled provinces in a box farm) and forager holdouts (Zvelebil; Rowley-Conwy 2011; Crema et al. 2016)
  {k:'f_cEur',  g:'Farming frontier',n:'Central Europe (LBK)',kind:'year',real:B(5400),lo:B(5800),hi:B(4900)},
  {k:'f_brit',  g:'Farming frontier',n:'Britain',             kind:'year',real:B(4000),lo:B(4400),hi:B(3500)},
  {k:'f_scand', g:'Farming frontier',n:'Southern Scandinavia',kind:'year',real:B(3950),lo:B(4300),hi:B(3400),cls:'context'},
  {k:'f_japan', g:'Farming frontier',n:'Western Japan (Yayoi)',kind:'year',real:B(900),lo:B(1200),hi:B(300)},
  {k:'fs_pnw',  g:'Farming frontier',n:'Pacific Northwest farmed at 1500',kind:'share',real:0,lo:0,hi:0.1},
  {k:'fs_cape', g:'Farming frontier',n:'Western Cape farmed at 1500',kind:'share',real:0,lo:0,hi:0.1},
  // first lasting state (run 81): the first decade after which a state, league or overlord's bloc holds 30% of a region's people
  // (and 100,000) in at least 15 of the next 20 decades. A state that rises and falls back does not count yet
  {k:'rs_meso',   g:'First states',  n:'Mesopotamia (a third of the people)',  kind:'year',real:B(2600),lo:B(3200),hi:B(2000)},
  {k:'rc_meso',   g:'First states',  n:'Mesopotamia (city-states on the southern plain)',kind:'year',real:B(3500),lo:B(4000),hi:B(3000)},
  // Egypt (with Nein): the lower Nile from the Delta to the Fourth Cataract. The Naqada-period kingdoms of Upper Egypt rose and fell
  // before one state held the river (Narmer, about 3100 BCE)
  {k:'rk_egypt',  g:'First states',  n:'Egypt (first kingdoms on the Nile)',kind:'year',real:B(3400),lo:B(3700),hi:B(3100)},
  {k:'ru_egypt',  g:'First states',  n:'Egypt (one state holding two thirds of the Nile\'s people)',kind:'year',real:B(3100),lo:B(3300),hi:B(2700)},
  {k:'rs_egypt',  g:'First states',  n:'Egypt (a third of the old box, lasting)',kind:'year',real:B(3100),lo:B(3400),hi:B(2700),cls:'context'},
  {k:'rs_indus',  g:'First states',  n:'Indus',        kind:'year',real:B(2600),lo:B(2900),hi:B(2000)},
  {k:'rs_nchina', g:'First states',  n:'Yellow River', kind:'year',real:B(1900),lo:B(2200),hi:B(1500)},
  {k:'rs_mesoam', g:'First states',  n:'Mesoamerica',  kind:'year',real:400,    lo:B(500), hi:1100},
  {k:'rs_andes',  g:'First states',  n:'Central Andes',kind:'year',real:700,    lo:0,      hi:1450},
  {k:'rs_europe', g:'First states',  n:'Western Europe',kind:'year',real:B(50), lo:B(600), hi:500},
  {k:'rs_wafrica',g:'First states',  n:'West Africa',  kind:'year',real:900,  lo:300,  hi:1350},
  {k:'rs_iran',   g:'First states',  n:'Iranian plateau (watched, not scored)',kind:'year',real:B(550),lo:B(900),hi:B(300),cls:'context'},
  // first appearance, before run 81 (kept for comparison, not scored)
  {k:'r_meso',   g:'First states',  n:'First seen: Mesopotamia',  kind:'year',real:B(2600),lo:B(3200),hi:B(2000),cls:'context'},  {k:'r_egypt',  g:'First states',  n:'First seen: Egypt',        kind:'year',real:B(3100),lo:B(3400),hi:B(2700),cls:'context'},  {k:'r_indus',  g:'First states',  n:'First seen: Indus',        kind:'year',real:B(2600),lo:B(2900),hi:B(2000),cls:'context'},  {k:'r_nchina', g:'First states',  n:'First seen: Yellow River', kind:'year',real:B(1900),lo:B(2200),hi:B(1500),cls:'context'},  {k:'r_mesoam', g:'First states',  n:'First seen: Mesoamerica',  kind:'year',real:400,    lo:B(500), hi:1100,cls:'context'},  {k:'r_andes',  g:'First states',  n:'First seen: Central Andes',kind:'year',real:700,    lo:0,      hi:1450,cls:'context'},  {k:'r_europe', g:'First states',  n:'First seen: Western Europe',kind:'year',real:B(50), lo:B(600), hi:500,cls:'context'},  {k:'r_wafrica',g:'First states',  n:'First seen: West Africa',  kind:'year',real:900,  lo:300,  hi:1350,cls:'context'},
  // first invention anywhere
  {k:'t_writing',g:'Techniques',n:'Writing',  kind:'year',real:B(3200),lo:B(3500),hi:B(2800)},
  {k:'t_iron',   g:'Techniques',n:'Iron',     kind:'year',real:B(1200),lo:B(1600),hi:B(800)},
  {k:'t_coin',   g:'Techniques',n:'Coinage',  kind:'year',real:B(600), lo:B(900), hi:B(300),cls:'context'},
  {k:'t_paper',  g:'Techniques',n:'Paper',    kind:'year',real:B(100), lo:B(400), hi:300},
  {k:'t_horse',  g:'Techniques',n:'Horse domesticated',kind:'year',real:B(3500),lo:B(4000),hi:B(2000),cls:'guard'},
  {k:'t_gun',    g:'Techniques',n:'Gunpowder',kind:'year',real:1200, lo:950,  hi:1400},
  // world population, millions (McEvedy & Jones 1978; HYDE 3.2; Biraben 1979)
  {k:'p_m3000',g:'Population',n:'3000 BCE (M)',kind:'num',real:30, lo:14, hi:60, at:B(3000),cls:'context'},
  {k:'p_1',    g:'Population',n:'1 CE (M)',    kind:'num',real:230,lo:170,hi:300,at:1},
  {k:'p_1000', g:'Population',n:'1000 CE (M)', kind:'num',real:290,lo:240,hi:350,at:1000,cls:'context'},
  {k:'p_1500', g:'Population',n:'1500 CE (M)', kind:'num',real:460,lo:400,hi:540,at:1500,cls:'context'},
  // the shape of growth, separate from its level: real growth was fast from 3000 BCE to 1 CE (about x7.7; estimates of the 3000
  // BCE world run from 14M to 45M) and still strong from 1000 to 1500 (about x1.6, Black Death included)
  {k:'g_early',g:'Population',n:'Growth 3000 BCE to 1 CE (x)',kind:'num',real:7.7,lo:4.5,hi:13,at:1,dec:1,get:r=>r.p_m3000&&r.p_1?r.p_1/r.p_m3000:null},
  {k:'g_late', g:'Population',n:'Growth 1000 to 1500 CE (x)',kind:'num',real:1.59,lo:1.3,hi:2.0,at:1500,dec:2,get:r=>r.p_1000&&r.p_1500?r.p_1500/r.p_1000:null},
  // size of the largest state, provinces (one province is roughly 10,000 km² at the equator)
  {k:'b_m1000',g:'Empires',n:'Largest farming state at 1000 BCE',kind:'num',real:120,lo:40, hi:250,at:B(1000)},
  {k:'b_1',    g:'Empires',n:'Largest farming state at 1 CE',    kind:'num',real:500,lo:300,hi:800,at:1},
  {k:'cUnity', g:'Empires',n:'China over half united (share of time after 250 BCE)',kind:'share',real:0.65,lo:0.45,hi:0.85},
  {k:'medMax', g:'Empires',n:'Mediterranean best share',kind:'share',real:0.95,lo:0.5,hi:1},
  {k:'ewShare',g:'Empires',n:'Large empires wider than tall',kind:'share',real:0.65,lo:0.5,hi:0.85},
  {k:'s_pontic',g:'Empires',n:'Pontic steppe under farming states at 1000 BCE',kind:'share',real:0.02,lo:0,hi:0.25},
  // where states should stay rare at 1500 CE (share of peopled land under kingdoms or larger)
  {k:'s_ng',   g:'Stateless',n:'New Guinea',kind:'share',real:0,lo:0,hi:0.1,cls:'guard'},
  {k:'s_congo',g:'Stateless',n:'Congo interior',kind:'share',real:0.15,lo:0,hi:0.35,cls:'guard'},
  {k:'s_amaz', g:'Stateless',n:'Amazon interior',kind:'share',real:0,lo:0,hi:0.1},
];
