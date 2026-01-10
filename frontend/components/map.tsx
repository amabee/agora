"use client";

import type React from "react";

import { useState } from "react";

interface Room {
  id: string;
  name: string;
  type: "text" | "video" | "mixed";
  participants: number;
  lat: number;
  lng: number;
  active: boolean;
}

const ROOM_LOCATIONS: Room[] = [];

interface MapProps {
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

interface Tooltip {
  roomId: string;
  x: number;
  y: number;
}

export function Map({ selectedRoom, onSelectRoom }: MapProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "#6366f1";
      case "video":
        return "#a855f7";
      case "mixed":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "T";
      case "video":
        return "V";
      case "mixed":
        return "TV";
      default:
        return "●";
    }
  };

  // Simple SVG map visualization
  const minLat = Math.min(...ROOM_LOCATIONS.map((r) => r.lat));
  const maxLat = Math.max(...ROOM_LOCATIONS.map((r) => r.lat));
  const minLng = Math.min(...ROOM_LOCATIONS.map((r) => r.lng));
  const maxLng = Math.max(...ROOM_LOCATIONS.map((r) => r.lng));

  const width = 1000;
  const height = 600;

  const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * height;
  const lngToX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * width;

  const handlePinMouseEnter = (
    room: Room,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredRoom(room.id);
    setTooltip({
      roomId: room.id,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handlePinMouseLeave = () => {
    setHoveredRoom(null);
    setTooltip(null);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative overflow-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full min-w-full min-h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Background grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200 dark:text-slate-700"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* City label */}
          <text
            x={width / 2}
            y={30}
            textAnchor="middle"
            className="text-2xl font-bold"
            fill="currentColor"
          >
            Manhattan Community Hub
          </text>

          {/* Connection lines between rooms */}
          {ROOM_LOCATIONS.map((room, idx) => {
            if (idx < ROOM_LOCATIONS.length - 1) {
              const nextRoom = ROOM_LOCATIONS[idx + 1];
              return (
                <line
                  key={`line-${room.id}-${nextRoom.id}`}
                  x1={lngToX(room.lng)}
                  y1={latToY(room.lat)}
                  x2={lngToX(nextRoom.lng)}
                  y2={latToY(nextRoom.lat)}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  className="text-slate-300 dark:text-slate-600 opacity-50"
                />
              );
            }
            return null;
          })}

          {/* Room pins */}
          {ROOM_LOCATIONS.map((room) => {
            const x = lngToX(room.lng);
            const y = latToY(room.lat);
            const isSelected = selectedRoom === room.id;
            const isHovered = hoveredRoom === room.id;
            const scale = isSelected ? 1.3 : isHovered ? 1.15 : 1;

            return (
              <g key={room.id}>
                {/* Pin shadow */}
                <circle
                  cx={x}
                  cy={y + 8}
                  r={16 * scale}
                  fill="black"
                  opacity="0.1"
                />

                {/* Pin circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={14 * scale}
                  fill={getTypeColor(room.type)}
                  opacity={isSelected ? 1 : 0.8}
                  className="transition-all duration-200"
                />

                {/* Pin border */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14 * scale + 3}
                    fill="none"
                    stroke={getTypeColor(room.type)}
                    strokeWidth="2"
                    opacity="0.5"
                  />
                )}

                {/* Ripple effect for active rooms */}
                {room.active && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14 * scale}
                    fill="none"
                    stroke={getTypeColor(room.type)}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* Icon/Text in pin - Fixed to use simple ASCII characters */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="text-xs font-bold pointer-events-none select-none"
                  fill="white"
                >
                  {getTypeIcon(room.type)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive buttons overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {ROOM_LOCATIONS.map((room) => {
            const x = (lngToX(room.lng) / width) * 100;
            const y = (latToY(room.lat) / height) * 100;

            return (
              <button
                key={`btn-${room.id}`}
                onClick={() => onSelectRoom(room.id)}
                onMouseEnter={(e) => handlePinMouseEnter(room, e)}
                onMouseLeave={handlePinMouseLeave}
                className="absolute w-12 h-12 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                aria-label={`Join ${room.name}`}
              />
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed bg-card border border-border rounded-lg shadow-lg p-3 z-50 pointer-events-none text-sm max-w-xs"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId) && (
              <div>
                <p className="font-semibold text-foreground">
                  {ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId)?.name}
                </p>
                <p className="text-muted-foreground">
                  👥{" "}
                  {
                    ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId)
                      ?.participants
                  }{" "}
                  participants
                </p>
                <p className="text-muted-foreground">
                  {ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId)?.type ===
                  "text"
                    ? "💬 Text only"
                    : ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId)
                        ?.type === "video"
                    ? "📹 Video only"
                    : "💬📹 Chat & Video"}
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {ROOM_LOCATIONS.find((r) => r.id === tooltip.roomId)?.active
                      ? "🟢 Active"
                      : "⚫ Idle"}
                  </span>
                </div>
              </div>
            )}
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
