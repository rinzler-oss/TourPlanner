(function () {
  'use strict';

  // ===== State =====
  let selectedVehicle = null;
  let map = null;
  let routeLayer = null;
  let markersLayer = null;
  let originCoords = null;
  let destinationCoords = null;
  let debounceTimer = null;

  // ===== Vehicle Speed Config =====
  const VEHICLE_SPEED = { car: 60, bike: 45, bicycle: 15, walking: 5 };

  // ===== Fuel Prices (India, per liter/kg) =====
  const FUEL_PRICE = {
    'Petrol': 105,
    'Diesel': 92,
    'CNG': 80,
    'Electric': 0,
  };
  const ELECTRIC_COST_PER_KM = 1.5; // ₹ per km average

  // ===== Indian Vehicle Database (Real-world mileage figures) =====
  // Mileage = real-world average, NOT ARAI claimed
  const VEHICLE_DB = {
    car: [
      { brand: 'Maruti Suzuki', models: [
        { name: 'Alto 800', fuels: [{ type: 'Petrol', mileage: 20 }, { type: 'CNG', mileage: 28 }] },
        { name: 'Alto K10', fuels: [{ type: 'Petrol', mileage: 20 }, { type: 'CNG', mileage: 27 }] },
        { name: 'S-Presso', fuels: [{ type: 'Petrol', mileage: 19 }, { type: 'CNG', mileage: 26 }] },
        { name: 'Celerio', fuels: [{ type: 'Petrol', mileage: 20 }, { type: 'CNG', mileage: 27 }] },
        { name: 'WagonR', fuels: [{ type: 'Petrol', mileage: 19 }, { type: 'CNG', mileage: 26 }] },
        { name: 'Ignis', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Swift', fuels: [{ type: 'Petrol', mileage: 18 }, { type: 'CNG', mileage: 24 }] },
        { name: 'Dzire', fuels: [{ type: 'Petrol', mileage: 19 }, { type: 'CNG', mileage: 25 }] },
        { name: 'Baleno', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Fronx', fuels: [{ type: 'Petrol', mileage: 18 }, { type: 'CNG', mileage: 23 }] },
        { name: 'Ciaz', fuels: [{ type: 'Petrol', mileage: 17 }, { type: 'Diesel', mileage: 22 }] },
        { name: 'Brezza', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'CNG', mileage: 21 }] },
        { name: 'Ertiga', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'CNG', mileage: 21 }] },
        { name: 'XL6', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'CNG', mileage: 20 }] },
        { name: 'Jimny', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Grand Vitara', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'Grand Vitara Hybrid', fuels: [{ type: 'Petrol', mileage: 20 }] },
        { name: 'Invicto', fuels: [{ type: 'Petrol', mileage: 19 }] },
        { name: 'Eeco', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'CNG', mileage: 19 }] },
        { name: 'S-Cross', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Ritz', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'Vitara Brezza (Old)', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Omni', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Zen Estilo', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'SX4', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Gypsy', fuels: [{ type: 'Petrol', mileage: 9 }] },
      ]},
      { brand: 'Hyundai', models: [
        { name: 'Santro', fuels: [{ type: 'Petrol', mileage: 17 }, { type: 'CNG', mileage: 23 }] },
        { name: 'Grand i10 Nios', fuels: [{ type: 'Petrol', mileage: 17 }, { type: 'CNG', mileage: 22 }] },
        { name: 'i20', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'i20 N Line', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Aura', fuels: [{ type: 'Petrol', mileage: 17 }, { type: 'CNG', mileage: 22 }] },
        { name: 'Exter', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'CNG', mileage: 22 }] },
        { name: 'Venue', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Venue N Line', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Verna', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Creta', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Creta N Line', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Alcazar', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 15 }] },
        { name: 'Tucson', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'Ioniq 5', fuels: [{ type: 'Electric', mileage: 380 }] },
        { name: 'Kona Electric', fuels: [{ type: 'Electric', mileage: 350 }] },
        { name: 'Eon', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Xcent', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'Elite i20 (Old)', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'i10 Grand', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'Accent', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 16 }] },
      ]},
      { brand: 'Tata', models: [
        { name: 'Tiago', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'CNG', mileage: 22 }] },
        { name: 'Tigor', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'CNG', mileage: 21 }] },
        { name: 'Altroz', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'Punch', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'CNG', mileage: 20 }] },
        { name: 'Nexon', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Curvv', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Harrier', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'Safari', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Tiago EV', fuels: [{ type: 'Electric', mileage: 250 }] },
        { name: 'Tigor EV', fuels: [{ type: 'Electric', mileage: 230 }] },
        { name: 'Punch EV', fuels: [{ type: 'Electric', mileage: 300 }] },
        { name: 'Nexon EV', fuels: [{ type: 'Electric', mileage: 350 }] },
        { name: 'Curvv EV', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'Nano', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Indica', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Indigo', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'Bolt', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Zest', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Hexa', fuels: [{ type: 'Diesel', mileage: 12 }] },
        { name: 'Sumo Gold', fuels: [{ type: 'Diesel', mileage: 11 }] },
      ]},
      { brand: 'Mahindra', models: [
        { name: 'KUV100 NXT', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'XUV300 / 3XO', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'XUV700', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'Scorpio N', fuels: [{ type: 'Petrol', mileage: 9 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Scorpio Classic', fuels: [{ type: 'Diesel', mileage: 12 }] },
        { name: 'Thar', fuels: [{ type: 'Petrol', mileage: 9 }, { type: 'Diesel', mileage: 12 }] },
        { name: 'Thar Roxx', fuels: [{ type: 'Petrol', mileage: 9 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Bolero', fuels: [{ type: 'Diesel', mileage: 13 }] },
        { name: 'Bolero Neo', fuels: [{ type: 'Diesel', mileage: 13 }] },
        { name: 'Marazzo', fuels: [{ type: 'Diesel', mileage: 13 }] },
        { name: 'XUV400 EV', fuels: [{ type: 'Electric', mileage: 350 }] },
        { name: 'BE 6', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'XUV 3XO EV (XUV.e8)', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'Xylo', fuels: [{ type: 'Diesel', mileage: 11 }] },
        { name: 'TUV300', fuels: [{ type: 'Diesel', mileage: 14 }] },
        { name: 'Verito', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
      ]},
      { brand: 'Kia', models: [
        { name: 'Sonet', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Seltos', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Carens', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'Carnival', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'EV6', fuels: [{ type: 'Electric', mileage: 420 }] },
        { name: 'EV9', fuels: [{ type: 'Electric', mileage: 380 }] },
      ]},
      { brand: 'Toyota', models: [
        { name: 'Glanza', fuels: [{ type: 'Petrol', mileage: 17 }, { type: 'CNG', mileage: 23 }] },
        { name: 'Rumion', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'CNG', mileage: 20 }] },
        { name: 'Urban Cruiser Taisor', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'Urban Cruiser Hyryder', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Hyryder Hybrid', fuels: [{ type: 'Petrol', mileage: 20 }] },
        { name: 'Innova Crysta', fuels: [{ type: 'Petrol', mileage: 9 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Innova Hycross', fuels: [{ type: 'Petrol', mileage: 12 }] },
        { name: 'Innova Hycross Hybrid', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'Fortuner', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'Fortuner Legender', fuels: [{ type: 'Diesel', mileage: 11 }] },
        { name: 'Hilux', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'Land Cruiser 300', fuels: [{ type: 'Diesel', mileage: 8 }] },
        { name: 'Camry Hybrid', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Vellfire', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Etios (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Etios Liva (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Yaris (Old)', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Corolla Altis (Old)', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
      ]},
      { brand: 'Honda', models: [
        { name: 'Amaze', fuels: [{ type: 'Petrol', mileage: 16 }, { type: 'Diesel', mileage: 20 }] },
        { name: 'City', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'City Hybrid', fuels: [{ type: 'Petrol', mileage: 19 }] },
        { name: 'Elevate', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Jazz (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'WR-V (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'BR-V (Old)', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Civic (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'CR-V (Old)', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Brio (Old)', fuels: [{ type: 'Petrol', mileage: 16 }] },
      ]},
      { brand: 'MG', models: [
        { name: 'Hector', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'Hector Plus', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Astor', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Gloster', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'ZS EV', fuels: [{ type: 'Electric', mileage: 350 }] },
        { name: 'Comet EV', fuels: [{ type: 'Electric', mileage: 180 }] },
        { name: 'Windsor EV', fuels: [{ type: 'Electric', mileage: 310 }] },
      ]},
      { brand: 'Volkswagen', models: [
        { name: 'Polo (Old)', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Vento (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Taigun', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Virtus', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Tiguan', fuels: [{ type: 'Petrol', mileage: 10 }] },
      ]},
      { brand: 'Skoda', models: [
        { name: 'Rapid (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Kushaq', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Slavia', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Kodiaq', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Superb', fuels: [{ type: 'Petrol', mileage: 11 }] },
        { name: 'Octavia (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
      ]},
      { brand: 'Renault', models: [
        { name: 'Kwid', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Triber', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Kiger', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Duster (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'Captur (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 15 }] },
      ]},
      { brand: 'Nissan', models: [
        { name: 'Magnite', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Kicks (Old)', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'Terrano (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 15 }] },
        { name: 'Micra (Old)', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Sunny (Old)', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'X-Trail', fuels: [{ type: 'Petrol', mileage: 10 }] },
      ]},
      { brand: 'Citroen', models: [
        { name: 'C3', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'C3 Aircross', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'eC3', fuels: [{ type: 'Electric', mileage: 280 }] },
        { name: 'C5 Aircross', fuels: [{ type: 'Diesel', mileage: 14 }] },
        { name: 'Basalt', fuels: [{ type: 'Petrol', mileage: 15 }] },
      ]},
      { brand: 'Ford (Discontinued)', models: [
        { name: 'EcoSport', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Figo', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Aspire', fuels: [{ type: 'Petrol', mileage: 15 }, { type: 'Diesel', mileage: 19 }] },
        { name: 'Freestyle', fuels: [{ type: 'Petrol', mileage: 14 }, { type: 'Diesel', mileage: 18 }] },
        { name: 'Endeavour', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'Ikon', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 15 }] },
        { name: 'Fiesta (Old)', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
      ]},
      { brand: 'Jeep', models: [
        { name: 'Compass', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'Meridian', fuels: [{ type: 'Diesel', mileage: 12 }] },
        { name: 'Wrangler', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 9 }] },
        { name: 'Grand Cherokee', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 9 }] },
      ]},
      { brand: 'Fiat (Discontinued)', models: [
        { name: 'Punto', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Linea', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'Avventura', fuels: [{ type: 'Petrol', mileage: 13 }, { type: 'Diesel', mileage: 17 }] },
        { name: 'Urban Cross', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
      ]},
      { brand: 'BYD', models: [
        { name: 'Atto 3', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'Seal', fuels: [{ type: 'Electric', mileage: 480 }] },
        { name: 'e6', fuels: [{ type: 'Electric', mileage: 380 }] },
      ]},
      { brand: 'BMW', models: [
        { name: '2 Series Gran Coupe', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: '3 Series', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 15 }] },
        { name: '5 Series', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: '7 Series', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'X1', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 15 }] },
        { name: 'X3', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'X5', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'X7', fuels: [{ type: 'Petrol', mileage: 7 }] },
        { name: 'iX1', fuels: [{ type: 'Electric', mileage: 380 }] },
        { name: 'i4', fuels: [{ type: 'Electric', mileage: 430 }] },
        { name: 'i7', fuels: [{ type: 'Electric', mileage: 500 }] },
        { name: 'iX', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'Z4', fuels: [{ type: 'Petrol', mileage: 9 }] },
        { name: 'M340i', fuels: [{ type: 'Petrol', mileage: 8 }] },
      ]},
      { brand: 'Mercedes-Benz', models: [
        { name: 'A-Class Limousine', fuels: [{ type: 'Petrol', mileage: 12 }, { type: 'Diesel', mileage: 16 }] },
        { name: 'C-Class', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'E-Class', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'S-Class', fuels: [{ type: 'Petrol', mileage: 8 }] },
        { name: 'GLA', fuels: [{ type: 'Petrol', mileage: 11 }, { type: 'Diesel', mileage: 14 }] },
        { name: 'GLB', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'GLC', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'GLE', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'GLS', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 10 }] },
        { name: 'EQA', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'EQB', fuels: [{ type: 'Electric', mileage: 380 }] },
        { name: 'EQS', fuels: [{ type: 'Electric', mileage: 580 }] },
        { name: 'V-Class', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'AMG GT', fuels: [{ type: 'Petrol', mileage: 6 }] },
        { name: 'Maybach S-Class', fuels: [{ type: 'Petrol', mileage: 7 }] },
      ]},
      { brand: 'Audi', models: [
        { name: 'A4', fuels: [{ type: 'Petrol', mileage: 11 }] },
        { name: 'A6', fuels: [{ type: 'Petrol', mileage: 10 }] },
        { name: 'A8', fuels: [{ type: 'Petrol', mileage: 8 }] },
        { name: 'Q3', fuels: [{ type: 'Petrol', mileage: 11 }] },
        { name: 'Q5', fuels: [{ type: 'Petrol', mileage: 10 }] },
        { name: 'Q7', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'Q8', fuels: [{ type: 'Petrol', mileage: 7 }] },
        { name: 'e-tron', fuels: [{ type: 'Electric', mileage: 360 }] },
        { name: 'e-tron GT', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: 'RS5', fuels: [{ type: 'Petrol', mileage: 7 }] },
      ]},
      { brand: 'Volvo', models: [
        { name: 'XC40', fuels: [{ type: 'Petrol', mileage: 11 }] },
        { name: 'XC40 Recharge', fuels: [{ type: 'Electric', mileage: 350 }] },
        { name: 'XC60', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'XC90', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'S60', fuels: [{ type: 'Petrol', mileage: 10 }] },
        { name: 'S90', fuels: [{ type: 'Petrol', mileage: 9 }, { type: 'Diesel', mileage: 12 }] },
        { name: 'C40 Recharge', fuels: [{ type: 'Electric', mileage: 360 }] },
      ]},
      { brand: 'Land Rover', models: [
        { name: 'Range Rover Evoque', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'Range Rover Velar', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 10 }] },
        { name: 'Range Rover Sport', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 9 }] },
        { name: 'Range Rover', fuels: [{ type: 'Petrol', mileage: 6 }, { type: 'Diesel', mileage: 8 }] },
        { name: 'Discovery Sport', fuels: [{ type: 'Petrol', mileage: 8 }, { type: 'Diesel', mileage: 11 }] },
        { name: 'Defender', fuels: [{ type: 'Petrol', mileage: 7 }, { type: 'Diesel', mileage: 9 }] },
      ]},
      { brand: 'Lexus', models: [
        { name: 'ES 300h', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'NX 350h', fuels: [{ type: 'Petrol', mileage: 12 }] },
        { name: 'RX 500h', fuels: [{ type: 'Petrol', mileage: 10 }] },
        { name: 'LS 500h', fuels: [{ type: 'Petrol', mileage: 9 }] },
        { name: 'LM 350h', fuels: [{ type: 'Petrol', mileage: 11 }] },
      ]},
      { brand: 'Porsche', models: [
        { name: 'Macan', fuels: [{ type: 'Petrol', mileage: 8 }] },
        { name: 'Cayenne', fuels: [{ type: 'Petrol', mileage: 7 }] },
        { name: 'Taycan', fuels: [{ type: 'Electric', mileage: 400 }] },
        { name: '911', fuels: [{ type: 'Petrol', mileage: 7 }] },
        { name: 'Panamera', fuels: [{ type: 'Petrol', mileage: 7 }] },
      ]},
      { brand: 'Mini', models: [
        { name: 'Cooper', fuels: [{ type: 'Petrol', mileage: 12 }] },
        { name: 'Cooper S', fuels: [{ type: 'Petrol', mileage: 10 }] },
        { name: 'Countryman', fuels: [{ type: 'Petrol', mileage: 10 }, { type: 'Diesel', mileage: 13 }] },
        { name: 'Cooper SE (Electric)', fuels: [{ type: 'Electric', mileage: 220 }] },
      ]},
      { brand: 'Isuzu', models: [
        { name: 'D-Max V-Cross', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'MU-X', fuels: [{ type: 'Diesel', mileage: 10 }] },
        { name: 'D-Max Hi-Lander', fuels: [{ type: 'Diesel', mileage: 11 }] },
      ]},
      { brand: 'Force', models: [
        { name: 'Gurkha', fuels: [{ type: 'Diesel', mileage: 10 }] },
      ]},
    ],
    bike: [
      { brand: 'Hero', models: [
        { name: 'Splendor Plus', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Splendor Plus Xtec', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'HF 100', fuels: [{ type: 'Petrol', mileage: 60 }] },
        { name: 'HF Deluxe', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Super Splendor', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Passion Pro', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Passion Xtec', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Glamour', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Glamour Xtec', fuels: [{ type: 'Petrol', mileage: 47 }] },
        { name: 'Achiever 150', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Xtreme 125R', fuels: [{ type: 'Petrol', mileage: 45 }] },
        { name: 'Xtreme 160R', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'Xtreme 160R 4V', fuels: [{ type: 'Petrol', mileage: 38 }] },
        { name: 'Xpulse 200', fuels: [{ type: 'Petrol', mileage: 35 }] },
        { name: 'Xpulse 200 4V', fuels: [{ type: 'Petrol', mileage: 33 }] },
        { name: 'Karizma XMR', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Mavrick 440', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Maestro Edge 125', fuels: [{ type: 'Petrol', mileage: 45 }] },
        { name: 'Destini 125', fuels: [{ type: 'Petrol', mileage: 44 }] },
        { name: 'Pleasure Plus', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Vida V1 Pro', fuels: [{ type: 'Electric', mileage: 110 }] },
        { name: 'Vida V1 Plus', fuels: [{ type: 'Electric', mileage: 95 }] },
      ]},
      { brand: 'Honda', models: [
        { name: 'Activa 6G', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Activa 125', fuels: [{ type: 'Petrol', mileage: 45 }] },
        { name: 'Dio 110', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Dio 125', fuels: [{ type: 'Petrol', mileage: 44 }] },
        { name: 'Grazia 125', fuels: [{ type: 'Petrol', mileage: 43 }] },
        { name: 'Livo', fuels: [{ type: 'Petrol', mileage: 52 }] },
        { name: 'Dream', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Shine 100', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Shine 125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'SP125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Unicorn', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Hornet 2.0', fuels: [{ type: 'Petrol', mileage: 38 }] },
        { name: 'CB200X', fuels: [{ type: 'Petrol', mileage: 35 }] },
        { name: 'CB300F', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'CB300R', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'CB350', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'CB350 RS', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'CBR250R (Old)', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Africa Twin', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Gold Wing', fuels: [{ type: 'Petrol', mileage: 14 }] },
      ]},
      { brand: 'Bajaj', models: [
        { name: 'CT 110', fuels: [{ type: 'Petrol', mileage: 60 }] },
        { name: 'Platina 110', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Discover 110', fuels: [{ type: 'Petrol', mileage: 52 }] },
        { name: 'Discover 125', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Pulsar 125', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Pulsar 150', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Pulsar N150', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Pulsar NS160', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'Pulsar N160', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'Pulsar NS200', fuels: [{ type: 'Petrol', mileage: 33 }] },
        { name: 'Pulsar N250', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'Pulsar F250', fuels: [{ type: 'Petrol', mileage: 31 }] },
        { name: 'Pulsar RS200', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'Pulsar NS400Z', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Avenger Street 160', fuels: [{ type: 'Petrol', mileage: 38 }] },
        { name: 'Avenger Cruise 220', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'Dominar 250', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Dominar 400', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'Chetak EV', fuels: [{ type: 'Electric', mileage: 90 }] },
      ]},
      { brand: 'TVS', models: [
        { name: 'Sport', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'Star City Plus', fuels: [{ type: 'Petrol', mileage: 52 }] },
        { name: 'Radeon', fuels: [{ type: 'Petrol', mileage: 53 }] },
        { name: 'Raider 125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Apache RTR 160 2V', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Apache RTR 160 4V', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'Apache RTR 200 4V', fuels: [{ type: 'Petrol', mileage: 33 }] },
        { name: 'Apache RR 310', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Ronin', fuels: [{ type: 'Petrol', mileage: 35 }] },
        { name: 'Jupiter 110', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Jupiter 125', fuels: [{ type: 'Petrol', mileage: 45 }] },
        { name: 'Ntorq 125', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Scooty Pep Plus', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Scooty Zest', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'XL100', fuels: [{ type: 'Petrol', mileage: 55 }] },
        { name: 'iQube S', fuels: [{ type: 'Electric', mileage: 100 }] },
        { name: 'iQube ST', fuels: [{ type: 'Electric', mileage: 120 }] },
      ]},
      { brand: 'Royal Enfield', models: [
        { name: 'Hunter 350', fuels: [{ type: 'Petrol', mileage: 33 }] },
        { name: 'Classic 350', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'Bullet 350', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Meteor 350', fuels: [{ type: 'Petrol', mileage: 32 }] },
        { name: 'Himalayan 411 (Old)', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Himalayan 450', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'Shotgun 650', fuels: [{ type: 'Petrol', mileage: 24 }] },
        { name: 'Interceptor 650', fuels: [{ type: 'Petrol', mileage: 24 }] },
        { name: 'Continental GT 650', fuels: [{ type: 'Petrol', mileage: 23 }] },
        { name: 'Super Meteor 650', fuels: [{ type: 'Petrol', mileage: 23 }] },
        { name: 'Classic 500 (Old)', fuels: [{ type: 'Petrol', mileage: 26 }] },
        { name: 'Thunderbird 350 (Old)', fuels: [{ type: 'Petrol', mileage: 28 }] },
      ]},
      { brand: 'Yamaha', models: [
        { name: 'Saluto 125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'FZ-S FI V4', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'FZ-FI V4', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'FZ-X', fuels: [{ type: 'Petrol', mileage: 38 }] },
        { name: 'MT-15 V2', fuels: [{ type: 'Petrol', mileage: 37 }] },
        { name: 'R15 V4', fuels: [{ type: 'Petrol', mileage: 37 }] },
        { name: 'R15M', fuels: [{ type: 'Petrol', mileage: 36 }] },
        { name: 'YZF R3', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'MT-03', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'Ray ZR 125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Fascino 125', fuels: [{ type: 'Petrol', mileage: 50 }] },
        { name: 'Aerox 155', fuels: [{ type: 'Petrol', mileage: 35 }] },
        { name: 'RX100 (Old)', fuels: [{ type: 'Petrol', mileage: 40 }] },
      ]},
      { brand: 'KTM', models: [
        { name: 'Duke 125', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Duke 200', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Duke 250', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Duke 390', fuels: [{ type: 'Petrol', mileage: 24 }] },
        { name: 'RC 125', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'RC 200', fuels: [{ type: 'Petrol', mileage: 29 }] },
        { name: 'RC 390', fuels: [{ type: 'Petrol', mileage: 22 }] },
        { name: '250 Adventure', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: '390 Adventure', fuels: [{ type: 'Petrol', mileage: 24 }] },
      ]},
      { brand: 'Suzuki', models: [
        { name: 'Access 125', fuels: [{ type: 'Petrol', mileage: 48 }] },
        { name: 'Avenis 125', fuels: [{ type: 'Petrol', mileage: 43 }] },
        { name: 'Burgman Street 125', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Gixxer 150', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'Gixxer 250', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Gixxer SF 250', fuels: [{ type: 'Petrol', mileage: 29 }] },
        { name: 'V-Strom SX 250', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Hayabusa', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Intruder 150', fuels: [{ type: 'Petrol', mileage: 40 }] },
      ]},
      { brand: 'Kawasaki', models: [
        { name: 'Ninja 300', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'Ninja 400', fuels: [{ type: 'Petrol', mileage: 22 }] },
        { name: 'Ninja 650', fuels: [{ type: 'Petrol', mileage: 20 }] },
        { name: 'Ninja ZX-4R', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Ninja ZX-6R', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Ninja ZX-10R', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Z650', fuels: [{ type: 'Petrol', mileage: 21 }] },
        { name: 'Z900', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'Versys 650', fuels: [{ type: 'Petrol', mileage: 20 }] },
        { name: 'Vulcan S', fuels: [{ type: 'Petrol', mileage: 19 }] },
        { name: 'W800', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Eliminator', fuels: [{ type: 'Petrol', mileage: 23 }] },
      ]},
      { brand: 'Triumph', models: [
        { name: 'Speed 400', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Scrambler 400 X', fuels: [{ type: 'Petrol', mileage: 27 }] },
        { name: 'Trident 660', fuels: [{ type: 'Petrol', mileage: 20 }] },
        { name: 'Street Triple', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Tiger Sport 660', fuels: [{ type: 'Petrol', mileage: 19 }] },
        { name: 'Tiger 900', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Speed Twin 900', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'Bonneville T120', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'Rocket 3', fuels: [{ type: 'Petrol', mileage: 12 }] },
      ]},
      { brand: 'BMW Motorrad', models: [
        { name: 'G 310 R', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'G 310 GS', fuels: [{ type: 'Petrol', mileage: 27 }] },
        { name: 'F 850 GS', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'F 900 R', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'R 1250 GS', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'S 1000 R', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'S 1000 RR', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'S 1000 XR', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'M 1000 RR', fuels: [{ type: 'Petrol', mileage: 12 }] },
        { name: 'CE 04 (Electric)', fuels: [{ type: 'Electric', mileage: 100 }] },
      ]},
      { brand: 'Jawa', models: [
        { name: 'Jawa 350', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Jawa 42', fuels: [{ type: 'Petrol', mileage: 30 }] },
        { name: 'Perak', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Jawa 42 Bobber', fuels: [{ type: 'Petrol', mileage: 28 }] },
      ]},
      { brand: 'Husqvarna', models: [
        { name: 'Svartpilen 250', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Vitpilen 250', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Svartpilen 401', fuels: [{ type: 'Petrol', mileage: 24 }] },
        { name: 'Vitpilen 401', fuels: [{ type: 'Petrol', mileage: 24 }] },
      ]},
      { brand: 'Aprilia', models: [
        { name: 'SR 125', fuels: [{ type: 'Petrol', mileage: 42 }] },
        { name: 'SR 160', fuels: [{ type: 'Petrol', mileage: 38 }] },
        { name: 'SXR 125', fuels: [{ type: 'Petrol', mileage: 40 }] },
        { name: 'SXR 160', fuels: [{ type: 'Petrol', mileage: 36 }] },
        { name: 'RS 457', fuels: [{ type: 'Petrol', mileage: 22 }] },
        { name: 'Tuono 457', fuels: [{ type: 'Petrol', mileage: 22 }] },
      ]},
      { brand: 'Benelli', models: [
        { name: 'Imperiale 400', fuels: [{ type: 'Petrol', mileage: 25 }] },
        { name: 'Leoncino 500', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: 'TRK 502', fuels: [{ type: 'Petrol', mileage: 18 }] },
        { name: '502C Cruiser', fuels: [{ type: 'Petrol', mileage: 17 }] },
      ]},
      { brand: 'Harley-Davidson', models: [
        { name: 'X440', fuels: [{ type: 'Petrol', mileage: 28 }] },
        { name: 'Nightster', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Fat Boy', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Road Glide', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'Pan America', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Sportster S', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Iron 883 (Old)', fuels: [{ type: 'Petrol', mileage: 16 }] },
        { name: 'Street 750 (Old)', fuels: [{ type: 'Petrol', mileage: 18 }] },
      ]},
      { brand: 'Ducati', models: [
        { name: 'Scrambler 800', fuels: [{ type: 'Petrol', mileage: 17 }] },
        { name: 'Monster', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Panigale V2', fuels: [{ type: 'Petrol', mileage: 14 }] },
        { name: 'Panigale V4', fuels: [{ type: 'Petrol', mileage: 12 }] },
        { name: 'Multistrada V4', fuels: [{ type: 'Petrol', mileage: 15 }] },
        { name: 'Diavel V4', fuels: [{ type: 'Petrol', mileage: 13 }] },
        { name: 'DesertX', fuels: [{ type: 'Petrol', mileage: 16 }] },
      ]},
      { brand: 'Ola Electric', models: [
        { name: 'S1 Pro', fuels: [{ type: 'Electric', mileage: 120 }] },
        { name: 'S1 X+', fuels: [{ type: 'Electric', mileage: 105 }] },
        { name: 'S1 X', fuels: [{ type: 'Electric', mileage: 90 }] },
        { name: 'S1 Air', fuels: [{ type: 'Electric', mileage: 75 }] },
        { name: 'Roadster X', fuels: [{ type: 'Electric', mileage: 200 }] },
      ]},
      { brand: 'Ather', models: [
        { name: '450X', fuels: [{ type: 'Electric', mileage: 105 }] },
        { name: '450S', fuels: [{ type: 'Electric', mileage: 85 }] },
        { name: 'Rizta', fuels: [{ type: 'Electric', mileage: 110 }] },
      ]},
      { brand: 'Revolt', models: [
        { name: 'RV400', fuels: [{ type: 'Electric', mileage: 100 }] },
        { name: 'RV1', fuels: [{ type: 'Electric', mileage: 130 }] },
      ]},
      { brand: 'Simple Energy', models: [
        { name: 'One', fuels: [{ type: 'Electric', mileage: 150 }] },
      ]},
    ],
  };

  // ===== Selected vehicle info state =====
  let selectedMileage = null; // km/l or km/kg or km/charge
  let selectedFuelType = null;
  let selectedModelName = null;
  let selectedBrandName = null;

  // ===== DOM References =====
  const $ = (id) => document.getElementById(id);
  let originInput, destInput, dateInput, planBtn, swapBtn;
  let vehicleSelector, formError, loadingSection;
  let mapSection, routeSummary, publicTransport;
  let summaryCards, routeTips, transportCards;
  let originSuggestions, destSuggestions;
  let vehicleDetailsSection, brandSelect, modelSelect, fuelSelect, mileageDisplay;

  // ===== Initialization =====
  document.addEventListener('DOMContentLoaded', function () {
    originInput = $('origin');
    destInput = $('destination');
    dateInput = $('travel-date');
    planBtn = $('plan-btn');
    swapBtn = $('swap-btn');
    vehicleSelector = $('vehicle-selector');
    formError = $('form-error');
    loadingSection = $('loading');
    mapSection = $('map-section');
    routeSummary = $('route-summary');
    publicTransport = $('public-transport');
    summaryCards = $('summary-cards');
    routeTips = $('route-tips');
    transportCards = $('transport-cards');
    originSuggestions = $('origin-suggestions');
    destSuggestions = $('destination-suggestions');
    vehicleDetailsSection = $('vehicle-details');
    brandSelect = $('vd-brand');
    modelSelect = $('vd-model');
    fuelSelect = $('vd-fuel');
    mileageDisplay = $('vd-mileage');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;

    // Event listeners
    vehicleSelector.addEventListener('click', handleVehicleSelect);
    planBtn.addEventListener('click', handlePlanTrip);
    swapBtn.addEventListener('click', handleSwap);

    // Vehicle detail cascading dropdowns
    brandSelect.addEventListener('change', handleBrandChange);
    modelSelect.addEventListener('change', handleModelChange);
    fuelSelect.addEventListener('change', handleFuelChange);

    // Autocomplete for origin and destination
    originInput.addEventListener('input', function () {
      debounceGeocode(originInput.value, originSuggestions, function (coords) {
        originCoords = coords;
      });
    });
    destInput.addEventListener('input', function () {
      debounceGeocode(destInput.value, destSuggestions, function (coords) {
        destinationCoords = coords;
      });
    });

    // Close suggestions on click outside
    document.addEventListener('click', function (e) {
      if (!originInput.contains(e.target) && !originSuggestions.contains(e.target)) {
        originSuggestions.classList.remove('active');
      }
      if (!destInput.contains(e.target) && !destSuggestions.contains(e.target)) {
        destSuggestions.classList.remove('active');
      }
    });

    initMap();
  });

  // ===== Map Initialization =====
  function initMap() {
    map = L.map('map', { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
  }

  // ===== Geocoding with Nominatim =====
  function debounceGeocode(query, listEl, onSelect) {
    clearTimeout(debounceTimer);
    if (query.length < 3) {
      listEl.classList.remove('active');
      return;
    }
    debounceTimer = setTimeout(function () {
      geocodeSearch(query, listEl, onSelect);
    }, 400);
  }

  function geocodeSearch(query, listEl, onSelect) {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + encodeURIComponent(query);
    fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })
      .then(function (res) { return res.json(); })
      .then(function (results) {
        listEl.innerHTML = '';
        if (results.length === 0) {
          listEl.classList.remove('active');
          return;
        }
        results.forEach(function (place) {
          var li = document.createElement('li');
          li.textContent = place.display_name;
          li.addEventListener('click', function () {
            // Set the input value to the short name
            var input = listEl.previousElementSibling;
            input.value = place.display_name.split(',')[0];
            onSelect({ lat: parseFloat(place.lat), lng: parseFloat(place.lon), name: place.display_name });
            listEl.classList.remove('active');
          });
          listEl.appendChild(li);
        });
        listEl.classList.add('active');
      })
      .catch(function () {
        listEl.classList.remove('active');
      });
  }

  // ===== Vehicle Selection =====
  function handleVehicleSelect(e) {
    var btn = e.target.closest('.vehicle-option');
    if (!btn) return;
    vehicleSelector.querySelectorAll('.vehicle-option').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    selectedVehicle = btn.getAttribute('data-vehicle');

    // Show/hide vehicle details for car and bike
    if (selectedVehicle === 'car' || selectedVehicle === 'bike') {
      vehicleDetailsSection.classList.remove('hidden');
      populateBrands(selectedVehicle);
    } else {
      vehicleDetailsSection.classList.add('hidden');
      resetVehicleDetails();
    }
  }

  // ===== Vehicle Detail Dropdowns =====
  function populateBrands(type) {
    var db = VEHICLE_DB[type] || [];
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    db.forEach(function (entry) {
      var opt = document.createElement('option');
      opt.value = entry.brand;
      opt.textContent = entry.brand;
      brandSelect.appendChild(opt);
    });
    brandSelect.disabled = false;
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    fuelSelect.innerHTML = '<option value="">Select Fuel Type</option>';
    fuelSelect.disabled = true;
    mileageDisplay.textContent = '--';
    resetVehicleSelection();
  }

  function handleBrandChange() {
    var brand = brandSelect.value;
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    fuelSelect.innerHTML = '<option value="">Select Fuel Type</option>';
    fuelSelect.disabled = true;
    mileageDisplay.textContent = '--';
    resetVehicleSelection();

    if (!brand) { modelSelect.disabled = true; return; }

    var db = VEHICLE_DB[selectedVehicle] || [];
    var brandEntry = db.find(function (b) { return b.brand === brand; });
    if (!brandEntry) { modelSelect.disabled = true; return; }

    brandEntry.models.forEach(function (m) {
      var opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = m.name;
      modelSelect.appendChild(opt);
    });
    modelSelect.disabled = false;
    selectedBrandName = brand;
  }

  function handleModelChange() {
    var model = modelSelect.value;
    fuelSelect.innerHTML = '<option value="">Select Fuel Type</option>';
    mileageDisplay.textContent = '--';
    selectedMileage = null;
    selectedFuelType = null;

    if (!model) { fuelSelect.disabled = true; return; }

    var db = VEHICLE_DB[selectedVehicle] || [];
    var brandEntry = db.find(function (b) { return b.brand === brandSelect.value; });
    if (!brandEntry) return;
    var modelEntry = brandEntry.models.find(function (m) { return m.name === model; });
    if (!modelEntry) return;

    modelEntry.fuels.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.type;
      opt.textContent = f.type;
      fuelSelect.appendChild(opt);
    });
    fuelSelect.disabled = false;
    selectedModelName = model;

    // Auto-select if only one fuel type
    if (modelEntry.fuels.length === 1) {
      fuelSelect.value = modelEntry.fuels[0].type;
      handleFuelChange();
    }
  }

  function handleFuelChange() {
    var fuel = fuelSelect.value;
    if (!fuel) { mileageDisplay.textContent = '--'; selectedMileage = null; selectedFuelType = null; return; }

    var db = VEHICLE_DB[selectedVehicle] || [];
    var brandEntry = db.find(function (b) { return b.brand === brandSelect.value; });
    if (!brandEntry) return;
    var modelEntry = brandEntry.models.find(function (m) { return m.name === modelSelect.value; });
    if (!modelEntry) return;
    var fuelEntry = modelEntry.fuels.find(function (f) { return f.type === fuel; });
    if (!fuelEntry) return;

    selectedFuelType = fuel;
    selectedMileage = fuelEntry.mileage;

    if (fuel === 'Electric') {
      mileageDisplay.textContent = fuelEntry.mileage + ' km / full charge';
    } else if (fuel === 'CNG') {
      mileageDisplay.textContent = fuelEntry.mileage + ' km/kg';
    } else {
      mileageDisplay.textContent = fuelEntry.mileage + ' km/l';
    }
  }

  function resetVehicleDetails() {
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    brandSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    fuelSelect.innerHTML = '<option value="">Select Fuel Type</option>';
    fuelSelect.disabled = true;
    mileageDisplay.textContent = '--';
    resetVehicleSelection();
  }

  function resetVehicleSelection() {
    selectedMileage = null;
    selectedFuelType = null;
    selectedModelName = null;
    selectedBrandName = null;
  }

  // ===== Swap =====
  function handleSwap() {
    var temp = originInput.value;
    originInput.value = destInput.value;
    destInput.value = temp;
    var tempCoords = originCoords;
    originCoords = destinationCoords;
    destinationCoords = tempCoords;
  }

  // ===== Plan Trip =====
  function handlePlanTrip() {
    hideError();
    hideResults();

    // Validate
    if (!originInput.value.trim()) return showError('Please enter an origin.');
    if (!destInput.value.trim()) return showError('Please enter a destination.');
    if (!dateInput.value) return showError('Please select a travel date.');
    if (!selectedVehicle) return showError('Please select a vehicle type.');
    if (!originCoords) return showError('Please select an origin from the suggestions dropdown.');
    if (!destinationCoords) return showError('Please select a destination from the suggestions dropdown.');
    if ((selectedVehicle === 'car' || selectedVehicle === 'bike') && !selectedMileage) {
      return showError('Please select your vehicle brand, model, and fuel type.');
    }

    // Show loading
    loadingSection.classList.remove('hidden');
    planBtn.disabled = true;

    // Fetch route from OSRM
    fetchRoute(originCoords, destinationCoords)
      .then(function (routeData) {
        loadingSection.classList.add('hidden');
        planBtn.disabled = false;

        // Show map
        mapSection.classList.remove('hidden');
        displayRoute(routeData);

        var distanceKm = routeData.distance / 1000;
        var durationSec = routeData.duration;

        if (selectedVehicle === 'public') {
          renderPublicTransport(distanceKm, durationSec);
        } else {
          renderRouteSummary(distanceKm, durationSec);
        }

        // Scroll to map
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        loadingSection.classList.add('hidden');
        planBtn.disabled = false;
        showError('Could not find a route. ' + (err.message || 'Please try different locations.'));
      });
  }

  // ===== OSRM Routing (shortest distance) =====
  function fetchRoute(origin, dest) {
    var profile = getOSRMProfile();
    var url = 'https://router.project-osrm.org/route/v1/' + profile + '/' +
      origin.lng + ',' + origin.lat + ';' + dest.lng + ',' + dest.lat +
      '?overview=full&geometries=geojson&alternatives=true';

    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error('No route found between these locations.');
        }
        // Pick the route with the shortest distance
        var shortest = data.routes.reduce(function (best, route) {
          return route.distance < best.distance ? route : best;
        }, data.routes[0]);
        return shortest;
      });
  }

  function getOSRMProfile() {
    switch (selectedVehicle) {
      case 'bicycle': return 'bike';
      case 'walking': return 'foot';
      default: return 'car'; // car, bike (motorcycle), public all use car profile for route shape
    }
  }

  // ===== Display Route on Map =====
  function displayRoute(routeData) {
    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // Origin marker (green)
    var originIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    var originMarker = L.marker([originCoords.lat, originCoords.lng], { icon: originIcon })
      .bindPopup('<b>Start</b><br>' + originInput.value);
    markersLayer.addLayer(originMarker);

    // Destination marker (red)
    var destIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    var destMarker = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon })
      .bindPopup('<b>Destination</b><br>' + destInput.value);
    markersLayer.addLayer(destMarker);

    // Route polyline from actual geometry
    var geojson = routeData.geometry;
    var routeLine = L.geoJSON(geojson, {
      style: { color: '#3b82f6', weight: 5, opacity: 0.85 },
    });
    routeLayer.addLayer(routeLine);

    // Fit bounds to the actual route geometry (not just origin/dest)
    var routeBounds = routeLine.getBounds();
    map.invalidateSize();
    setTimeout(function () {
      map.fitBounds(routeBounds, { padding: [40, 40], maxZoom: 15 });
    }, 150);
  }

  // ===== Render Route Summary (Own Vehicle) =====
  function renderRouteSummary(distanceKm, durationSec) {
    routeSummary.classList.remove('hidden');
    publicTransport.classList.add('hidden');

    var speed = VEHICLE_SPEED[selectedVehicle];

    // For car, use OSRM duration; for others, calculate from speed
    var estimatedHours;
    if (selectedVehicle === 'car') {
      estimatedHours = durationSec / 3600;
    } else if (selectedVehicle === 'bike') {
      estimatedHours = distanceKm / speed;
    } else {
      estimatedHours = distanceKm / speed;
    }

    // Build stat cards
    var cards = [
      {
        icon: '\uD83D\uDCCF',
        value: distanceKm.toFixed(1) + ' km',
        label: 'Total Distance',
      },
      {
        icon: '\u23F1\uFE0F',
        value: formatTime(estimatedHours),
        label: 'Estimated Time',
      },
    ];

    // Fuel / calories card — use real vehicle data for car & bike
    if (selectedVehicle === 'car' || selectedVehicle === 'bike') {
      var fuelCard = buildFuelCard(distanceKm);
      cards.push(fuelCard);
    } else {
      // Bicycle / walking → calories
      var calPerKm = selectedVehicle === 'bicycle' ? 30 : 60;
      var calories = distanceKm * calPerKm;
      cards.push({
        icon: '\uD83D\uDD25',
        value: Math.round(calories).toLocaleString('en-IN') + ' cal',
        label: 'Calories Burned',
      });
    }

    // Show 4th card: vehicle info for car/bike
    if (selectedVehicle === 'car' || selectedVehicle === 'bike') {
      var mileageUnit = selectedFuelType === 'Electric' ? 'km/charge' : (selectedFuelType === 'CNG' ? 'km/kg' : 'km/l');
      cards.push({
        icon: selectedVehicle === 'car' ? '\uD83D\uDE97' : '\uD83C\uDFCD\uFE0F',
        value: selectedBrandName + ' ' + selectedModelName,
        label: selectedFuelType + ' \u00B7 ' + selectedMileage + ' ' + mileageUnit,
      });
    }

    summaryCards.innerHTML = cards.map(function (card, i) {
      return '<div class="stat-card" style="animation-delay:' + (i * 0.1) + 's">' +
        '<div class="stat-icon">' + card.icon + '</div>' +
        '<div class="stat-value">' + card.value + '</div>' +
        '<div class="stat-label">' + card.label + '</div>' +
        '</div>';
    }).join('');

    // Route tips
    var tips = getTips(selectedVehicle, distanceKm, estimatedHours);
    routeTips.innerHTML = '<h3>Travel Tips</h3><ul>' +
      tips.map(function (tip) { return '<li>' + tip + '</li>'; }).join('') +
      '</ul>';
  }

  function buildFuelCard(distanceKm) {
    if (selectedFuelType === 'Electric') {
      var chargesNeeded = Math.ceil(distanceKm / selectedMileage);
      var elecCost = distanceKm * ELECTRIC_COST_PER_KM;
      return {
        icon: '\u26A1',
        value: chargesNeeded + (chargesNeeded === 1 ? ' charge' : ' charges'),
        label: 'Electricity (~\u20B9' + Math.round(elecCost).toLocaleString('en-IN') + ')',
      };
    }
    // Petrol, Diesel, CNG
    var fuelNeeded = distanceKm / selectedMileage;
    var pricePerUnit = FUEL_PRICE[selectedFuelType] || 105;
    var totalCost = fuelNeeded * pricePerUnit;
    var unit = selectedFuelType === 'CNG' ? 'kg' : 'liters';
    return {
      icon: '\u26FD',
      value: fuelNeeded.toFixed(1) + ' ' + unit,
      label: selectedFuelType + ' (~\u20B9' + Math.round(totalCost).toLocaleString('en-IN') + ' @ \u20B9' + pricePerUnit + '/' + (selectedFuelType === 'CNG' ? 'kg' : 'L') + ')',
    };
  }

  function getTips(vehicle, km, hours) {
    var tips = [];
    switch (vehicle) {
      case 'car':
        tips.push('Estimated driving time: ' + formatTime(hours) + ' (without stops).');
        if (hours > 3) tips.push('Plan rest stops every 2 hours to stay alert.');
        if (km > 500) tips.push('Consider splitting the drive over two days.');
        tips.push('Check fuel levels and tire pressure before departure.');
        break;
      case 'bike':
        tips.push('Wear a helmet and protective gear at all times.');
        if (hours > 2) tips.push('Take breaks to avoid fatigue on long rides.');
        tips.push('Check weather conditions before heading out.');
        break;
      case 'bicycle':
        tips.push('Stay hydrated — carry at least 1 liter of water per hour.');
        if (km > 50) tips.push('This is a long ride. Ensure your bicycle is well-maintained.');
        tips.push('Use designated bike lanes where available.');
        tips.push('Pack energy bars or snacks for the journey.');
        break;
      case 'walking':
        tips.push('Wear comfortable, supportive walking shoes.');
        if (km > 10) tips.push('This is a long walk. Consider breaking it into segments.');
        tips.push('Carry water and stay hydrated throughout.');
        tips.push('Use sunscreen and wear a hat if walking in sunlight.');
        break;
    }
    return tips;
  }

  // ===== Render Public Transport Options =====
  function renderPublicTransport(distanceKm, durationSec) {
    publicTransport.classList.remove('hidden');
    routeSummary.classList.add('hidden');

    var origin = originInput.value;
    var dest = destInput.value;

    // Route overview bar
    var overviewEl = document.getElementById('route-overview');
    overviewEl.innerHTML =
      '<div class="overview-item">' +
        '<span class="overview-icon">\uD83D\uDCCD</span>' +
        '<div><div class="overview-label">Route</div><div class="overview-value">' + origin + ' \u2192 ' + dest + '</div></div>' +
      '</div>' +
      '<div class="overview-item">' +
        '<span class="overview-icon">\uD83D\uDCCF</span>' +
        '<div><div class="overview-label">Distance</div><div class="overview-value">' + distanceKm.toFixed(1) + ' km</div></div>' +
      '</div>' +
      '<div class="overview-item">' +
        '<span class="overview-icon">\uD83D\uDCC5</span>' +
        '<div><div class="overview-label">Travel Date</div><div class="overview-value">' + formatDate(document.getElementById('travel-date').value) + '</div></div>' +
      '</div>';

    var options = generateTransportOptions(distanceKm, origin, dest);

    transportCards.innerHTML = options.map(function (opt, i) {
      // Build class tags
      var classTags = opt.classes.map(function (cls) {
        return '<span class="class-tag' + (cls.recommended ? ' recommended' : '') + '">' + cls.name + ' (\u20B9' + cls.fare.toLocaleString('en-IN') + ')' + '</span>';
      }).join('');

      // Build fare breakdown list
      var fareItems = opt.fareBreakdown.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      // Build booking list
      var bookingItems = opt.booking.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      // Build route detail list
      var routeItems = opt.routeDetails.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      // Build schedule list
      var scheduleItems = opt.schedule.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      return '<div class="transport-card" style="border-left-color:' + opt.color + '; animation-delay:' + (i * 0.12) + 's">' +
        // Top section: icon, name, comfort
        '<div class="transport-card-top">' +
          '<div class="transport-header">' +
            '<span class="transport-icon">' + opt.icon + '</span>' +
            '<div>' +
              '<div class="transport-type">' + opt.type + '</div>' +
              '<div class="transport-frequency">' + opt.frequency + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="transport-comfort">' + opt.comfort + '</div>' +
        '</div>' +

        // Stats row
        '<div class="transport-stats-row">' +
          '<div class="transport-stat">' +
            '<div class="stat-value">' + opt.time + '</div>' +
            '<div class="stat-label">Est. Time</div>' +
          '</div>' +
          '<div class="transport-stat">' +
            '<div class="stat-value">' + opt.cost + '</div>' +
            '<div class="stat-label">Est. Cost</div>' +
          '</div>' +
          '<div class="transport-stat">' +
            '<div class="stat-value">' + opt.distance + '</div>' +
            '<div class="stat-label">Distance</div>' +
          '</div>' +
          '<div class="transport-stat">' +
            '<div class="stat-value">' + opt.stops + '</div>' +
            '<div class="stat-label">Stops</div>' +
          '</div>' +
        '</div>' +

        // Class/type tags
        (classTags ? '<div class="detail-section"><div class="detail-section-title">Available Classes / Types</div><div class="class-tags">' + classTags + '</div></div>' : '') +

        // Detail sections grid
        '<div class="transport-detail-sections">' +
          '<div class="detail-section">' +
            '<div class="detail-section-title">Fare Breakdown</div>' +
            '<ul>' + fareItems + '</ul>' +
          '</div>' +
          '<div class="detail-section">' +
            '<div class="detail-section-title">Route Details</div>' +
            '<ul>' + routeItems + '</ul>' +
          '</div>' +
          '<div class="detail-section">' +
            '<div class="detail-section-title">Schedule</div>' +
            '<ul>' + scheduleItems + '</ul>' +
          '</div>' +
          '<div class="detail-section">' +
            '<div class="detail-section-title">Booking</div>' +
            '<ul>' + bookingItems + '</ul>' +
          '</div>' +
        '</div>' +

        // Footer tip
        '<div class="transport-card-footer">' +
          '<span class="tip-icon">\uD83D\uDCA1</span>' +
          '<span class="tip-text">' + opt.tip + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function generateTransportOptions(distanceKm, origin, dest) {
    var options = [];
    var busStops = Math.max(2, Math.round(distanceKm / 25));
    var trainStops = Math.max(1, Math.round(distanceKm / 80));

    // ===== Bus =====
    var busFareMin = Math.round(distanceKm * 1.5);
    var busFareMax = Math.round(distanceKm * 2.5);
    var busACFare = Math.round(distanceKm * 3.5);
    options.push({
      type: 'Bus',
      icon: '\uD83D\uDE8C',
      color: '#22c55e',
      time: formatTime(distanceKm / 35),
      cost: '\u20B9' + busFareMin.toLocaleString('en-IN') + ' - \u20B9' + busFareMax.toLocaleString('en-IN'),
      distance: distanceKm.toFixed(1) + ' km',
      stops: busStops + ' stops',
      frequency: 'Every 20-40 min',
      comfort: '\u2605\u2605\u2605\u2606\u2606',
      classes: [
        { name: 'Ordinary', fare: busFareMin, recommended: false },
        { name: 'Express', fare: Math.round((busFareMin + busFareMax) / 2), recommended: true },
        { name: 'AC Deluxe', fare: busACFare, recommended: false },
        { name: 'Volvo AC', fare: Math.round(distanceKm * 4.5), recommended: false },
      ],
      fareBreakdown: [
        'Base fare: \u20B930 - \u20B950',
        'Per km: \u20B91.5 (Ordinary) / \u20B93.5 (AC)',
        'Reservation charge: \u20B910 - \u20B930',
        'GST: 5% on AC services',
      ],
      routeDetails: [
        origin + ' Bus Stand \u2192 ' + dest + ' Bus Stand',
        'Route distance: ' + distanceKm.toFixed(1) + ' km',
        'Intermediate stops: ' + busStops,
        'Road type: National Highway / State Highway',
      ],
      schedule: [
        'First bus: ~5:00 AM',
        'Last bus: ~11:00 PM',
        'Peak hours: 7-9 AM, 5-8 PM',
        'Frequency: Every 20-40 minutes',
      ],
      booking: [
        'RedBus (redbus.in)',
        'State Transport Corporation website',
        'AbhiBus (abhibus.com)',
        'Counter booking at bus stand',
      ],
      tip: 'Book AC Volvo buses for long distance comfort. Carry a light blanket as AC buses can get cold. Online booking recommended during holidays and weekends.',
    });

    // ===== Train =====
    var generalFare = Math.max(30, Math.round(distanceKm * 0.6));
    var sleeperFare = Math.max(120, Math.round(distanceKm * 1.2));
    var ac3Fare = Math.max(350, Math.round(distanceKm * 2.5));
    var ac2Fare = Math.max(500, Math.round(distanceKm * 3.5));
    var ac1Fare = Math.max(850, Math.round(distanceKm * 5.5));
    options.push({
      type: 'Train (Indian Railways)',
      icon: '\uD83D\uDE86',
      color: '#3b82f6',
      time: formatTime(distanceKm / 55),
      cost: '\u20B9' + sleeperFare.toLocaleString('en-IN') + ' - \u20B9' + ac2Fare.toLocaleString('en-IN'),
      distance: distanceKm.toFixed(1) + ' km',
      stops: trainStops + ' stops',
      frequency: 'Multiple daily',
      comfort: '\u2605\u2605\u2605\u2605\u2606',
      classes: [
        { name: 'General (GN)', fare: generalFare, recommended: false },
        { name: 'Sleeper (SL)', fare: sleeperFare, recommended: false },
        { name: 'AC 3-Tier (3A)', fare: ac3Fare, recommended: true },
        { name: 'AC 2-Tier (2A)', fare: ac2Fare, recommended: false },
        { name: 'AC 1st Class (1A)', fare: ac1Fare, recommended: false },
      ],
      fareBreakdown: [
        'Base fare: Calculated by distance slab',
        'Reservation charge: \u20B920 (SL) / \u20B940 (AC)',
        'Superfast surcharge: \u20B930 (SL) / \u20B945 (AC)',
        'GST: 5% on AC classes',
        'Tatkal premium: +\u20B9100-400 (if applicable)',
      ],
      routeDetails: [
        origin + ' Railway Station \u2192 ' + dest + ' Railway Station',
        'Rail distance: ~' + distanceKm.toFixed(0) + ' km',
        'Intermediate stations: ' + trainStops,
        'Avg speed: 50-65 km/h (Mail/Express)',
      ],
      schedule: [
        'Multiple trains daily on major routes',
        'Tatkal booking: 10 AM (AC) / 11 AM (Non-AC)',
        'Advance booking: Up to 120 days',
        'Check live status on NTES app',
      ],
      booking: [
        'IRCTC (irctc.co.in) — official platform',
        'Paytm Travel / MakeMyTrip',
        'RailYatri (railyatri.in)',
        'Station counter (PRS)',
      ],
      tip: 'Book via IRCTC at least 2-3 weeks in advance for confirmed tickets. Use Tatkal for last-minute booking (opens at 10 AM for AC). Carry your own food or pre-order meals via IRCTC e-Catering.',
    });

    // ===== Metro (shorter routes) =====
    if (distanceKm < 80) {
      var metroFareMin = Math.max(10, Math.round(distanceKm * 1));
      var metroFareMax = Math.max(20, Math.round(distanceKm * 2));
      var metroStops = Math.max(2, Math.round(distanceKm / 3));
      options.push({
        type: 'Metro',
        icon: '\uD83D\uDE87',
        color: '#8b5cf6',
        time: formatTime(distanceKm / 35),
        cost: '\u20B9' + metroFareMin.toLocaleString('en-IN') + ' - \u20B9' + metroFareMax.toLocaleString('en-IN'),
        distance: distanceKm.toFixed(1) + ' km',
        stops: metroStops + ' stations',
        frequency: 'Every 3-8 min',
        comfort: '\u2605\u2605\u2605\u2606\u2606',
        classes: [
          { name: 'Token / QR Ticket', fare: metroFareMin, recommended: false },
          { name: 'Smart Card', fare: Math.round(metroFareMin * 0.9), recommended: true },
          { name: 'Tourist Pass (1-day)', fare: 200, recommended: false },
          { name: 'Tourist Pass (3-day)', fare: 500, recommended: false },
        ],
        fareBreakdown: [
          'Minimum fare: \u20B910',
          'Per station slab-based pricing',
          'Smart card: 10% discount on fares',
          'No GST on metro fares',
        ],
        routeDetails: [
          'Nearest metro: ' + origin + ' Metro \u2192 ' + dest + ' Metro',
          'Metro distance: ~' + distanceKm.toFixed(1) + ' km',
          'Stations en route: ' + metroStops,
          'Line interchange may be required',
        ],
        schedule: [
          'First train: ~5:30 AM',
          'Last train: ~11:30 PM',
          'Peak hours: 8-10 AM, 5-8 PM',
          'Frequency: 3-5 min (peak) / 5-8 min (off-peak)',
        ],
        booking: [
          'Buy token at station counter/kiosk',
          'Delhi Metro: DMRC App / Paytm',
          'Bangalore: Namma Metro App',
          'Mumbai: Mumbai Metro One App',
        ],
        tip: 'Get a rechargeable smart card for 10% fare discount and faster entry. Avoid peak hours (8-10 AM, 5-8 PM) if possible. Women-only coach available in first coach of every train.',
      });
    }

    // ===== Cab / Rideshare =====
    var cabFareMin = Math.round(distanceKm * 12);
    var cabFareMax = Math.round(distanceKm * 20);
    options.push({
      type: 'Cab / Rideshare',
      icon: '\uD83D\uDE95',
      color: '#f59e0b',
      time: formatTime(distanceKm / 50),
      cost: '\u20B9' + cabFareMin.toLocaleString('en-IN') + ' - \u20B9' + cabFareMax.toLocaleString('en-IN'),
      distance: distanceKm.toFixed(1) + ' km',
      stops: 'Direct',
      frequency: 'On demand',
      comfort: '\u2605\u2605\u2605\u2605\u2605',
      classes: [
        { name: 'Mini (Hatchback)', fare: cabFareMin, recommended: false },
        { name: 'Sedan (Prime)', fare: Math.round(distanceKm * 15), recommended: true },
        { name: 'SUV', fare: Math.round(distanceKm * 18), recommended: false },
        { name: 'XL (6-seater)', fare: cabFareMax, recommended: false },
      ],
      fareBreakdown: [
        'Base fare: \u20B950 - \u20B9100',
        'Per km: \u20B912 (Mini) / \u20B915 (Sedan) / \u20B918 (SUV)',
        'Surge pricing: 1.2x - 2.5x during peak',
        'Toll charges: Extra (as applicable)',
        'Waiting charges: \u20B92/min after 5 min free',
      ],
      routeDetails: [
        origin + ' \u2192 ' + dest + ' (door to door)',
        'Route distance: ' + distanceKm.toFixed(1) + ' km',
        'Direct route — no intermediate stops',
        'Driver may take toll road (faster)',
      ],
      schedule: [
        'Available 24/7',
        'Peak surge: 8-10 AM, 5-9 PM, late night',
        'Best rates: 10 AM - 4 PM',
        'Schedule ride up to 7 days in advance',
      ],
      booking: [
        'Ola (olacabs.com)',
        'Uber (uber.com)',
        'Rapido (rapido.bike)',
        'InDrive — negotiate your price',
      ],
      tip: 'Compare prices between Ola and Uber before booking. Schedule in advance to avoid surge pricing. For long distances (100+ km), negotiate a flat rate. Share live trip with family for safety.',
    });

    // ===== Auto Rickshaw (shorter routes) =====
    if (distanceKm < 50) {
      var autoFareMin = Math.max(30, Math.round(distanceKm * 8));
      var autoFareMax = Math.max(50, Math.round(distanceKm * 14));
      options.push({
        type: 'Auto Rickshaw',
        icon: '\uD83D\uDEFA',
        color: '#10b981',
        time: formatTime(distanceKm / 25),
        cost: '\u20B9' + autoFareMin.toLocaleString('en-IN') + ' - \u20B9' + autoFareMax.toLocaleString('en-IN'),
        distance: distanceKm.toFixed(1) + ' km',
        stops: 'Direct',
        frequency: 'On demand',
        comfort: '\u2605\u2605\u2606\u2606\u2606',
        classes: [
          { name: 'Metered Auto', fare: autoFareMin, recommended: true },
          { name: 'App Auto (Ola/Uber)', fare: Math.round((autoFareMin + autoFareMax) / 2), recommended: false },
          { name: 'Shared Auto', fare: Math.round(autoFareMin * 0.4), recommended: false },
        ],
        fareBreakdown: [
          'Minimum fare: \u20B925 - \u20B930 (first 1.5 km)',
          'Per km: \u20B98 - \u20B914 (varies by city)',
          'Waiting: \u20B91/min after 5 min',
          'Night charge: 1.5x after 11 PM',
        ],
        routeDetails: [
          origin + ' \u2192 ' + dest,
          'Route distance: ' + distanceKm.toFixed(1) + ' km',
          'Door-to-door pickup and drop',
          'May use inner roads / shortcuts',
        ],
        schedule: [
          'Available: 5 AM - 12 midnight',
          'Limited availability late night',
          'Peak demand: morning & evening rush',
          'Shared autos on fixed routes: 6 AM - 10 PM',
        ],
        booking: [
          'Hail on the road (metered)',
          'Ola Auto / Uber Auto',
          'Rapido Auto',
          'Namma Yatri (Karnataka)',
        ],
        tip: 'Always insist on meter or use app-based autos to avoid overcharging. Shared autos are the cheapest for short fixed routes. Carry small change as drivers often don\'t have change.',
      });
    }

    return options;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ===== Utility Functions =====
  function formatTime(hours) {
    if (hours < 0.017) return '< 1 min';
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    if (h === 0) return m + ' min';
    if (m === 0) return h + 'h';
    return h + 'h ' + m + 'min';
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove('hidden');
  }

  function hideError() {
    formError.classList.add('hidden');
  }

  function hideResults() {
    mapSection.classList.add('hidden');
    routeSummary.classList.add('hidden');
    publicTransport.classList.add('hidden');
  }
})();
