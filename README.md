# EcoCycle – E-waste collection and recycling

A browser-based operations dashboard for e-waste pickup and drop-off requests. It has two roles (user and administrator), an interactive recycling-point map, and a MySQL schema for the future backend.

## Run it

No build step. Serve the folder and open it in a browser:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly also works, but serving the folder is recommended (map tiles and geolocation behave better over `http://localhost`).

An internet connection is needed for the map (tiles, place search and nearby results). Everything else, including Leaflet and the fonts, is bundled in `vendor/` and `fonts/`.

## Demo accounts

On the sign-in screen use **Fill user** or **Fill administrator**, then sign in with any password of 6+ characters. Sign-in is simulated and not secure.

## What is in v2

- Application layout: sidebar navigation, top bar, light and dark themes.
- **User:** overview, new pickup or drop-off request, own requests with status history, cancel while Pending, categories, safety guide.
- **Administrator:** overview with status, category and weekly charts; review queue with Approve and Reject; all-requests table with search, status and method filters; request detail panel with history, status update and delete; CSV export.
- **Map:** search by Indian city or PIN code, use device location, or click anywhere on the map. Results (recycling points, electronics shops, scrap yards) appear as markers and as a list that stay in sync; filter by type and radius (5, 10 or 25 km); "Use for drop-off request" copies the point into the request form.
  - Place search: Nominatim. Nearby places: Overpass API, with automatic fallback across public servers. Invalid or incomplete server responses are skipped.
  - Tiles: OpenStreetMap and CARTO, with automatic fallback between providers if one is unavailable.
  - Listings are community-mapped and are not confirmed partners. Always call ahead.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Design tokens, layout, components |
| `app.js` | Application logic and map module |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2-Clause) |
| `fonts/` | IBM Plex Sans (SIL OFL 1.1) |
| `DATABASE.sql`, `ER MODEL.png` | MySQL schema and ER diagram |

## Status and limits

- Data (sample requests, new requests, session, theme) is saved in browser storage on the current device. Nothing connects to MySQL yet.
- Sign-in and the administrator role are not protected. A real deployment needs server-side authentication and authorization, validation, and an API in front of the database.
- The public Nominatim and Overpass servers have usage limits. For production traffic, proxy and cache these requests on your own server.
- See the PRD for the schema changes and API needed to go from prototype to product.

Map data © OpenStreetMap contributors.
