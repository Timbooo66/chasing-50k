import { put, list } from '@vercel/blob';

const BLOB_PATH = 'tracker-data.json';

const DEFAULTS = {
  pastWeeks: [2000, 2000, 2000, 2000, 2000, 1750, 1650, 1600],
  futureWeeks: 2,
  days: {
    "2026-10-19": { r: 200, m: 0 },
    "2026-10-20": { r: 100, m: 0 },
    "2026-10-21": { r: 100, m: 0 },
    "2026-10-23": { r: 500, m: 0 },
    "2026-10-25": { r: 330, m: 0 },
    "2026-10-26": { r: 800, m: 0 },
    "2026-10-27": { r: 200, m: 0 },
    "2026-10-28": { r: 100, m: 0 },
    "2026-10-29": { r: 500, m: 0 },
    "2026-10-30": { r: 200, m: 0 },
    "2026-11-01": { r: 300, m: 0 },
    "2026-11-02": { r: 320, m: 0 },
    "2026-11-04": { r: 400, m: 0 },
    "2026-11-05": { r: 100, m: 0 },
    "2026-11-07": { r: 250, m: 0 },
    "2026-11-08": { r: 700, m: 0 }
  }
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      try {
        const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
        if (blobs && blobs.length) {
          const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
          if (r.ok) {
            const data = await r.json();
            res.setHeader('cache-control', 'no-store');
            return res.status(200).json(data);
          }
        }
      } catch (e) { /* fall through to defaults */ }
      res.setHeader('cache-control', 'no-store');
      return res.status(200).json(DEFAULTS);
    }

    if (req.method === 'POST') {
      const code = req.headers['x-edit-code'] || '';
      if (!process.env.EDIT_CODE || code !== process.env.EDIT_CODE) {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Vercel's Node runtime may have already parsed the body; only read the
      // raw stream when it hasn't, otherwise the request would hang.
      let json;
      if (req.body && typeof req.body === 'object') {
        json = req.body;
      } else {
        const raw = typeof req.body === 'string' && req.body.length
          ? req.body
          : await readRawBody(req);
        try { json = JSON.parse(raw); } catch (e) { return res.status(400).json({ error: 'bad json' }); }
      }
      if (!json || typeof json !== 'object') return res.status(400).json({ error: 'bad json' });

      await put(BLOB_PATH, JSON.stringify(json), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
