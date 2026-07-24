# SHG Register Tools

Web app for maintaining SHG paper registers: a Weekly Collection Report
generator and a Meeting Resolution Log. Works for any SHG — enter the
name and member count once, then generate either report.

## Run locally
```
npm install
npm run dev
```

## Deploy (GitHub + Vercel)
1. Create a new repo on GitHub, upload this whole folder (or push via git).
2. Go to vercel.com → **Add New Project** → **Import** your GitHub repo.
3. Vercel auto-detects Vite. Leave settings as-is → **Deploy**.
4. You get a live `*.vercel.app` URL. Every push to `main` auto-redeploys.
5. Share the URL with any SHG group — no login needed, it's just a
   calculator, nothing is saved on a server.
