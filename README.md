# jevaton — template de hackathon (2h)

## Quickstart

```bash
pnpm install
cp .env.example .env   # opcional: sin key corre en mock mode
pnpm dev               # http://localhost:3000
```

## ¿Qué es Jev?

Una API de IA que no devuelve texto: recibe una **pregunta tipada** (pregunta + opciones)
y devuelve **probabilidades por opción** — nada de texto libre.
La política (qué hacer con cada probabilidad) vive en el código del caller, no en la API.

## API key

Pedila en el stand de Jev o en **https://jev.dev/hackathon** *(reemplazar por el link real)*.
Va en `.env` como `JEV_API_KEY` + `JEV_API_URL`. La key nunca llega al cliente: todas las
llamadas pasan por el proxy `app/api/jev/route.ts`.

## Regla de la hackathon

> **Tu app tiene que tomar UNA decisión real usando Jev.**

Una sola, pero real: un `if (decision.p(...) > umbral)` que dispare una acción concreta
(deployar, mover a spam, pagear a alguien, lo que sea). El umbral es tuyo.

## Estructura

```
app/api/jev/route.ts   proxy a Jev (inyecta la API key server-side)
lib/jev.ts             cliente tipado: askJev(question) → Decision + mock mode
app/page.tsx           demo "hello decision" + clasificador de spam
IDEAS.md               4 ideas de proyecto
```

## Mock mode

Sin `JEV_API_KEY`, `lib/jev.ts` genera probabilidades sintéticas **determinísticas**
(hash de la pregunta): podés desarrollar y demoear todo sin tocar la API real.
