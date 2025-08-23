
"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import type { GrievanceLocation } from "@/app/heatmap/actions";
import React from 'react';

interface KeralaMapProps {
  points: GrievanceLocation[];
}

// Custom icon for markers to fix default icon issues with webpack
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export const KeralaMap = React.memo(React.forwardRef<HTMLDivElement, KeralaMapProps>(({ points }, ref) => {
  // Center of Kerala
  const position: LatLngExpression = [10.8505, 76.2711];

  return (
    <div ref={ref} className="relative h-full w-full rounded-md border overflow-hidden">
        <MapContainer center={position} zoom={7} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
                <Marker 
                    key={point.id} 
                    position={[point.location.lat, point.location.lng]}
                    icon={customIcon}
                >
                <Tooltip>
                    <p>{point.title}</p>
                </Tooltip>
                </Marker>
            ))}
        </MapContainer>
    </div>
  );
}));

KeralaMap.displayName = "KeralaMap";
