# E-Waste Collection and Recycling Management System

A browser-based dashboard concept for organizing electronic-waste pickup requests, tracking recycling centers, and highlighting recovered materials. The project includes a MySQL schema and sample records alongside a responsive HTML, CSS, and JavaScript frontend.

## Features

- Light and dark themes with the choice saved in the browser.
- Login and signup screens with separate user and administrator dashboard views.
- User home-pickup and shop drop-off requests with a personal request-status list.
- Administrator request review, status updates through processing, search, and record deletion.
- Fourteen e-waste categories, including consoles, small appliances, cameras, and wearables.
- Live searches for mapped e-waste recycling points and nearby electronics shops from OpenStreetMap by Indian city, postcode, or device location. Shop listings are potential drop-off options; users should confirm acceptance directly.
- Demo requests, including the selected shop or pickup address, saved in browser storage.
- MySQL schema and sample data for the core recycling workflow.

## Run the frontend

No package installation or build step is required. From the project folder, start a local static server:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a browser. You can also open `index.html` directly, although serving the folder locally is recommended.

## Database

The script [E-Waste Collection and Recycling Management System..sql](./E-Waste%20Collection%20and%20Recycling%20Management%20System..sql) creates the `ewaste_management` database, creates the tables, inserts sample records, and displays the resulting data. It is written for MySQL.

Run the script from a MySQL client in the project folder:

```sh
mysql -u YOUR_USERNAME -p < "E-Waste Collection and Recycling Management System..sql"
```

The schema covers:

1. `Users` and `Admins`
2. `Waste_Categories` and `Recycling_Centers`
3. `Collection_Requests` (pickup or drop-off method and processing status) and `Request_Items`
4. `Collections` and `Recycling_Records`
5. `Recovered_Materials`

An entity-relationship diagram is available as [E-Waste Recycling ER Diagram.png](./E-Waste%20Recycling%20ER%20Diagram.png).

## Project files

- `index.html` — dashboard and page structure.
- `styles.css` — responsive layout, project color palette, and theme styles.
- `app.js` — sample dashboard data, search, theme toggle, and demo pickup/drop-off request behavior.
- `E-Waste Collection and Recycling Management System..sql` — MySQL schema and sample data.
- `E-Waste Recycling ER Diagram.png` — database relationship diagram.

## Frontend and database status

The current frontend uses sample request data defined in `app.js`; it does not connect to MySQL. The drop-off search geocodes a submitted Indian city or postcode with the Nominatim API, then searches OpenStreetMap's Overpass API for nearby places tagged for electrical/electronic recycling. Device location is optional and requires browser permission. Search results depend on community map data and are not guaranteed partners; users should call ahead to confirm a location's accepted items and hours. The login and signup screens only demonstrate role-specific navigation and are not real authentication: credentials are not checked or stored, and choosing the administrator role is not protected. Requests and the demo session are saved in browser storage on the current device. Connecting this interface to the SQL database requires a backend API, server-side authentication and authorization, and server-side validation.
