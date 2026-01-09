"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  MapMarker,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import type { AddRoomModalProps } from "@/interfaces/AddRoomModalProps";

function MapClickHandler({ onClick }: { onClick: (e: LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

export function AddRoomModal({
  open,
  onOpenChange,
  onAddRoom,
}: AddRoomModalProps) {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomType, setRoomType] = useState<"text" | "video" | "text-video">(
    "text"
  );
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [error, setError] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user's current location on mount
  useEffect(() => {
    if (open && lat === null && lng === null) {
      handleGetCurrentLocation();
    }
  }, [open]);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          // Default to a location if geolocation fails
          setLat(40.7128);
          setLng(-74.006);
          setIsGettingLocation(false);
        }
      );
    } else {
      // Default location if geolocation not supported
      setLat(40.7128);
      setLng(-74.006);
      setIsGettingLocation(false);
    }
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    setLat(e.latlng.lat);
    setLng(e.latlng.lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = roomName.trim();

    if (!trimmedName) {
      setError("Room name cannot be empty");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Room name must be at least 3 characters");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Room name must be less than 50 characters");
      return;
    }

    if (lat === null || lng === null) {
      setError("Please select a location on the map");
      return;
    }

    onAddRoom({
      name: trimmedName,
      description: roomDescription.trim(),
      type: roomType,
      password: hasPassword && password.trim() ? password.trim() : undefined,
      lat: lat!,
      lng: lng!,
    });

    // Reset form
    setRoomName("");
    setRoomDescription("");
    setRoomType("text");
    setPassword("");
    setHasPassword(false);
    setLat(null);
    setLng(null);
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setRoomName("");
    setRoomDescription("");
    setRoomType("text");
    setPassword("");
    setHasPassword(false);
    setLat(null);
    setLng(null);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new room for text chat, video calls, or both.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              type="text"
              placeholder="e.g., Downtown Coffee"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">Room Description</Label>
            <textarea
              id="room-description"
              placeholder="Describe your room... (optional)"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {roomDescription.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-type">Room Type</Label>
            <Select
              value={roomType}
              onValueChange={(value: "text" | "video" | "text-video") =>
                setRoomType(value)
              }
            >
              <SelectTrigger id="room-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">💬 Text Only</SelectItem>
                <SelectItem value="video">📹 Video Only</SelectItem>
                <SelectItem value="text-video">💬📹 Text + Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has-password"
                checked={hasPassword}
                onChange={(e) => {
                  setHasPassword(e.target.checked);
                  if (!e.target.checked) {
                    setPassword("");
                  }
                }}
                className="w-4 h-4 rounded border-input"
              />
              <Label
                htmlFor="has-password"
                className="cursor-pointer font-normal"
              >
                🔒 Password protect this room
              </Label>
            </div>

            {hasPassword && (
              <div className="space-y-2 pl-6">
                <Input
                  id="room-password"
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Room Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:cursor-pointer"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? "Getting..." : "📍 Use My Location"}
              </Button>
            </div>
            <div className="h-64 rounded-md overflow-hidden border">
              {lat !== null && lng !== null ? (
                <Map
                  center={[lat, lng]}
                  zoom={13}
                  className="h-full w-full"
                  key={`${lat}-${lng}`}
                >
                  <MapTileLayer />
                  <MapZoomControl />
                  <MapClickHandler onClick={handleMapClick} />
                  <MapMarker
                    position={[lat, lng]}
                    draggable={true}
                    icon={
                      <div className="relative">
                    
                        {/* Main pin */}
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="relative drop-shadow-lg"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            fill="#3b82f6"
                            stroke="#1e40af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="9"
                            r="2.5"
                            fill="white"
                            stroke="#1e40af"
                            strokeWidth="0.5"
                          />
                          {/* Shine effect */}
                          <path
                            d="M9 6.5c0-1 .5-2 1.5-2.5"
                            stroke="white"
                            strokeWidth="1"
                            strokeLinecap="round"
                            opacity="0.6"
                          />
                        </svg>
                      </div>
                    }
                    iconAnchor={[24, 44]}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        setLat(position.lat);
                        setLng(position.lng);
                      },
                    }}
                  />
                </Map>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  Getting your location...
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 14.5995"
                  value={lat ?? ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setLat(value);
                    } else if (e.target.value === "") {
                      setLat(null);
                    }
                  }}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 120.9842"
                  value={lng ?? ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setLng(value);
                    } else if (e.target.value === "") {
                      setLng(null);
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag the marker, click the map, or enter coordinates manually
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 hover:cursor-pointer">
              Create Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
