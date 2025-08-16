# Currency Converter Server (TypeScript + Express, Windows-friendly)

## Setup (Windows Command Prompt)
```cmd
cd server
copy .env.example .env
notepad .env
:: paste your key for FREECURRENCY_API_KEY and save
npm install
npm run dev
```

## Endpoints
- `GET /api/health`
- `GET /api/currencies`
- `GET /api/convert?from=USD&to=PKR&amount=10`
