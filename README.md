# E-Waste Collection and Recycling Management System

A browser-based dashboard concept for organizing electronic-waste pickup requests, tracking recycling centers, and highlighting recovered materials. The project includes a MySQL schema and sample records alongside a responsive HTML, CSS, and JavaScript frontend.

## Features

- Light and dark themes with the choice saved in the browser.
- Responsive dashboard with collection and recovery summary cards.
- E-waste categories and recycling center listings.
- Sample collection request table with text search.
- Pickup request form that adds demo requests to the current page.
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
3. `Collection_Requests` and `Request_Items`
4. `Collections` and `Recycling_Records`
5. `Recovered_Materials`

An entity-relationship diagram is available as [E-Waste Recycling ER Diagram.png](./E-Waste%20Recycling%20ER%20Diagram.png).

## Project files

- `index.html` — dashboard and page structure.
- `styles.css` — responsive layout, project color palette, and theme styles.
- `app.js` — sample dashboard data, search, theme toggle, and demo pickup form behavior.
- `E-Waste Collection and Recycling Management System..sql` — MySQL schema and sample data.
- `E-Waste Recycling ER Diagram.png` — database relationship diagram.

## Frontend and database status

The current frontend uses sample data defined in `app.js`; it does not connect to MySQL. Submitting the pickup form updates the in-memory demo list and does not save a database record. Connecting the interface to the SQL database requires a backend API and appropriate server-side validation and authentication.
