# Strajk Bowling — React + TypeScript

En mobil-första bokningsapp för den fiktiva bowlinghallen **Strajk Bowling**.  
Implementerad i React + TypeScript med Vite som bundler.

## Funktionalitet

- Boka bana för x personer och välja antal banor.
- Ange skostorlekar (dynamiska fält per spelare).
- Klient-side validering:
  - Antal skostorlekar måste matcha antalet spelare.
  - Max 4 spelare per bana (validering: `people <= lanes * 4`).
  - Rimligt intervall för skostorlekar (20–60).
- Skickar bokningsrequest till backend:
  - Hämtar API-nyckel från `GET /key`
  - Skickar `POST /booking` med header `x-api-key`
- Hanterar att backend är instabil — ibland returneras fel och klienten visar ett lämpligt felmeddelande.

## Teknikstack

- React + TypeScript (Vite)
- Enkel CSS (mobilvänlig, inga externa UI-bibliotek)

## API (använt)

- `GET https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/key` — hämtar API-nyckel
- `POST https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking` — skapar bokning  
  (clienten hanterar varierande svarformat från servern)

> Notera: Servern i uppgiften är avsiktligt instabil (ungefär var femte request misslyckas). Appen visar då ett felmeddelande till användaren.

## Kör lokalt

1. Installera beroenden:

- npm install

2. Starta dev-server:

- npm run dev
- Öppna http://localhost:5173 i webbläsaren (Vite visar exakt URL i terminalen).

## Projektstruktur (kort)

src/

- components/BookingView.tsx # Formulär + API-anrop + validering
- components/ConfirmationView.tsx # Visar bokningsbekräftelse
- types/booking.ts # TypeScript-typer för request/response
- App.tsx
- main.tsx
- index.css
