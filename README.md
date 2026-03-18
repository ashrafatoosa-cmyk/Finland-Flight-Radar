# 🌍 Finland Flight Radar

A premium, live flight tracking application centered over Finland. Built with modern web technologies, featuring a sleek dark-themed interface and real-time data updates.

![Flight Radar Preview](https://img.icons8.com/color/96/000000/airplane-take-off.png) <!-- Placeholder for an image if you have one -->

## ✨ Features

-   **Live Air Traffic**: Real-time tracking of flights over Finland using the ADSB.lol API.
-   **Modern UI**: High-end glassmorphism design with a responsive, dark-themed layout.
-   **Interactive Map**: Powered by [Leaflet.js](https://leafletjs.com/), featuring smooth panning, zooming, and custom vector icons.
-   **Detailed Flight Info**: Click on any aircraft to view its callsign, altitude (meters), ground speed (km/h), and heading.
-   **Smooth Animations**: Aircraft icons transition smoothly between updates, and rotate to match their actual heading.
-   **Status Indicator**: A live "ping" indicator showing the health of the data connection.

## 🚀 Technologies Used

-   **HTML5**: Semantic structure.
-   **CSS3**: Custom variables, glassmorphism, and animations.
-   **JavaScript (ES6+)**: Core logic and API integration.
-   **Leaflet.js**: Interactive mapping library.
-   **CartoDB Dark Matter**: Premium dark-themed map tiles.
-   **ADSB.lol API**: Open-source flight data source.
-   **allOrigins**: CORS proxy for seamless API requests.

## 🛠️ Getting Started

### Local Development

1.  **Clone the repository** (if applicable).
2.  **Open `index.html`** in your browser.
3.  **Using a Local Server (Recommended)**:
    For the best experience (and to avoid CORS issues if not using a proxy), use a local server:
    ```bash
    # If you have Node.js installed
    npx http-server .
    ```
4.  Navigate to `http://localhost:8080` (or the port specified by your server).

## 📂 Project Structure

-   `index.html`: The main entry point and UI structure.
-   `style.css`: All styling, including the custom glassmorphism components.
-   `app.js`: The application's brain, handling map initialization, data fetching, and marker management.

## 📡 Data Source

This project utilizes live data from [ADSB.lol](https://adsb.lol/), an open-source flight tracking community. Data is refreshed every 5 seconds to ensure accuracy.

---

*Developed as part of the AI in Practice Course.*
