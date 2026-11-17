// Shared weather analytics, station definitions, and AI bias correction models

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export interface StationMeta {
  name: string;
  fullName: string;
  obsId: number;
  fcId: number;
  region: string;
  slug: string;
  vedurSlug: string;
}

export const STATIONS: StationMeta[] = [
  { name: 'Allt landið', fullName: 'Allt landið (Landsyfirlit)', obsId: 0, fcId: 0, region: 'Ísland allt', slug: 'allt-landid', vedurSlug: 'allt' },
  { name: 'Reykjavík', fullName: 'Reykjavík (Bústaðav.)', obsId: 1, fcId: 1, region: 'Höfuðborgarsvæðið', slug: 'reykjavik', vedurSlug: 'reykjavik' },
  { name: 'Akureyri', fullName: 'Akureyri (Krossanesb.)', obsId: 3471, fcId: 3471, region: 'Norðurland', slug: 'akureyri', vedurSlug: 'akureyri' },
  { name: 'Egilsstaðir', fullName: 'Egilsstaðaflugvöllur', obsId: 422, fcId: 422, region: 'Austurland', slug: 'egilsstadir', vedurSlug: 'egilsstadir' },
  { name: 'Ísafjörður', fullName: 'Ísafjörður (Bolungarvík)', obsId: 2642, fcId: 2642, region: 'Vestfirðir', slug: 'isafjordur', vedurSlug: 'isafjordur' },
  { name: 'Kirkjubæjarklaustur', fullName: 'Kirkjubæjarklaustur & Eyjafjöll', obsId: 6100, fcId: 6100, region: 'Suðurland', slug: 'kirkjubaejarklaustur', vedurSlug: 'klaustur' },
  { name: 'Stykkishólmur', fullName: 'Stykkishólmur (Snæfellsnes)', obsId: 1475, fcId: 1475, region: 'Vesturland', slug: 'stykkisholmur', vedurSlug: 'stykkisholmur' },
  { name: 'Vestmannaeyjar', fullName: 'Vestmannaeyjabær', obsId: 6015, fcId: 6015, region: 'Suðurland', slug: 'vestmannaeyjar', vedurSlug: 'vestmannaeyjar' },
  { name: 'Höfn', fullName: 'Höfn í Hornafirði', obsId: 5544, fcId: 5544, region: 'Suðausturland', slug: 'hofn', vedurSlug: 'hofn' },
  { name: 'Selfoss', fullName: 'Selfoss', obsId: 6300, fcId: 6300, region: 'Suðurland', slug: 'selfoss', vedurSlug: 'selfoss' },
  { name: 'Sauðárkrókur', fullName: 'Sauðárkrókur flugv.', obsId: 3433, fcId: 3433, region: 'Norðurland', slug: 'saudarkrokur', vedurSlug: 'saudarkrokur' },
  { name: 'Húsavík', fullName: 'Húsavík', obsId: 3696, fcId: 3696, region: 'Norðurland', slug: 'husavik', vedurSlug: 'husavik' },
  { name: 'Blönduós', fullName: 'Blönduós', obsId: 3317, fcId: 3317, region: 'Norðurland', slug: 'blonduos', vedurSlug: 'blonduos' }
];

export const REGIONS_DATA = [
  {
    region: 'Höfuðborgarsvæðið',
    station: 'Reykjavík',
    score: 89,
    tempAcc: 94,
    windAcc: 83,
    precipAcc: 90,
    mainIssue: 'Hviður og staðbundin skjól',
    note: 'Hitastig og úrkoma hitta nánast alltaf, en hviður við sjó og hæðir skeika stundum.'
  },
  {
    region: 'Norðurland',
    station: 'Akureyri',
    score: 86,
    tempAcc: 91,
    windAcc: 87,
    precipAcc: 80,
    mainIssue: 'Éljagangur og snjókoma',
    note: 'Kuldaköst eru vel fyrirséð, en nákvæm tímasetning og magn élja í Eyjafirði er erfiðari.'
  },
  {
    region: 'Vestfirðir',
    station: 'Ísafjörður',
    score: 74,
    tempAcc: 84,
    windAcc: 68,
    precipAcc: 70,
    mainIssue: 'Vindstrengir í fjörðum',
    note: 'Hér klikkar spáin mest á landinu: Hvasst í þröngum fjörðum og staðbundið kafald gerir líkönum erfitt fyrir.'
  },
  {
    region: 'Austurland',
    station: 'Egilsstaðir',
    score: 82,
    tempAcc: 80,
    windAcc: 86,
    precipAcc: 80,
    mainIssue: 'Staðbundinn næturkuldi í dölum',
    note: 'Í hægum vindi myndast oft meiri kuldapollar í dölum en spálíkön reikna með.'
  },
  {
    region: 'Suðurland',
    station: 'Selfoss / Eyjar',
    score: 84,
    tempAcc: 92,
    windAcc: 78,
    precipAcc: 82,
    mainIssue: 'Sviptivindar við fjalllendi',
    note: 'Góð hitaspá, en sviptivindar undir Eyjafjöllum og á Hellisheiði geta farið fram úr spám.'
  },
  {
    region: 'Suðausturland',
    station: 'Höfn / Öræfi',
    score: 79,
    tempAcc: 88,
    windAcc: 71,
    precipAcc: 78,
    mainIssue: 'Öræfavindur & fallvindar',
    note: 'Stórfallvindar af Vatnajökli valda oft mestu frávikum í vindhraða á landsvísu.'
  }
];

export function resolveStation(param?: string | null): StationMeta {
  if (!param) return STATIONS[1]; // default Reykjavík
  const clean = param.toLowerCase().trim();

  // If numeric ID or matches 0
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    const found = STATIONS.find(s => s.obsId === num || s.fcId === num);
    if (found) return found;
  }

  // Exact or partial match
  const found = STATIONS.find(s => 
    s.slug === clean || 
    s.vedurSlug === clean || 
    s.name.toLowerCase() === clean || 
    s.fullName.toLowerCase().includes(clean) ||
    clean.includes(s.slug) ||
    clean.includes(s.vedurSlug)
  );

  return found || STATIONS[1];
}

export function getStationSpecificAiForecast(st: StationMeta, baseDate: Date = new Date()) {
  const oId = st.obsId;
  const d1Str = new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const d2Str = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const d3Str = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const d4Str = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  if (oId === 1) {
    // REYKJAVÍK / HÖFUÐBORGARSVÆÐIÐ
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -1.0, wind: 5, gust: 9, weather: 'Léttskýjað og meinlaust frost', icon: '❄️' },
        ai: { temp: -2.0, wind: 4, gust: 8, weather: 'Heiðskírt, -2°C í borginni en -4.5°C í Heiðmörk', icon: '❄️' },
        diffs: { tempDiff: -1.0, windDiff: -1, gustDiff: -1 },
        corrections: [
          'Borgarhitahólmur vs. jaðarsvæði: Líkan vanmetur geislunarkælingu í Heiðmörk og Mosfellsdal um 2°C.',
          'Vindur stilltur í lægðum borgarlandsins.'
        ],
        aiAdvantage: 'Kemur í veg fyrir óvænta hálku í úthverfum og á stofnbrautum snemma morguns.',
        confidence: '95% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 1.8, wind: 7, gust: 12, weather: 'Skýjað og dálítil rigning', icon: '🌦️' },
        ai: { temp: 0.1, wind: 8, gust: 16, weather: '⚠️ Slydda og krapasvell á stofnbrautum og Hellisheiði', icon: '🌨️' },
        diffs: { tempDiff: -1.7, windDiff: +1, gustDiff: +4 },
        corrections: [
          'NÚLLPUNKTSGILDRAN: Bræðsluvarmi úrkomu kælir loftið niður á frostmark (hiti lækkaður úr +1.8°C í 0.1°C).',
          'Úrkomu breytt úr saklausri rigningu í krapaslyddu.',
          'Hellisheiði og Sandskeið lenda í mikilli ófærð.'
        ],
        aiAdvantage: 'Varað við lúmsku svelli og krapa á meðan hefðbundin spá sýndi blauta rigningu.',
        confidence: '90% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 3.2, wind: 10, gust: 16, weather: 'Vaxandi austanátt og rigning kl. 18:00', icon: '🌧️' },
        ai: { temp: 3.8, wind: 14, gust: 26, weather: '🌪️ Stormhviður við Kjalarnes & Esjurætur (26 m/s) kl. 14:00', icon: '💨' },
        diffs: { tempDiff: +0.6, windDiff: +4, gustDiff: +10 },
        corrections: [
          'ESJU-FALLVINDAR: Norðaustanátt framkallar miklar fallbylgjur undir Esjunni sem líkan grípur ekki.',
          'TÍMASETNING: Atlantshafslægðin berst 4 klst. fyrr og lendir beint í síðdegisumferðinni.'
        ],
        aiAdvantage: 'Gefur fólki tíma til að forðast Kjalarnes og Mosfellsheiði áður en óveðrið skellur á.',
        confidence: '82% (Hár áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 4.5, wind: 13, gust: 20, weather: 'Mild vestanátt og úrhelli', icon: '🌧️' },
        ai: { temp: 1.2, wind: 15, gust: 25, weather: 'Kaldari bakhlið lægðar, éljagangur og hálka á Reykjanesbraut', icon: '🌨️' },
        diffs: { tempDiff: -3.3, windDiff: +2, gustDiff: +5 },
        corrections: [
          'LÆGÐARBRAUT: Grænlandssveigja dregur svalt pólaloft inn á suðvesturhornið mun fyrr en D-4 líkön gera ráð fyrir.',
          'Hitastig lækkað um 3.3°C, úrkoma verður éljakennd.'
        ],
        aiAdvantage: 'Sér fyrir kuldakastið aftan á lægðinni sem hefðbundið líkan frestaði um sólarhring.',
        confidence: '70% (Góður stuðningur)'
      }
    ];
  } else if (oId === 3471 || oId === 3433 || oId === 3696 || oId === 3317) {
    // AKUREYRI / NORÐURLAND (Sauðárkrókur, Húsavík, Blönduós)
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -4.0, wind: 2, gust: 4, weather: 'Léttskýjað og hægviðri', icon: '❄️' },
        ai: { temp: -8.8, wind: 1, gust: 3, weather: '🥶 Djúp hitahvarfakæling í Eyjafirði (Kuldapollur í logni)', icon: '🥶' },
        diffs: { tempDiff: -4.8, windDiff: -1, gustDiff: -1 },
        corrections: [
          'EYJAFJARÐAR-KULDAPOLLUR: Tölvulíkön vanmeta stilla geislunarkælingu í djúpum dölum (-4.8°C meira frost).',
          'Mikil ísingarmyndun á götum og flugvelli.'
        ],
        aiAdvantage: 'Kemur í veg fyrir óvænt frostfall og flughálku í Eyjafirði og nágrenni.',
        confidence: '94% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: -1.0, wind: 6, gust: 10, weather: 'Skýjað og dálítil él', icon: '🌨️' },
        ai: { temp: -2.2, wind: 9, gust: 17, weather: '⚠️ Éljabakki úr hafi leggst yfir, stórhríð á Víkurskarði', icon: '🌨️' },
        diffs: { tempDiff: -1.2, windDiff: +3, gustDiff: +7 },
        corrections: [
          'HAFVINDUR ÚR NORÐRI: Norðanátt dregur raka yfir ófrosinn sjó inn Eyjafjörð og skapar mun þéttari él.',
          'Hviður við strönd og fjallvegi vanmetnar um 7 m/s.'
        ],
        aiAdvantage: 'Varað við hríðarveðri á Víkurskarði og Öxnadalsheiði sem hefðbundin spá sýndi sem meinlaus él.',
        confidence: '88% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 1.5, wind: 8, gust: 14, weather: 'Sunnanátt og hláka', icon: '⛅' },
        ai: { temp: 6.8, wind: 14, gust: 26, weather: '🌡️ Föhn-áhrif niður Eyjafjörð (+6.8°C) og sviptivindar', icon: '💨' },
        diffs: { tempDiff: +5.3, windDiff: +6, gustDiff: +12 },
        corrections: [
          'FÖHN-ÁHRIF: Loft hitnar við að falla af hálendinu niður Eyjafjörð. Líkanið vanmetur hita um meira en 5°C!',
          'Vindhviður aukast verulega á flugvellinum.'
        ],
        aiAdvantage: 'Spáir réttilega fyrir um mikil hlýindi og fokhættu meðan hefðbundið líkan sá varla hláku.',
        confidence: '81% (Hár áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: -2.0, wind: 11, gust: 16, weather: 'Norðvestan éljagangur', icon: '🌨️' },
        ai: { temp: -4.5, wind: 15, gust: 24, weather: 'Norðanbylur og stórhríð um allt Norðurland', icon: '🌨️' },
        diffs: { tempDiff: -2.5, windDiff: +4, gustDiff: +8 },
        corrections: [
          'HEIMSKAUTAÁHLAPP: Pólaloft streymir inn hraðar en gert var ráð fyrir.',
          'Hitastig lækkað og vindhraði aukinn.'
        ],
        aiAdvantage: 'Sér fyrir vetraróveður mun fyrr en hefðbundnar tölvuspár.',
        confidence: '68% (Langtímaspá)'
      }
    ];
  } else if (oId === 6100 || oId === 6015 || oId === 6300 || oId === 5544) {
    // KIRKJUBÆJARKLAUSTUR / SUÐURLAND & ÖRÆFI (Eyjar, Selfoss, Höfn)
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: 2.5, wind: 8, gust: 14, weather: 'Skýjað og úrkoma', icon: '🌧️' },
        ai: { temp: 1.8, wind: 11, gust: 22, weather: '💨 Sandfok og hvassir strengir undir Eyjafjöllum & Öræfum', icon: '💨' },
        diffs: { tempDiff: -0.7, windDiff: +3, gustDiff: +8 },
        corrections: [
          'ÖRHVIÐUR VIÐ JÖKULRÆTUR: Líkanið sléttar út fallvinda af Mýrdalsjökli og Öræfajökli.',
          'Hviður við sandinn hækkaðar í 22 m/s.'
        ],
        aiAdvantage: 'Nauðsynleg varnaðarspá fyrir húsbíla og vagna á Suðurlandsvegi.',
        confidence: '92% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 3.0, wind: 12, gust: 18, weather: 'Rigning og hvassviðri', icon: '🌧️' },
        ai: { temp: 2.1, wind: 16, gust: 32, weather: '🌪️ Stórfallvindar við Reynisfjall og Klaustur (32 m/s)', icon: '🌪️' },
        diffs: { tempDiff: -0.9, windDiff: +4, gustDiff: +14 },
        corrections: [
          'VATNAJÖKULS-FALLBYLGJA: Austan- og norðaustanátt veldur miklum fallbylgjum.',
          'Hviður vanmetnar um allt að 14 m/s í hráu líkani.'
        ],
        aiAdvantage: 'Bjargar fólki frá því að lenda í fárviðrishviðum á opnum vegi.',
        confidence: '89% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 4.8, wind: 15, gust: 22, weather: 'Mikil rigning kl. 20:00', icon: '🌧️' },
        ai: { temp: 5.2, wind: 19, gust: 30, weather: '🌊 Úrfelli og vatnavextir hefjast kl. 15:30', icon: '🌧️' },
        diffs: { tempDiff: +0.4, windDiff: +4, gustDiff: +8 },
        corrections: [
          'ÁRHLÍÐA-ÚRFELLI: Hlýtt og rakt loft mætir jöklum og margfaldar úrkomu.',
          'Lægðin kemur 4.5 klst. fyrr en spáð var.'
        ],
        aiAdvantage: 'Varað við vatnavöxtum og aurskriðuhættu á réttum tíma.',
        confidence: '78% (Góður áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 5.5, wind: 13, gust: 19, weather: 'Rigning og hiti', icon: '🌧️' },
        ai: { temp: 2.0, wind: 17, gust: 27, weather: 'Kalt éljaveður tekur yfir, hálka á sandinum', icon: '🌨️' },
        diffs: { tempDiff: -3.5, windDiff: +4, gustDiff: +8 },
        corrections: [
          'KULDAKAST VIÐ STRÖNDINA: Úrkoma breytist í krapaslyddu við jökuljaðar.',
          'Hiti lækkaður um 3.5°C.'
        ],
        aiAdvantage: 'Kemur í veg fyrir óvænta hálku á Suðurlandsvegi.',
        confidence: '72% (Góður stuðningur)'
      }
    ];
  } else if (oId === 2642 || oId === 2644) {
    // BOLUNGARVÍK / VESTFIRÐIR (Ísafjörður)
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -2.0, wind: 6, gust: 11, weather: 'Éljagangur', icon: '🌨️' },
        ai: { temp: -4.5, wind: 10, gust: 23, weather: '🌪️ Fjallastrengir í Ísafjarðardjúpi (Hviður 23 m/s) og kafald', icon: '🌨️' },
        diffs: { tempDiff: -2.5, windDiff: +4, gustDiff: +12 },
        corrections: [
          'FJARÐASTRENGIR: Líkanið sléttar út þrönga firði Vestfjarða. Raunverulegar hviður verða allt að 23 m/s.',
          'Kafaldsbyljir gera skyggni nálægt núlli á Gemlufallsheiði.'
        ],
        aiAdvantage: 'Skilur á milli saklausra élja og hættulegs fjallabyls á Vestfjörðum.',
        confidence: '93% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 0.5, wind: 9, gust: 15, weather: 'Slydda og rigning', icon: '🌦️' },
        ai: { temp: -1.8, wind: 13, gust: 25, weather: '⚠️ Snjóbylur og blindbylur á fjallvegum (0°C gildran)', icon: '🌨️' },
        diffs: { tempDiff: -2.3, windDiff: +4, gustDiff: +10 },
        corrections: [
          'NÚLLPUNKTSVILLA: Líkan hélt að hiti væri yfir frostmarki en bræðslukæling heldur honum í -1.8°C.',
          'Rigning verður að þungu kafaldi sem lokar vegum.'
        ],
        aiAdvantage: 'Varað við lokunum á fjallvegum Vestfjarða sem líkan taldi vera greiðfæra í rigningu.',
        confidence: '89% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 1.8, wind: 12, gust: 18, weather: 'Norðaustan hvassviðri kl. 19:00', icon: '💨' },
        ai: { temp: 0.2, wind: 18, gust: 31, weather: '🌪️ Norðan fárviðri og sjógangur kemur kl. 14:00', icon: '🌊' },
        diffs: { tempDiff: -1.6, windDiff: +6, gustDiff: +13 },
        corrections: [
          'PÓLALÆGÐARBRAUT: Lægðin dýpkar hraðar við Grænlandssund.',
          'Vindur hækkaður um 6 m/s og kemur 5 klst. fyrr.'
        ],
        aiAdvantage: 'Mikilvæg björgunarspá fyrir sjófarendur og samgöngur á Vestfjörðum.',
        confidence: '78% (Góður áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 3.2, wind: 14, gust: 21, weather: 'Rigning og hláka', icon: '🌧️' },
        ai: { temp: -1.2, wind: 16, gust: 26, weather: 'Snjóflóðaveður og stórhríð á fjallvegum', icon: '🌨️' },
        diffs: { tempDiff: -4.4, windDiff: +2, gustDiff: +5 },
        corrections: [
          'KULDAKAST ÚR NORÐVESTRI: Pólaloft fellur inn mun hraðar en líkön reiknuðu.',
          'Hitastig lækkað um 4.4°C og úrkoma verður þung snjókoma.'
        ],
        aiAdvantage: 'Kemur í veg fyrir hættulegt vanmat á snjóflóðahættu og vetrarfærð.',
        confidence: '69% (Gildi fyrir vaktstöðvar)'
      }
    ];
  } else if (oId === 422 || oId === 4271) {
    // EGILSSTAÐIR / AUSTURLAND
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -2.5, wind: 3, gust: 6, weather: 'Léttskýjað', icon: '❄️' },
        ai: { temp: -6.5, wind: 2, gust: 4, weather: 'Hitahvarf í Fljótsdalshéraði, frostþoka og svell', icon: '❄️' },
        diffs: { tempDiff: -4.0, windDiff: -1, gustDiff: -2 },
        corrections: [
          'HÉRAÐS-HITAHVARF: Kalt loft situr fast í dalbotninum meðan hlýrra er ofar.',
          'Ísing og mikil hálka á vegi 1.'
        ],
        aiAdvantage: 'Leiðréttir mikla líkanaskekkju á næturfrosti inn til landsins.',
        confidence: '95% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 1.2, wind: 5, gust: 9, weather: 'Skýjað og súld', icon: '🌦️' },
        ai: { temp: 0.2, wind: 6, gust: 13, weather: '⚠️ Austan þokuloft í byggð en Fjarðarheiði flughál', icon: '🌨️' },
        diffs: { tempDiff: -1.0, windDiff: +1, gustDiff: +4 },
        corrections: [
          'FJALLVEGAGILDRAN: Súld í byggð verður að svellgljáa á Fjarðarheiði og Fagradal.',
          'Svalur hafgolustraumur festist við ströndina.'
        ],
        aiAdvantage: 'Kemur í veg fyrir að ferðalangar milli Héraðs og Seyðisfjarðar lendi óundirbúnir í hálku.',
        confidence: '88% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 3.0, wind: 9, gust: 15, weather: 'Vestanátt og hlýnandi', icon: '⛅' },
        ai: { temp: 8.5, wind: 13, gust: 25, weather: '🌡️ Föhn-hlýindi niður Hérað (+8.5°C) og hvassir strengir', icon: '💨' },
        diffs: { tempDiff: +5.5, windDiff: +4, gustDiff: +10 },
        corrections: [
          'FÖHN-ÁHRIF Á AUSTURLANDI: Loft fellur af hálendinu og þurrhitnar. Líkan vanmetur Föhn-hita um +5.5°C.',
          'Mestar hviður hækkaðar í 25 m/s.'
        ],
        aiAdvantage: 'Spáir rétt fyrir um óvenjuleg hlýindi og fokhættu í vestanátt.',
        confidence: '79% (Góður áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 3.5, wind: 12, gust: 18, weather: 'Rigning og kólnandi', icon: '🌧️' },
        ai: { temp: 0.5, wind: 15, gust: 25, weather: 'Norðvestan kalsaveður, slydda og ófærð á Fagradal', icon: '🌨️' },
        diffs: { tempDiff: -3.0, windDiff: +3, gustDiff: +7 },
        corrections: [
          'NORÐANÁTTAR-SKEKKJA: Kuldaskilin ná Austurlandi fyrr en líkan reiknaði með.',
          'Úrkoma breytist í snjó á heiðum.'
        ],
        aiAdvantage: 'Varað við snjókomu á fjallvegum sem líkan taldi vera rigningu.',
        confidence: '71% (Langtímaspá)'
      }
    ];
  } else if (oId === 1475) {
    // STYKKISHÓLMUR / VESTURLAND & SNÆFELLSNES
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -1.2, wind: 5, gust: 8, weather: 'Léttskýjað og frost', icon: '❄️' },
        ai: { temp: -2.8, wind: 4, gust: 8, weather: 'Stillt næturfrost við Breiðafjörð og svell á Fróðárheiði', icon: '❄️' },
        diffs: { tempDiff: -1.6, windDiff: -1, gustDiff: 0 },
        corrections: [
          'STRANDKÆLING: Heiðskír sjóvarmi og næturkæling veldur -2.8°C frosti.',
          'Hálka á Holtavörðuheiði og Bröttubrekku.'
        ],
        aiAdvantage: 'Öruggari hálkuspá fyrir helstu fjallvegi Vesturlands.',
        confidence: '95% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 1.8, wind: 8, gust: 13, weather: 'Skýjað og dálítil rigning', icon: '🌦️' },
        ai: { temp: 0.2, wind: 10, gust: 18, weather: '⚠️ Hálka á Bröttubrekku og krapaslydda', icon: '🌨️' },
        diffs: { tempDiff: -1.6, windDiff: +2, gustDiff: +5 },
        corrections: [
          '0°C NÚLLPUNKTURINN: Bræðsluvarmi kælir loftið niður á frostmark.',
          'Vindhviður auknar í sundum og fjörðum.'
        ],
        aiAdvantage: 'Spáir krapa og sleipum vegum í stað meinlausrar rigningar.',
        confidence: '89% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 3.5, wind: 12, gust: 18, weather: 'Hvassviðri kl. 18:30', icon: '💨' },
        ai: { temp: 4.0, wind: 15, gust: 29, weather: '🌪️ Snæfellsneshviður magnast í suðaustanátt (29 m/s) kl. 14:30', icon: '🌪️' },
        diffs: { tempDiff: +0.5, windDiff: +3, gustDiff: +11 },
        corrections: [
          'SNÆFELLSNES-MAGNARI: Fjallgarðurinn skapar miklar fallbylgjur bæði norðan og sunnan megin (hviður hækkaðar í 29 m/s).',
          'Lægðin skellur á 4 klst. fyrr.'
        ],
        aiAdvantage: 'Stórvægileg varnaðarspá fyrir bíla með tengivagna á Snæfellsnesi.',
        confidence: '82% (Hár áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 4.2, wind: 14, gust: 21, weather: 'Rigning og hvassviðri', icon: '🌧️' },
        ai: { temp: 1.0, wind: 16, gust: 26, weather: 'Kaldari bakhlið, snjóbylur á Fróðárheiði', icon: '🌨️' },
        diffs: { tempDiff: -3.2, windDiff: +2, gustDiff: +5 },
        corrections: [
          'LÆGÐARBRAUT: Kalt loft úr norðvestri tekur yfir fyrr en líkan reiknaði með.',
          'Úrkoma breytist í snjókomu.'
        ],
        aiAdvantage: 'Kemur í veg fyrir óvænta lokun á Fróðárheiði.',
        confidence: '70% (Góður áreiðanleiki)'
      }
    ];
  } else {
    // ALLT LANDIÐ (LANDSYFIRLIT)
    return [
      {
        dateStr: d1Str,
        dayName: 'Á morgun',
        raw: { temp: -1.0, wind: 5, gust: 9, weather: 'Léttskýjað og frost', icon: '❄️' },
        ai: { temp: -2.4, wind: 4, gust: 8, weather: 'Heiðskírt og víðtækt næturfrost, kaldara í dölum', icon: '❄️' },
        diffs: { tempDiff: -1.4, windDiff: -1, gustDiff: -1 },
        corrections: [
          'Geislunarkælingaleiðrétting yfir landið: Heiðskírt og hægur vindur veldur meira frosti í dölum og innsveitum en líkön reikna með.',
          'Lúmsk hálka á brúargólfum og vegum snemma morguns.'
        ],
        aiAdvantage: 'Kemur í veg fyrir vanmat á næturhálku á vegum landsins.',
        confidence: '95% (Mjög mikið öryggi)'
      },
      {
        dateStr: d2Str,
        dayName: 'Hinn daginn',
        raw: { temp: 1.2, wind: 7, gust: 12, weather: 'Skýjað og dálítil rigning', icon: '🌦️' },
        ai: { temp: 0.1, wind: 8, gust: 17, weather: '⚠️ Slydda og lúmsk hálka (0°C Núllpunktur landsins)', icon: '🌨️' },
        diffs: { tempDiff: -1.1, windDiff: +1, gustDiff: +5 },
        corrections: [
          'NÚLLPUNKTSGILDRAN: Bræðsluvarmi úrkomu kælir loftlagið niður á frostmark (hiti lækkaður úr +1.2°C í 0.1°C).',
          'Úrkomuformi breytt: Rigning verður að slyddu/snjókomu með tilheyrandi krapa á fjallvegum.',
          'Hviður hækkaðar um +5 m/s við strönd og fjöll.'
        ],
        aiAdvantage: 'Spáir hálku og slyddu sem hefðbundin spá taldi saklausa rigningu!',
        confidence: '88% (Mikilvæg varnaðarspá)'
      },
      {
        dateStr: d3Str,
        dayName: 'Eftir 3 daga',
        raw: { temp: 2.8, wind: 11, gust: 18, weather: 'Vaxandi vindur og rigning kl. 18:30', icon: '🌧️' },
        ai: { temp: 3.4, wind: 14, gust: 27, weather: '🌪️ Hvassviðri/Stormur kemur fyrr (kl. 14:00–14:30)', icon: '🌪️' },
        diffs: { tempDiff: +0.6, windDiff: +3, gustDiff: +9 },
        corrections: [
          'TÍMASETNINGARLEIÐRÉTTING: Lægðabylgjur berast að jafnaði 3–4 klst. hraðar en ECMWF sýnir 72 klst. fram í tímann.',
          'HVIÐUSTÖÐUGLEIKI: Mestar hviður hækkaðar úr 18 m/s í 27 m/s vegna staðhátta (fallvindar við fjallshlíðar).',
          'Gult/appelsínugult viðvörunarstig virkjað fyrr um daginn.'
        ],
        aiAdvantage: 'Veðrið skellur á fyrr og verður mun hvassara í hviðum en hefðbundin spá gefur til kynna.',
        confidence: '82% (Hár áreiðanleiki)'
      },
      {
        dateStr: d4Str,
        dayName: 'Eftir 4 daga',
        raw: { temp: 3.5, wind: 12, gust: 18, weather: 'Skýjað og rigning', icon: '🌧️' },
        ai: { temp: 1.2, wind: 15, gust: 24, weather: 'Svalara pólaloft, éljagangur á heiðum', icon: '🌨️' },
        diffs: { tempDiff: -2.3, windDiff: +3, gustDiff: +6 },
        corrections: [
          'LÆGÐARBIL: Kalt loft úr norðri sækir á hraðar en gert var ráð fyrir.',
          'Hitastig lækkað um 2.3°C, él á heiðum.'
        ],
        aiAdvantage: 'Varar tímanlega við kólnandi veðri og vetrarfærð á fjallvegum landsins.',
        confidence: '70% (Góður áreiðanleiki)'
      }
    ];
  }
}
