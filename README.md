# EcoCycle — E-waste Collection and Recycling

EcoCycle is a browser-based prototype for managing household e-waste collection. People can submit pickup or drop-off requests and follow their status; administrators can review requests and manage their progress. The app also includes an interactive map of possible drop-off locations and a safety guide.

![EcoCycle administrator dashboard](ui.jpeg)

## Features

### For users

- View an overview of your requests and their current statuses.
- Request a home pickup or arrange a drop-off, including category, quantity, date, location, phone, and notes.
- Browse request history and cancel a request while it is pending.
- Find recycling points, electronics shops, and scrap yards on a map; use a result as the location for a drop-off request.
- Browse accepted item categories and read the device preparation and battery safety guidance.

### For administrators

- View request summaries and charts by status, category, and week.
- Review requests, approve or reject them, and update request status.
- Search and filter requests by text, status, or collection method.
- View request details and status history, delete requests, and export filtered results as CSV.

### Map

- Search Indian cities or PIN codes, use the device location, or click the map.
- Search within 5, 10, or 25 km and filter results by place type.
- Map tiles use OpenStreetMap and CARTO. Place lookup uses Nominatim and nearby results use Overpass, with fallback map-tile and Overpass servers.

Map listings are sourced from OpenStreetMap and may be incomplete or outdated. A shop or scrap yard is not a confirmed e-waste collection partner; contact the location to confirm it accepts your items and check its opening hours before visiting.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. The sign-in and collection-request demo works without a backend. An internet connection is needed for map tiles and place searches. Browser geolocation is generally available only on HTTPS pages or localhost.

## Sign in

- Demo user: `rahul@example.com` / `demo1234`
- Demo administrator: `admin@example.com` / `demo1234`
- New accounts are registered as users.
- Choose the matching role on the sign-in form.

## Data and security

- The theme preference, demo accounts, and collection requests are stored in this browser only. They are not shared across browsers or devices.
- Sign-in is for demonstration only and is not secure. Anyone can choose the administrator role; do not use real credentials or sensitive personal information.
- Map searches send the entered place name or coordinates to the public Nominatim and Overpass services. These services have usage limits; production traffic should use appropriately configured, self-managed services or a compliant proxy and cache.

## Project files

| File or folder | Purpose |
| --- | --- |
| `index.html` | App structure, forms, and views |
| `app.js` | Sign-in, browser-stored requests, interactions, and map behavior |
| `styles.css` | Layout, components, and light/dark themes |
| `vendor/leaflet/` | Locally bundled Leaflet map library and assets |
| `fonts/` | Locally bundled IBM Plex Sans fonts and license |
| `Assest/` | App logo and favicon |
| `ui.jpeg` | Dashboard preview |

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Map tiles may also be provided by [CARTO](https://carto.com/attributions).
