mapboxgl.accessToken = "pk.eyJ1IjoiamZyZW5jaDUiLCJhIjoiY201eGVlNG42MDg5bjJub25nZjF3b3Y5eiJ9.i1clyXkpZVVJQ_iy-Jt7DQ"; // Mapbox public map token
// Create the map
const map = new mapboxgl.Map({
	container: "bike-map", // Map container ID in html
	style: "mapbox://styles/jfrench5/cm6vcs0z1002m01s3cfz02880", // Custom style using satellite image
	center: [-79.35, 43.7], // Downtown Toronto [long, lat]
	zoom: 11, // Zoom where you can see all the bike stations
});

map.on("load", () => {
	// Add the cycling network from geojson
	// Cycling network needs to be added first so it's under the station points
	map.addSource("cycling-network", {
		type: "geojson",
		data: "https://jfrench12.github.io/GGR472-Lab2/static/cycling-network.geojson",
	});
	// Add the line layer to visualize the cycling network
	map.addLayer({
		id: "cycling-network-layer",
		type: "line", // Network consists of lines
		source: "cycling-network",
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			// Mapbox doesn't support referencing css variables directly, so to avoid coding the colour in 2 places
			// get what the css variable value is dynamically
			"line-color": window.getComputedStyle(document.documentElement).getPropertyValue("--cycling-network"),
			"line-width": 1,
		},
	});

	// Add the station tileset as a vector source
	// Station needs to be added second so it's over the cycling network lines
	map.addSource("stations-tileset", {
		type: "vector",
		url: "mapbox://jfrench5.2luoqcoz", // Tileset ID from mapbox
	});
	// Add the circle layer to visualize the stations
	map.addLayer({
		id: "stations",
		type: "circle", // Stations are points
		source: "stations-tileset",
		"source-layer": "stations-0b1z9c", // Layer from mapbox site
		paint: {
			// Mapbox doesn't support referencing css variables directly, so to avoid coding the colour in 2 places
			// get what the css variable value is dynamically
			"circle-color": window.getComputedStyle(document.documentElement).getPropertyValue("--bike-station"),
			"circle-radius": 4, // Circle big enough that you can hover for the popup
			"circle-opacity": 0.8, // Slightly transparent to help with overlap
		},
	});
});

// Show the name and capacity when hovering on the stations
// (https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover)
const popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false,
});
map.on("mouseenter", "stations", (e) => {
	// Change the cursor style as a UI indicator
	map.getCanvas().style.cursor = "pointer";

	// Copy coordinates array
	const coordinates = e.features[0].geometry.coordinates.slice();

	// Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears
	// over the copy being pointed to
	if (["mercator", "equirectangular"].includes(map.getProjection().name)) {
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
	}

	// Populate the popup and set its coordinates based on the feature found
	popup
		.setLngLat(coordinates)
		// Popup format is "Name: Capacity"
		.setHTML(e.features[0].properties.Name + ": " + e.features[0].properties.Capacity)
		.addTo(map);
});
// Hide popup when no longer hovering
map.on("mouseleave", "stations", () => {
	map.getCanvas().style.cursor = "";
	popup.remove();
});
