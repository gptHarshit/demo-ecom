# MyLeadKart — Demo Build

A standalone copy of the MyLeadKart frontend (landing page, sign-up, login and
the full dashboard) that runs with **demo data only**. It needs no backend and
no database, and it never contacts the production API.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo login

| Email                 | Password    |
| --------------------- | ----------- |
| `demo@myleadkart.com` | `Demo@1234` |

You can also create a new account on **/sign-up**. Every new account gets its
own workspace, pre-filled with the same demo catalog.

## How it works

The UI is unchanged from the original project. The only difference is where
API calls go:

- `lib/api/client.ts` sends every request to `mockFetch()` instead of `fetch()`.
- `lib/mock/server.ts` is a small in-browser backend that implements the same
  endpoints, response shapes and error codes as the real Commerce Core API
  (auth, workspace, products, inventory, variants and product options).
- `lib/mock/seed.ts` holds the demo catalog: 25 apparel products for a
  made-up store called "Urban Threads Co.", with size and colour variants and a
  mix of stock levels (in stock, low stock, out of stock, draft, archived).

Data is saved in the browser's `localStorage` (key `mlk_demo_db_v1`), so
products you add, stock you adjust and accounts you create are kept between
visits on the same browser. To restore the original demo data, clear that key
in the browser's dev tools (Application → Local Storage) and reload the page.

The dashboard home, orders, customers and notifications use the demo data in
`data/mockData.ts`, as in the original project.
