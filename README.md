# Veðurspá vs. Raunveruleg veðurathugun 🇮🇸

Notendavænt og nútímalegt vefforrit sem ber saman **veðurspá Veðurstofu Íslands** ([vedur.is](https://www.vedur.is)) við **raunverulegar veðurathuganir** sjálfvirkra veðurstöðva dagsins.

## Eiginleikar
- **Spágæðaeinkunn (0–100%)**: Samsett einkunn (A+, A, B, C, D) sem metur hversu vel spáin stóðst.
- **Hitaskekkja (MAE & Bjagi)**: Frávik í hita klukkustund fyrir klukkustund ásamt kerfisbundnum bjaga (hvort spáin var of köld eða of heit).
- **Vindhraði & Hviður**: Samanburður á spáðum jafnvindi, mældum jafnvindi og hámarkshviðum (m/s).
- **Vindáttarskekkja**: Hornamunur á milli spár og raunáttar á áttarósinni.
- **10 lykilstöðvar um land allt**: Reykjavík, Akureyri, Egilsstaðir, Ísafjörður, Vestmannaeyjar, Selfoss, Höfn í Hornafirði, Sauðárkrókur, Húsavík og Blönduós.
- **Vercel Serverless API**: Endapunkturinn `/api/vedur` sækir gögn beint frá Veðurstofunni án CORS vandamála í vafra.

---

## Hvernig á að setja upp á GitHub og Vercel

### 1. Setja upp á GitHub
Ef þú hefur þegar tengt GitHub reikninginn þinn:
```bash
git remote add origin https://github.com/<notandanafn>/vedur-samanburdur.git
git branch -M main
git push -u origin main
```

### 2. Setja upp á Vercel
1. Farðu á [vercel.com](https://vercel.com) og skráðu þig inn (t.d. með GitHub).
2. Smelltu á **"Add New Project"** og veldu `vedur-samanburdur` geymsluna (repository) af GitHub.
3. Vercel nemur Next.js sjálfkrafa. Smelltu á **"Deploy"**.
4. Síðan er komin í loftið á slóð eins og `vedur-samanburdur.vercel.app`!

Einnig er hægt að nota Vercel CLI beint í skipanalínu:
```bash
npm i -g vercel
vercel
```

---

## Keyrsla í þróunarumhverfi (Local dev)
```bash
npm install
npm run dev
```
Opnaðu síðan [http://localhost:3000](http://localhost:3000) í vafranum.

## Gögn
Öll veðurgögn eru sótt frá [Veðurstofu Íslands](https://www.vedur.is):
- Veðurspár: `https://xmlweather.vedur.is`
- Veðurathuganir (AWS): `https://api.vedur.is/weather`
