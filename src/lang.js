/* ---------- languages: sound families modelled on real language families ---------- */
const SP=s=>s.split(' ').filter(Boolean);
const STYLES={
 romance:{cons:'t t r r n n l l s s c c m v p d g b f',cl:'tr pr br cr fl gr',vow:'a a e e i o o u',pat:'CV CV CV CVC KV V',coda:'n r s l',place:'ia ia a ona aria ica',ppl:'ians ans ese ini',pers:'us o a io ius ian',city:'a um ona ia ento'},
 germanic:{cons:'t r n s d l g k h w b f m th',cl:'st sk br dr fr gr hr kn',vow:'a e i o u a e ae',pat:'CV CVC CVC KVC VC',coda:'n r d l s rd ld nd st lf',place:'land heim mark ia burg',ppl:'s ings ar ians',pers:'ric mund bert wulf hild ald',city:'burg ford wick stead ham'},
 slavic:{cons:'v r n s l k m d b p t z ch sh y g',cl:'pr br st sl kr zv',vow:'a o e i u y a o',pat:'CV CV CVC KV',coda:'v n k r l sk',place:'ia ov grad ava inia',ppl:'ians ichi ani s',pers:'slav mir ko av ana',city:'grad ov ets ava'},
 celtic:{cons:'b r d n l c m g t s v',cl:'br dr gl',vow:'a e i o u ai',pat:'CV CVC CV',coda:'n r d g ch',place:'ia an ach dun or',ppl:'ii ans ach',pers:'ach an ig rix',city:'dun ach on'},
 greek:{cons:'t k p r s l n m th ph ch d',cl:'kr tr pl th',vow:'a e i o y a o e',pat:'CV CV CVC V',coda:'s n r',place:'ia os is ene eia',ppl:'ians ioi ites',pers:'os as es ion ikos',city:'polis ia os on'},
 semitic:{cons:'m l k b r d sh t n h s q y z kh',vow:'a a i u a i u',pat:'CV CVC CV CVC',coda:'m n r l b d k',place:'a at ar ad iya',ppl:'ites i ans',pers:'el at ar on ah',city:'at a it un',t:{k:'malik',e:'great malik',c:'sheikh'}},
 kemetic:{cons:'t m n k h s r w b dj p',vow:'e a i o u',pat:'CV CVC',coda:'t n s r f',place:'et ti ut an',ppl:'ites i',pers:'et is u ef',city:'et u is'},
 berber:{cons:'t m z gh r n l s k d y w',vow:'a i u a',pat:'CV CVC VC',coda:'t n r z',place:'a ast at',ppl:'en ans',pers:'en as an',city:'at ast'},
 persian:{cons:'d r s sh k b m n p f z kh v g j',vow:'a a e i o u',pat:'CV CVC CV',coda:'r n d sh z s',place:'an stan ia ar',ppl:'ians i ans',pers:'ush es an dad zad',city:'abad gird shahr',t:{k:'shah',e:'shahanshah',c:'khan'}},
 indic:{cons:'r m n d s v t k j h b p g dh bh ch',vow:'a a i u e o aa',pat:'CV CV CVC',coda:'n r t m sh',place:'pur desh ra va ana',ppl:'is as ans',pers:'ra deva an ita esh',city:'pur nagar abad',t:{k:'raja',e:'maharaja',c:'thakur'}},
 dravidian:{cons:'k t n r l m v p ch y d',vow:'a i u e o a',pat:'CV CV CVC',coda:'n l r m',place:'am ai ur an',ppl:'ar ans',pers:'an appan ai',city:'ur ai am'},
 sinitic:{cons:'zh ch sh j q x h l m n d t g k b p w y s c z',vow:'a ai ao an ang e ei en eng i ia iao ian iang in ing o ong ou u uan uang ui un uo',pat:'CV',coda:'',place:'',ppl:'',pers:'',city:'an yang du zhou ling',mono:1,t:{k:'wang',e:'huangdi',c:'chief'}},
 japonic:{cons:'k s t n h m y r w g z d b',vow:'a i u e o',pat:'CV CV CV',coda:'',place:'ma shima no',ppl:'',pers:'ro ko mi ra',city:'yama kawa ta'},
 tibetan:{cons:'g d b k t p ts dz zh sh s l r m n ng y w',vow:'a e i o u',pat:'CV CVC',coda:'g d b m n ng r l s',place:'',ppl:'pa',pers:'pa ma',city:'kar ling'},
 turkic:{cons:'t k q b s r l m n y ch sh g d',vow:'a a i u o e y',pat:'CV CVC CVC V',coda:'r n k l g sh z q',place:'ia an li',ppl:'s lar',pers:'tay gul ar bek',city:'kent balik',t:{k:'khan',e:'khagan',c:'bey',h:'khan'}},
 mongolic:{cons:'b t g kh m n ch s d r l y',vow:'a o u e i',pat:'CV CVC',coda:'n r l g d',place:'ia ai',ppl:'s ut id',pers:'tai atu gun ei',city:'balgas khot',t:{k:'khan',e:'khagan',c:'noyan',h:'khan'}},
 uralic:{cons:'k t s m n l v p h r j',vow:'a e i o u a',pat:'CV CVC CV',coda:'n s t k l',place:'maa la ia',ppl:'s ians',pers:'ko nen o',city:'la va'},
 bantu:{cons:'k m t l s b w ny z g',cl:'mb nd ng nk nz',vow:'a a i u e o',pat:'CV CV KV CV',coda:'',place:'',ppl:'',pers:'',city:'',pre:{ppl:'Ba Wa A',place:'U Bu Ki'},t:{k:'mwene',e:'great mwene',c:'chief'}},
 mande:{cons:'k m s d n b t g f l j',vow:'a i u o e',pat:'CV CVC',coda:'n',place:'ba ka dugu',ppl:'nke s',pers:'ba ta ri',city:'dugu ba',t:{k:'mansa',e:'great mansa',c:'farin'}},
 austronesian:{cons:'k t m n l p h w s r g ng',vow:'a a i u e o',pat:'CV CV V CVC',coda:'n ng',place:'a ia u',ppl:'ns',pers:'a i ana',city:'a ang',t:{k:'raja',e:'maharaja',c:'datu'}},
 thai:{cons:'k kh t th p ph ch s n m ng l w y',vow:'a ai ao e i o u ua',pat:'CV CVC',coda:'n ng m k t p',place:'',ppl:'',pers:'',city:'buri thani'},
 pama:{cons:'w y ng b d g m n l r rr',vow:'a i u',pat:'CV CVC',coda:'n l r',place:'',ppl:'',pers:'',city:''},
 nahuatl:{cons:'t tl tz ch m n x k p y w l',vow:'a e i o',pat:'CV CVC CV',coda:'tl n c',place:'tlan pan co can',ppl:'ca eca',pers:'tl otl atzin',city:'tlan pan co',t:{k:'tlatoani',e:'huey tlatoani',c:'chief'}},
 maya:{cons:'k b ch t p m n l y w h x',vow:'a a e i o u',pat:'CV CVC',coda:'k l n m b',place:'il al',ppl:'ob',pers:'ab il',city:'il tun'},
 algonquian:{cons:'k w n m s t p ch',vow:'a e i o',pat:'CV CVC',coda:'k n t',place:'ak ig',ppl:'s',pers:'ak in',city:'ak'},
 quechua:{cons:'k q t p ch m n ll y w r s h',vow:'a i u',pat:'CV CVC',coda:'q y n r s',place:'marka suyu',ppl:'kuna',pers:'pa ki yu',city:'marka pampa'},
 tupi:{cons:'t p m n r k g y w b',vow:'a i u e o y',pat:'CV CV V',coda:'',place:'ba ra ma',ppl:'s',pers:'a i',city:'ba tuba'},
};
for(const k in STYLES){const s=STYLES[k];for(const f of ['cons','cl','vow','pat','coda','place','ppl','pers','city'])s[f]=SP(s[f]||'');if(s.pre){s.pre.ppl=SP(s.pre.ppl);s.pre.place=SP(s.pre.place)}s.t=Object.assign({k:'king',e:'emperor',c:'chief',h:'khan'},s.t||{})}
const MACROS={ie:['romance','germanic','slavic','celtic','greek'],afro:['semitic','kemetic','berber'],indo:['indic','dravidian','persian'],sino:['sinitic','japonic','tibetan'],alt:['turkic','mongolic','uralic'],afr:['bantu','mande'],aus:['austronesian','thai'],pama:['pama'],nam:['nahuatl','maya','algonquian'],sam:['quechua','tupi']};
const MACRO_KEYS=Object.keys(MACROS);
const LEX=['root','river','god','sun','sea','mountain','mother','grain'];
const RULES=[['p','f'],['k','h'],['t','s'],['b','v'],['d','z'],['g','y'],['s','h'],['a','e'],['o','u'],['e','i'],['u','o'],['ai','e'],['kh','h'],['ch','sh'],['l','r'],['r','l'],['th','t'],['sh','s'],['ei','i'],['c','g'],['ct','t'],'drop','voice','palatal','nasal','prothesis','geminate'];
function applyRule(w,R){
  if(Array.isArray(R))return w.split(R[0]).join(R[1]);
  switch(R){
    case'drop':return w.length>4&&/[aeiou]$/.test(w)&&!/[aeiou]{2}$/.test(w)?w.slice(0,-1):w;
    case'voice':return w.replace(/([aeiou])p(?=[aeiou])/g,'$1b').replace(/([aeiou])t(?=[aeiou])/g,'$1d').replace(/([aeiou])k(?=[aeiou])/g,'$1g');
    case'palatal':return w.replace(/k(?=[ie])/g,'ch').replace(/c(?=[ie])/g,'ch').replace(/t(?=i)/g,'ch');
    case'nasal':return w.length>4?w.replace(/[mn]$/,''):w;
    case'prothesis':return w.replace(/^s(?=[ptkm])/,'es');
    case'geminate':return w.replace(/([aeiou])([ptk])(?=[aeiou])/,'$1$2$2');
  }
  return w;
}
function applyRules(w,rs){for(const R of rs)w=applyRule(w,R);return tidy(w)}
function tidy(w){return w.replace(/(.)\1\1+/g,'$1$1').replace(/([wyhjvqx])\1/g,'$1').replace(/^([^aeiouy])\1/,'$1').replace(/[aeiou]{3,}/g,m=>m.slice(0,2))}
function syl(S,r){
  const pat=pick(r,S.pat);let w='';
  for(const ch of pat){
    if(ch==='V')w+=pick(r,S.vow);
    else if(ch==='K')w+=S.cl.length?pick(r,S.cl):pick(r,S.cons);
    else if(ch==='C')w+=pick(r,S.cons);
    else if(ch==='F')w+=S.coda.length?pick(r,S.coda):'';
  }
  if(pat.endsWith('C')&&!pat.endsWith('VC')){}
  return w;
}
function rawWord(L,r,n){const S=STYLES[L.style];let w='';n=n||1+(r()<0.55?1:0);if(S.mono)n=Math.min(n,2);for(let i=0;i<n;i++)w+=syl(S,r);
  if(!S.mono&&S.coda.length&&r()<0.3&&/[aeiou]$/.test(w))w+=pick(r,S.coda);
  if(!S.vow.includes('aa'))w=w.replace(/([aeiou])\1/g,'$1');
  return tidy(w).slice(0,10)}
function join(a,b){if(!b)return a;if(b==='s'&&/[^aeiounrlk]$/.test(a))b='ians';if(/^[aeiouy]/.test(b)&&/[aeiouy]$/.test(a))a=a.replace(/[aeiouy]+$/,'')||a;if(a&&a[a.length-1]===b[0]&&!/[aeiou]/.test(b[0]))b=b.slice(1);return a+b}
function word(L,r,n){let w;for(let t=0;t<8;t++){w=applyRules(rawWord(L,r,n),L.rules);if(w.length>=2&&w.length<=10)break}return w}
function makeLang(r,style,macro){
  const S=STYLES[style];
  const L={style,macro,rules:[],lex:{},placeSuf:S.place.length?pick(r,S.place):'',pplSuf:S.ppl.length?pick(r,S.ppl):'',prePpl:S.pre?pick(r,S.pre.ppl):'',prePlace:S.pre?pick(r,S.pre.place):''};
  for(const k of LEX)L.lex[k]=word(L,r,k==='root'?(S.mono?1:1+(r()<0.5?1:0)):undefined);
  for(let t=0;t<6&&!S.mono&&L.lex.root.length<3;t++)L.lex.root=word(L,r,2);
  langNames(L);return L;
}
function langNames(L){const S=STYLES[L.style],root=L.lex.root;
  const rt=S.mono?root:root;
  L.lex.place=cap(L.prePlace?L.prePlace+rt:join(rt,L.placeSuf));
  L.lex.people=cap(L.prePpl?L.prePpl+rt:join(rt,L.pplSuf));
  L.lex.land=L.lex.place;
}
function childLang(L,r){
  const nr=[];const n=STYLES[L.style].mono?0:1+(r()<0.5?1:0);for(let i=0;i<n;i++)nr.push(pick(r,RULES));
  let style=L.style;if(r()<0.22&&MACROS[L.macro]&&MACROS[L.macro].length>1)style=pick(r,MACROS[L.macro]);
  const S=STYLES[style];
  const C={style,macro:L.macro,rules:L.rules.concat(nr).slice(-6),lex:{},placeSuf:style!==L.style||r()<0.3?(S.place.length?pick(r,S.place):''):L.placeSuf,pplSuf:style!==L.style||r()<0.3?(S.ppl.length?pick(r,S.ppl):''):L.pplSuf,prePpl:S.pre?pick(r,S.pre.ppl):'',prePlace:S.pre?pick(r,S.pre.place):''};
  for(const k of LEX)C.lex[k]=r()<0.12?word(C,r):applyRules(L.lex[k],nr);
  if(C.lex.root===L.lex.root||C.lex.root.length<3)C.lex.root=r()<0.5?applyRules(L.lex.root,[pick(r,RULES)]):word(C,r,S.mono?1:2);
  langNames(C);
  if(C.lex.people===L.lex.people){C.lex.root=word(C,r);langNames(C)}
  return C;
}
function hybridLang(A,B,r){
  const C={style:A.style,macro:A.macro,rules:A.rules.slice(-2),lex:{},placeSuf:r()<0.5?A.placeSuf:B.placeSuf,pplSuf:A.pplSuf,prePpl:A.prePpl,prePlace:A.prePlace};
  for(const k of LEX)C.lex[k]=r()<0.5?A.lex[k]:B.lex[k];
  const a=A.lex.root,b=B.lex.root;C.lex.root=tidy(a.slice(0,Math.ceil(a.length/2))+b.slice(Math.floor(b.length/2)));
  if(C.lex.root.length<3)C.lex.root=a+b.slice(-2);
  langNames(C);return C;
}
function personName(L,r){const S=STYLES[L.style];
  if(S.mono){const a=cap(rawWord(L,r,1)),b=rawWord(L,r,1);return r()<0.5?a+' '+cap(b):a+b}
  let w='';for(let t=0;t<8&&w.length<4;t++){w=rawWord(L,r,1+(r()<0.6?1:0));if(S.pers.length&&r()<0.75)w=join(w,pick(r,S.pers));w=applyRules(w,L.rules).slice(0,12)}return cap(w)}
function placeWord(L,r){const S=STYLES[L.style];const rt=word(L,r,S.mono?1:1+(r()<0.4?1:0));return cap(L.prePlace?L.prePlace+rt:join(rt,S.place.length?(r()<0.6?L.placeSuf:pick(r,S.place)):''))}
function cityWord(L,r){const S=STYLES[L.style];if(S.mono)return cap(rawWord(L,r,1))+(r()<0.5?pick(r,S.city):'');const rt=word(L,r,1+(r()<0.4?1:0));return cap(S.city.length&&r()<0.7?join(rt,pick(r,S.city)):rt)}
function roman(n){const v=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [a,b] of v)while(n>=a){s+=b;n-=a}return s}
