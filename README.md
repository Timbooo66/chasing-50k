# CHASING 50.000

Live-Tracker für die Challenge "50.000 Klimmzüge in 6 Monaten"
(Start 24.08.2026 · Ziel 24.02.2027).

Öffentliche Showcase-Seite für die Instagram-/TikTok-Bio. Besucher sehen alles
schreibgeschützt, Eintragen geht nur mit privatem Code.

## Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Komplette App: Fortschrittsbalken mit Meilensteinen (10k/25k/50k) und Soll-Markierung, Ø/Woche, Ø/Tag, Prognose-Datum, Streak, Rekorde, Wochen-Balkendiagramm, Klimmzüge-pro-Minute-Kurve, Wochen zum Aufklappen |
| `api/data.js` | Serverless-Funktion. `GET` liefert den Stand aus Vercel Blob, sonst die eingebauten `DEFAULTS`. `POST` prüft den Header `x-edit-code` gegen die Env-Variable `EDIT_CODE` und schreibt nach Blob |
| `package.json` | Abhängigkeit `@vercel/blob` |

Daten liegen serverseitig in Vercel Blob (`tracker-data.json`), damit alle
Besucher denselben Live-Stand sehen und von jedem Gerät eingetragen werden kann.

## Env-Variablen

| Name | Woher |
|---|---|
| `EDIT_CODE` | selbst gesetzt. Dieser Code schaltet "Bearbeiten" frei |
| `BLOB_READ_WRITE_TOKEN` | wird automatisch gesetzt, sobald ein Blob-Store mit dem Projekt verbunden ist |

Ohne `BLOB_READ_WRITE_TOKEN` zeigt die Seite korrekt die eingebauten `DEFAULTS`
(Stand ~20.100), Speichern schlägt aber fehl.

## Eintragen

"Bearbeiten" → Code eingeben → Wochen aufklappen → Reps und optional Minuten
pro Tag eintragen. Wird nach ~0,7 s automatisch gespeichert ("gespeichert HH:MM").
Woche und Gesamtsumme rechnen live mit. Wochen 1–8 können als reine Wochensumme
bleiben; sobald ein Tag der Woche gefüllt ist, zählt die Tagessumme.

Der Code wird im Browser (`localStorage`) gemerkt. "Bearbeiten aktiv ✓" erneut
antippen schaltet zurück auf Nur-Ansicht.

## Deployment

Vercel-Projekt `chasing-50k`, Hobby-Tarif. Deployment aus diesem Repo,
Branch `main`.

Lokal prüfen:

```bash
npm install
npx vercel dev
```

Für `vercel dev` muss `EDIT_CODE` lokal gesetzt sein (`.env.local`), sonst
antwortet `POST /api/data` immer mit `403`.
