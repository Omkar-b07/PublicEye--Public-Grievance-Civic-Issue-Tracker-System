import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to fetch address from OpenStreetMap Nominatim
const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        return data.display_name || "Address not found";
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Could not load address";
    }
};

const LocateControl = ({ onLocationSelect }) => {
    const map = useMap();
    const [locating, setLocating] = useState(false);

    const handleLocate = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocating(false);
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 16, { animate: true });

                if (onLocationSelect) {
                    onLocationSelect(latitude, longitude);
                }
            },
            (error) => {
                setLocating(false);
                console.error("Error getting location:", error);
                let errorMessage = "Could not get your location.";

                switch (error.code) {
                    case 1:
                        errorMessage = "Please allow location access in your browser settings.";
                        break;
                    case 2:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case 3:
                        errorMessage = "Location request timed out.";
                        break;
                }

                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <button
            onClick={handleLocate}
            type="button"
            style={{ zIndex: 1000 }}
            className={`absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-lg border border-gray-200 flex items-center justify-center focus:outline-none transition-all duration-300 ${locating ? 'text-blue-400 rotate-180' : 'text-blue-600 hover:bg-gray-50'}`}
            title="Current Location"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {locating ? (
                    <>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </>
                ) : (
                    <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                        <path d="M4 12H2" />
                        <path d="M22 12h-2" />
                    </>
                )}
            </svg>
        </button>
    );
};

const LocationSelector = ({ onLocationSelect, selectedPosition, onAddressConfirm }) => {
    const [address, setAddress] = useState("Loading address...");

    useEffect(() => {
        if (selectedPosition) {
            setAddress("Loading address...");
            getAddressFromCoordinates(selectedPosition.lat, selectedPosition.lng)
                .then(res => setAddress(res));
        }
    }, [selectedPosition]);

    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    return selectedPosition ? (
        <Marker position={selectedPosition}>
            <Popup className="text-sm font-medium p-1 min-w-[150px]">
                <div className="max-w-xs mb-2">{address}</div>
                {onAddressConfirm && address !== "Loading address..." && address !== "Could not load address" && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddressConfirm(address);
                        }}
                        className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs py-1.5 px-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Address
                    </button>
                )}
            </Popup>
        </Marker>
    ) : null;
};

const MapComponent = ({
    issues = [],
    onLocationSelect,
    selectedPosition,
    onAddressConfirm,
    height = "400px",
}) => {
    // Pune, India
    const center = [18.5204, 73.8567];

    return (
        <div style={{ height, width: "100%", zIndex: 0, position: "relative" }} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {onLocationSelect && (
                    <LocationSelector
                        onLocationSelect={onLocationSelect}
                        selectedPosition={selectedPosition}
                        onAddressConfirm={onAddressConfirm}
                    />
                )}

                {issues.map((issue, index) => (
                    <Marker key={index} position={[issue.lat, issue.lng]}>
                        <Popup>
                            {issue.title || "Issue Location"}
                        </Popup>
                    </Marker>
                ))}

                <LocateControl onLocationSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
