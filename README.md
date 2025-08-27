# Tourmaline POI Map

This is a simple web mapping application that displays Points of Interest (POIs), trees, and building polygons on an interactive map. It's built with HTML, CSS, and JavaScript, using the Leaflet.js library for map rendering.

## Features

- **Interactive Map**: Pan and zoom to explore the area.
- **Multiple POI Types**: Includes color-coded points, custom tree icons, and building polygons.
- **Informative Modals**: Click on any feature to open a modal with details and images.
- **GeoTIFF Overlay**: Displays a georeferenced image over the map.
- **Custom Legend**: A map legend explains the symbology for all features.
- **North Arrow**: Provides orientation for the map.

## Project Structure

- `index.html`: The main HTML file that structures the web page.
- `script.js`: Contains all the JavaScript logic for the map, POIs, and modals.
- `/images`: This folder should contain all the images for the POIs.
- `tourmaline_georeferenced (5).tif`: The GeoTIFF file used for the overlay.

## Deployment

This project can be easily deployed to any static web hosting service. Here are instructions for some of the most popular free options:

### Option 1: GitHub Pages (Recommended)

1.  **Create a GitHub Repository**: If you haven't already, create a new repository on GitHub and push your code to it.
2.  **Enable GitHub Pages**:
    - Go to your repository's **Settings** tab.
    - In the left sidebar, click on **Pages**.
    - Under **Branch**, select `main` and click **Save**.
3.  **Access Your Site**: GitHub will provide you with a URL (e.g., `https://your-username.github.io/your-repo-name/`). It may take a few minutes for the site to become available.

### Option 2: Netlify

1.  **Sign Up**: Create a free account on [Netlify](https://www.netlify.com/).
2.  **Connect Your Git Repository**:
    - From your Netlify dashboard, click **Add new site** > **Import an existing project**.
    - Connect to your Git provider (e.g., GitHub) and select your repository.
3.  **Deploy**: Netlify will automatically detect that it's a static site and deploy it. No build command is needed.

### Option 3: Vercel

1.  **Sign Up**: Create a free account on [Vercel](https://vercel.com/).
2.  **Connect Your Git Repository**:
    - From your Vercel dashboard, click **Add New...** > **Project**.
    - Import your Git repository.
3.  **Deploy**: Vercel will also auto-detect the project type and deploy it without any special configuration.

## Local Development

To run this project locally, you can use a simple web server to avoid any CORS issues with loading local files.

1.  **Install a local server**: If you have Python installed, you can run:
    - Python 3: `python -m http.server`
    - Python 2: `python -m SimpleHTTPServer`
2.  **Access the site**: Open your browser and go to `http://localhost:8000`.

---

Happy mapping!