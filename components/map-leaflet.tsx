"use client"

import { useEffect, useRef } from "react"
import {
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"
import type { Map as LeafletMap } from "leaflet"

interface Room {
  id: string
  name: string
  type: "text" | "video" | "text-video"
  participants: number
  lat: number
  lng: number
  active: boolean
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
]

interface MapProps {
  selectedRoom: string | null
  onSelectRoom: (roomId: string) => void
}

export function MapLeaflet({ selectedRoom, onSelectRoom }: MapProps) {
  const mapRef = useRef<LeafletMap>(null)
  
  // Calculate center of all rooms
  const centerLat = ROOM_LOCATIONS.reduce((sum, room) => sum + room.lat, 0) / ROOM_LOCATIONS.length
  const centerLng = ROOM_LOCATIONS.reduce((sum, room) => sum + room.lng, 0) / ROOM_LOCATIONS.length

  // Update map view when selected room changes
  useEffect(() => {
    if (selectedRoom && mapRef.current) {
      const room = ROOM_LOCATIONS.find((r) => r.id === selectedRoom)
      if (room) {
        mapRef.current.setView([room.lat, room.lng], 14, { animate: true })
      }
    }
  }, [selectedRoom])

  const getMarkerIcon = (type: string, isSelected: boolean) => {
    let color: string
    switch (type) {
      case "text":
        color = "#6366f1" // blue-500
        break
      case "video":
        color = "#a855f7" // purple-500
        break
      case "text-video":
        color = "#10b981" // green-500
        break
      default:
        color = "#64748b" // slate-500
    }

    const size = isSelected ? 32 : 24

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill={color} stroke="white" strokeWidth="2" opacity="0.9"/>
          {isSelected && (
            <circle cx="12" cy="12" r="11" fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
          )}
        </svg>
      </div>
    )
  }

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
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-base mb-2">{room.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      👥 <span className="font-medium">{room.participants}</span> participants
                    </p>
                    <p className="text-gray-600">
                      {room.type === "text"
                        ? "💬 Text only"
                        : room.type === "video"
                          ? "📹 Video only"
                          : "💬📹 Chat & Video"}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                        room.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {room.active ? "🟢 Active" : "⚫ Idle"}
                    </span>
                  </div>
                </div>
              </MapPopup>
            </MapMarker>
          ))}
        </Map>
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
  )
}
