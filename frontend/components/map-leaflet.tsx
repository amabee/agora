"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map,
  MapMarker,
  MapMarkerClusterGroup,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import type { Map as LeafletMap } from "leaflet";
import type { Room } from "@/interfaces/Room";
import type { MapLeafletProps } from "@/interfaces/MapLeafletProps";

export function MapLeaflet({ rooms, selectedRoom, onSelectRoom, onRoomSelect }: MapLeafletProps) {
  const mapRef = useRef<LeafletMap>(null);
  const router = useRouter();
  const [showLabels, setShowLabels] = useState(false);
  const [labelPositions, setLabelPositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Calculate center of all rooms (default to a location if no rooms)
  const centerLat =
    rooms.length > 0
      ? rooms.reduce((sum, room) => sum + room.lat, 0) /
        rooms.length
      : 14.5995; // Default to Philippines center
  const centerLng =
    rooms.length > 0
      ? rooms.reduce((sum, room) => sum + room.lng, 0) /
        rooms.length
      : 120.9842;

  // Check zoom level and update labels
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const updateLabels = () => {
      if (!mounted) return;
      
      try {
        // Check if map and container are ready
        if (!map || !map.getZoom || !map.getContainer || !map.getContainer()) return;
        if (!(map as any)._loaded) return; // Map not fully loaded yet
        
        const zoom = map.getZoom();
        setShowLabels(zoom >= 15);

        if (zoom >= 15) {
          const positions: { [key: string]: { x: number; y: number } } = {};
          rooms.forEach((room) => {
            try {
              const point = map.latLngToContainerPoint([room.lat, room.lng]);
              if (point && point.x !== undefined && point.y !== undefined) {
                positions[room.id] = { x: point.x, y: point.y };
              }
            } catch (error) {
              // Skip this marker
            }
          });
          if (mounted) {
            setLabelPositions(positions);
          }
        }
      } catch (error) {
        // Map not ready
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLabels, 150);
    };

    // Wait for map to be fully initialized
    const initTimeout = setTimeout(() => {
      if (!mounted) return;
      map.on('zoomend', updateLabels);
      map.on('moveend', debouncedUpdate);
      updateLabels();
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimeout);
      map.off('zoomend', updateLabels);
      map.off('moveend', debouncedUpdate);
    };
  }, [rooms]);

  // Update map view when selected room changes
  useEffect(() => {
    if (selectedRoom && mapRef.current) {
      const room = rooms.find((r) => r.id === selectedRoom);
      if (room) {
        mapRef.current.setView([room.lat, room.lng], 14, { animate: true });
      }
    }
  }, [selectedRoom, rooms]);

  const getMarkerIcon = (type: string, isSelected: boolean) => {
    let color: string;
    switch (type) {
      case "text":
        color = "#6366f1"; // blue-500
        break;
      case "video":
        color = "#a855f7"; // purple-500
        break;
      case "mixed":
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
          zoom={17}
          minZoom={5}
          maxZoom={20}
          className="w-full h-full"
        >
          <MapTileLayer />
          <MapZoomControl />

          <MapMarkerClusterGroup
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            spiderfyDistanceMultiplier={2}
            disableClusteringAtZoom={18}
            icon={(count) => (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-sm border-2 border-white shadow-lg">
                {count}
              </div>
            )}
          >
            {rooms.map((room) => (
              <MapMarker
                key={room.id}
                position={[room.lat, room.lng]}
                icon={getMarkerIcon(room.type, selectedRoom === room.id)}
                iconAnchor={[12, 12]}
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
                      onClick={() => onRoomSelect(room.id)}
                      className="w-full mt-4 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Join Room
                    </button>
                  </div>
                </MapPopup>
              </MapMarker>
            ))}
          </MapMarkerClusterGroup>
        </Map>

        {/* Channel name labels on zoom */}
        {showLabels && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {rooms.map((room) => {
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
