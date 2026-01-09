"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import type { Map as LeafletMap } from "leaflet";

interface Room {
  id: string;
  name: string;
  type: "text" | "video" | "text-video";
  participants: number;
  lat: number;
  lng: number;
  active: boolean;
}

const ROOM_LOCATIONS: Room[] = [
  {
    id: "room-1",
    name: "Downtown Coffee",
    type: "text-video",
    participants: 8,
    lat: 40.7128,
    lng: -74.006,
    active: true,
  },
  {
    id: "room-2",
    name: "Park Discussion",
    type: "text",
    participants: 12,
    lat: 40.7829,
    lng: -73.9654,
    active: true,
  },
  {
    id: "room-3",
    name: "Studio Session",
    type: "video",
    participants: 5,
    lat: 40.7505,
    lng: -73.9972,
    active: false,
  },
  {
    id: "room-4",
    name: "Community Center",
    type: "text-video",
    participants: 15,
    lat: 40.7614,
    lng: -73.9776,
    active: true,
  },
  {
    id: "room-5",
    name: "Quiet Corner",
    type: "text",
    participants: 3,
    lat: 40.7489,
    lng: -73.968,
    active: false,
  },
  {
   id: "room-6",
    name: "Nice Channel",
    type: "text-video",
    participants: 800,
    lat: 8.469353814083625,
    lng: 124.58903109187337,
    active: true,
  },
];

interface MapProps {
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function MapLeaflet({ selectedRoom, onSelectRoom }: MapProps) {
  const mapRef = useRef<LeafletMap>(null);
  const router = useRouter();
  const [showLabels, setShowLabels] = useState(false);
  const [labelPositions, setLabelPositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Calculate center of all rooms
  const centerLat =
    ROOM_LOCATIONS.reduce((sum, room) => sum + room.lat, 0) /
    ROOM_LOCATIONS.length;
  const centerLng =
    ROOM_LOCATIONS.reduce((sum, room) => sum + room.lng, 0) /
    ROOM_LOCATIONS.length;

  // Check zoom level and update labels
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const updateLabels = () => {
      const zoom = map.getZoom();
      // Always show for testing
      setShowLabels(true);

      // Update label positions
      const positions: { [key: string]: { x: number; y: number } } = {};
      ROOM_LOCATIONS.forEach((room) => {
        const point = map.latLngToContainerPoint([room.lat, room.lng]);
        positions[room.id] = { x: point.x, y: point.y };
      });
      setLabelPositions(positions);
    };

    map.on('zoom', updateLabels);
    map.on('move', updateLabels);
    map.on('zoomend', updateLabels);
    map.on('moveend', updateLabels);
    
    // Give the map time to initialize
    setTimeout(updateLabels, 500);

    return () => {
      map.off('zoom', updateLabels);
      map.off('move', updateLabels);
      map.off('zoomend', updateLabels);
      map.off('moveend', updateLabels);
    };
  }, []);

  // Update map view when selected room changes
  useEffect(() => {
    if (selectedRoom && mapRef.current) {
      const room = ROOM_LOCATIONS.find((r) => r.id === selectedRoom);
      if (room) {
        mapRef.current.setView([room.lat, room.lng], 14, { animate: true });
      }
    }
  }, [selectedRoom]);

  const getMarkerIcon = (type: string, isSelected: boolean) => {
    let color: string;
    switch (type) {
      case "text":
        color = "#6366f1"; // blue-500
        break;
      case "video":
        color = "#a855f7"; // purple-500
        break;
      case "text-video":
        color = "#10b981"; // green-500
        break;
      default:
        color = "#64748b"; // slate-500
    }

    const size = isSelected ? 32 : 24;

    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill={color}
            stroke="white"
            strokeWidth="2"
            opacity="0.9"
          />
          {isSelected && (
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity="0.5"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          center={[centerLat, centerLng]}
          zoom={12}
          className="w-full h-full"
        >
          <MapTileLayer />
          <MapZoomControl />

          {ROOM_LOCATIONS.map((room) => (
            <MapMarker
              key={room.id}
              position={[room.lat, room.lng]}
              icon={getMarkerIcon(room.type, selectedRoom === room.id)}
              iconAnchor={[12, 12]}
              eventHandlers={{
                click: () => onSelectRoom(room.id),
              }}
            >
              <MapPopup>
                <div className="p-4 min-w-65">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg leading-tight pr-2">{room.name}</h3>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        room.active
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${room.active ? "bg-white" : "bg-gray-600"}`} />
                      {room.active ? "Active" : "Idle"}
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <span className="text-base">👥</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Participants{" "} - {" "}</p>
                        <p className="font-semibold text-sm">{room.participants.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <span className="text-base">
                          {room.type === "text" ? "💬" : room.type === "video" ? "📹" : "📱"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Room Type {" "} - {" "}</p>
                        <p className="font-semibold text-sm">
                          {room.type === "text"
                            ? "Text Chat"
                            : room.type === "video"
                            ? "Video Only"
                            : "Chat & Video"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/${room.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Join Room
                  </button>
                </div>
              </MapPopup>
            </MapMarker>
          ))}
        </Map>

        {/* Channel name labels on zoom */}
        {showLabels && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {ROOM_LOCATIONS.map((room) => {
              const pos = labelPositions[room.id];
              if (!pos) return null;

              return (
                <div
                  key={`label-${room.id}`}
                  className="absolute bg-red-500 text-white px-2 py-1 text-xs"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y - 30}px`,
                  }}
                >
                  {room.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-border bg-card px-6 py-3 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground">Text Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span className="text-muted-foreground">Video Only</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">Chat & Video</span>
        </div>
      </div>
    </div>
  );
}
