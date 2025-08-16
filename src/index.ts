import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5174;
const ORIGIN = process.env.ORIGIN || 'https://currency-converter-frontend-nu.vercel.app/';
const API_KEY = process.env.FREECURRENCY_API_KEY;

if (!API_KEY) {
  console.warn('WARNING: FREECURRENCY_API_KEY is not set. Set it in your .env file.');
}

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

const BASE_URL = 'https://api.freecurrencyapi.com/v1';

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/currencies', async (_req: Request, res: Response) => {
  try {
    const resp = await axios.get(`${BASE_URL}/currencies`, {
      headers: { apikey: API_KEY }
    });
    res.json(resp.data);
  } catch (err: any) {
    console.error(err?.response?.data || err?.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch currencies' });
  }
});

app.get('/api/convert', async (req: Request, res: Response) => {
  try {
    const from = String(req.query.from || '').toUpperCase();
    const to = String(req.query.to || '').toUpperCase();
    const amount = parseFloat(String(req.query.amount || '1'));
    if (!from || !to || isNaN(amount)) {
      return res.status(400).json({ error: 'Missing or invalid query params: from, to, amount' });
    }

    const latest = await axios.get(`${BASE_URL}/latest`, {
      headers: { apikey: API_KEY },
      params: { base_currency: from, currencies: to }
    });

    const rate = latest.data?.data?.[to];
    if (rate === undefined) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }
    const result = amount * rate;

    res.json({
      from, to, amount, rate, result,
      fetchedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error(err?.response?.data || err?.message);
    res.status(err?.response?.status || 500).json({ error: 'Conversion failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
