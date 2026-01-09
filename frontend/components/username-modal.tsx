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

const USERNAME_STORAGE_KEY = "agora_username";
const UUID_STORAGE_KEY = "agora_uuid";

const ADJECTIVES = [
  "Happy",
  "Swift",
  "Clever",
  "Bright",
  "Calm",
  "Bold",
  "Wise",
  "Cool",
  "Quick",
  "Silent",
  "Lucky",
  "Brave",
  "Gentle",
  "Mighty",
  "Noble",
];

const NOUNS = [
  "Panda",
  "Tiger",
  "Eagle",
  "Dolphin",
  "Phoenix",
  "Dragon",
  "Wolf",
  "Hawk",
  "Lion",
  "Falcon",
  "Bear",
  "Fox",
  "Owl",
  "Lynx",
  "Jaguar",
];

function generateRandomUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}

function generateUUID(): string {
  // Try to use native crypto.randomUUID if available
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UsernameModal({ onUsernameSet }: UsernameModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [uuid, setUuid] = useState("");
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [isLoadingUuid, setIsLoadingUuid] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if username exists in localStorage
    const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedUsername) {
      onUsernameSet(storedUsername);
    } else {
      setOpen(true);
    }
  }, [onUsernameSet]);

  const handleGenerateRandom = () => {
    const randomUsername = generateRandomUsername();
    setUsername(randomUsername);
    setError("");
  };

  const handleFetchUuid = async () => {
    const trimmedUuid = uuid.trim();
    
    if (!trimmedUuid) {
      setError("UUID cannot be empty");
      return;
    }

    setIsLoadingUuid(true);
    setError("");

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/user/${trimmedUuid}`);
      
      if (!response.ok) {
        throw new Error("User not found");
      }

      const data = await response.json();
      
      // Store both username and UUID
      localStorage.setItem(USERNAME_STORAGE_KEY, data.username);
      localStorage.setItem(UUID_STORAGE_KEY, trimmedUuid);
      
      onUsernameSet(data.username);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user data");
    } finally {
      setIsLoadingUuid(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Username cannot be empty");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 20) {
      setError("Username must be less than 20 characters");
      return;
    }

    // Save to localStorage
    localStorage.setItem(USERNAME_STORAGE_KEY, trimmedUsername);
    
    // Generate and save UUID for new users
    const newUuid = generateUUID();
    localStorage.setItem(UUID_STORAGE_KEY, newUuid);
    
    // TODO: Save to database - send username and UUID to your backend
    // Example: await fetch('/api/user', { method: 'POST', body: JSON.stringify({ username: trimmedUsername, uuid: newUuid }) })
    
    onUsernameSet(trimmedUsername);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing the dialog by clicking outside
        if (!newOpen) return;
        setOpen(newOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Agora</DialogTitle>
          <DialogDescription>
            Choose a username to get started. You can generate a random one or
            create your own.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!hasExistingAccount ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateRandom}
                  className="w-full"
                >
                  Generate Random Username
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="uuid">Your UUID</Label>
                <Input
                  id="uuid"
                  type="text"
                  placeholder="Paste your UUID here"
                  value={uuid}
                  onChange={(e) => {
                    setUuid(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button 
                type="button" 
                onClick={handleFetchUuid} 
                className="w-full"
                disabled={isLoadingUuid}
              >
                {isLoadingUuid ? "Loading..." : "Continue with UUID"}
              </Button>
            </>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setHasExistingAccount(!hasExistingAccount);
              setError("");
            }}
            className="w-full"
          >
            {hasExistingAccount ? "Create new account" : "I have an existing UUID"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export utility functions for use in other components
export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USERNAME_STORAGE_KEY);
}

export function clearStoredUsername(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USERNAME_STORAGE_KEY);
}
