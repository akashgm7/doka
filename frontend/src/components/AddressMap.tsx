import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AddressMapProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationfound(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const AddressMap: React.FC<AddressMapProps> = ({ onLocationSelect }) => {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: '1rem', filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(85%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
};

export default AddressMap;
