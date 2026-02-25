# TripPlanner

A trip planning web application that calculates routes, fuel costs, and public transport options based on your vehicle type. Built for the Indian market with real-world mileage data and pricing in Indian Rupees.

**Live:** Just open `index.html` in any browser. No build tools, no dependencies to install.

## Features

### Route Planning
- Enter any origin and destination worldwide — powered by **OpenStreetMap Nominatim** geocoding
- Autocomplete suggestions as you type
- Shortest distance route calculated via **OSRM** (Open Source Routing Machine)
- Interactive map with route visualization using **Leaflet.js**
- Swap origin/destination with one click

### Vehicle Types
| Type | What You Get |
|------|-------------|
| **Car** | Route + fuel required based on your actual car's mileage |
| **Bike** | Route + fuel required based on your actual bike's mileage |
| **Bicycle** | Route + estimated calories burned |
| **Walking** | Route + estimated calories burned |
| **Public Transport** | Detailed suggestions for Bus, Train, Metro, Cab, and Auto Rickshaw |

### Vehicle Database (Car & Bike)
When you select Car or Bike, a vehicle details panel appears with cascading dropdowns:

**Brand → Model → Fuel Type → Mileage (auto-displayed)**

- **48 brands** and **450+ models** covering the Indian market
- Cars: Maruti Suzuki, Hyundai, Tata, Mahindra, Kia, Toyota, Honda, MG, Volkswagen, Skoda, Renault, Nissan, Citroen, Ford, Jeep, Fiat, BYD, BMW, Mercedes-Benz, Audi, Volvo, Land Rover, Lexus, Porsche, Mini, Isuzu, Force
- Bikes: Hero, Honda, Bajaj, TVS, Royal Enfield, Yamaha, KTM, Suzuki, Kawasaki, Triumph, BMW Motorrad, Jawa, Husqvarna, Aprilia, Benelli, Harley-Davidson, Ducati, Ola Electric, Ather, Revolt, Simple Energy
- Fuel types: Petrol, Diesel, CNG, Electric
- **Real-world mileage** values (not inflated ARAI claims)

### Fuel Calculation
- Fuel required = Distance / Vehicle mileage
- Cost calculated using Indian fuel prices:
  - Petrol: ₹105/L
  - Diesel: ₹92/L
  - CNG: ₹80/kg
  - Electric: ₹1.5/km

### Public Transport Details
Each transport mode card includes:
- **Estimated time and cost** based on actual route distance
- **Available classes/types** with per-class fares (e.g., Train: General, Sleeper, 3A, 2A, 1A)
- **Fare breakdown** (base fare, per km rate, reservation charges, GST)
- **Route details** (station-to-station, intermediate stops, road/rail type)
- **Schedule** (first/last service, peak hours, frequency)
- **Booking platforms** (IRCTC, RedBus, Ola, Uber, etc.)
- **Travel tips** for each mode
- **Auto Rickshaw** option for routes under 50 km
- **Metro** option for routes under 80 km

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (dark theme, responsive) |
| Logic | Vanilla JavaScript (ES5 compatible) |
| Maps | [Leaflet.js](https://leafletjs.com/) + OpenStreetMap tiles |
| Geocoding | [Nominatim](https://nominatim.openstreetmap.org/) (free, no API key) |
| Routing | [OSRM](https://project-osrm.org/) (free, no API key) |

**Zero build tools. Zero npm. Zero API keys required.**

## Project Structure

```
TourPlanner/
├── index.html    # Page structure and form layout
├── style.css     # Dark theme, responsive styles, animations
├── app.js        # All application logic and vehicle database
└── README.md
```

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/rinzler-oss/TourPlanner.git
   ```
2. Open `index.html` in your browser.

That's it. No server needed — everything runs client-side.

## Usage

1. Type an **origin** and select from the dropdown suggestions
2. Type a **destination** and select from the dropdown suggestions
3. Pick a **travel date**
4. Select a **vehicle type** (Car, Bike, Bicycle, Walking, or Public Transport)
5. If Car/Bike: select your **Brand → Model → Fuel Type** from the dropdowns
6. Click **Plan My Trip**
7. View the route on the map and scroll down for results

## Screenshots

### Route Summary (Own Vehicle)
Shows distance, estimated time, fuel required with cost, and your vehicle info.

### Public Transport Options
Shows detailed cards for Bus, Train, Metro, Cab, and Auto Rickshaw with fare breakdown, class options, booking platforms, and tips.

## API Usage Notes

This app uses free, public APIs with no authentication required:

- **Nominatim** has a usage policy of max 1 request/second — the app debounces autocomplete at 400ms
- **OSRM demo server** is for light usage — not intended for heavy production traffic
- **OpenStreetMap tiles** are free with proper attribution (included in the app)

## License

MIT
