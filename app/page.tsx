"use client";

import { useState, useEffect, useRef } from "react";
import { themeConfigs } from "@/lib/themeConfig";
import { RoomData, RoomUser, InteractiveObject } from "@/types";
import LandingView from "@/components/LandingView";
import RoomView from "@/components/RoomView";
import JoinRoomModal from "@/components/JoinRoomModal";
import CreateRoomModal from "@/components/CreateRoomModal";
import LoadingScreen from "@/components/ui/LoadingScreen";

type ViewState = "landing" | "room";

export default function Home() {
  const [view, setView] = useState<ViewState>("landing");
  const [showModal, setShowModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [room, setRoom] = useState<RoomData | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [objects, setObjects] = useState<InteractiveObject[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved session
  useEffect(() => {
    const savedRoomId = localStorage.getItem("cofi_room_id");
    const savedUserId = localStorage.getItem("cofi_user_id");
    if (savedRoomId && savedUserId) reconnectToRoom(savedRoomId, savedUserId);
  }, []);

  // Manage polling and heartbeat
  useEffect(() => {
    if (view === "room" && room && userId) {
      startPolling();
      startHeartbeat();
    } else {
      stopPolling();
      stopHeartbeat();
    }
    return () => {
      stopPolling();
      stopHeartbeat();
    };
  }, [view, room, userId]);

  const startPolling = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(async () => {
      if (!room || !userId) return;
      try {
        const response = await fetch(`/api/rooms/${room.id}`);
        const data = await response.json();
        if (response.ok) updateObjects(room.theme, data.users, userId);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) return;
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!room || !userId) return;
      try {
        await fetch(`/api/rooms/${room.id}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }, 10000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const reconnectToRoom = async (roomId: string, userId: string) => {
    setIsLoading(true);
    try {
      const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const joinData = await joinResponse.json();
      if (!joinResponse.ok)
        throw new Error(joinData.error || "Failed to rejoin");

      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();
      if (!roomResponse.ok) throw new Error(roomData.error || "Room not found");

      setUserId(joinData.userId);
      setRoom(roomData.room);
      updateObjects(roomData.room.theme, roomData.users, joinData.userId);
      setView("room");
    } catch (err) {
      console.error(err);
      localStorage.removeItem("cofi_room_id");
      localStorage.removeItem("cofi_user_id");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (theme: "rainy" | "midnight" | "forest") => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await joinRoom(data.room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinRoom(joinRoomId);
  };

  const joinRoom = async (roomId: string) => {
    setIsLoading(true);
    try {
      const savedUserId = localStorage.getItem("cofi_user_id");
      const body = savedUserId ? { userId: savedUserId } : {};
      const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const joinData = await joinResponse.json();
      if (!joinResponse.ok) throw new Error(joinData.error);

      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();
      if (!roomResponse.ok) throw new Error(roomData.error);

      localStorage.setItem("cofi_room_id", roomId);
      localStorage.setItem("cofi_user_id", joinData.userId);

      setUserId(joinData.userId);
      setRoom(roomData.room);
      updateObjects(roomData.room.theme, roomData.users, joinData.userId);
      setView("room");
      setShowModal(false);
      setShowJoinInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateObjects = (
    theme: RoomData["theme"],
    users: RoomUser[],
    currentUserId: string
  ) => {
    const config = themeConfigs[theme] || themeConfigs["rainy"];
    const objectsWithState = config.objects.map((obj) => {
      const user = users.find((u) => u.object_id === obj.id);
      return {
        ...obj,
        isActive: user ? user.is_active === 1 : false,
        isMe: user ? user.user_id === currentUserId : false,
        isAssigned: !!user,
      };
    });
    setObjects(objectsWithState);
  };

  const handleObjectClick = async (objectId: string, isMe: boolean) => {
    if (!isMe || !room) return;
    try {
      await fetch(`/api/rooms/${room.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      // Optimistic UI update
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === objectId ? { ...obj, isActive: !obj.isActive } : obj
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem("cofi_room_id");
    localStorage.removeItem("cofi_user_id");
    setView("landing");
    setRoom(null);
    setUserId("");
    setObjects([]);
    setError("");
  };

  if (isLoading && view === "landing") {
    return <LoadingScreen />;
  }

  // --- Room View ---
  if (view === "room" && room) {
    const config = themeConfigs[room.theme] || themeConfigs["rainy"];
    return (
      <RoomView
        room={room}
        config={config}
        objects={objects}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        handleLeaveRoom={handleLeaveRoom}
        handleObjectClick={handleObjectClick}
      />
    );
  }

  // --- Landing View ---
  return (
    <>
      <LandingView
        onShowCreateModal={() => setShowModal(true)}
        onShowJoinModal={() => {
          setError("");
          setShowJoinInput(true);
        }}
        error={!showJoinInput ? error : undefined}
      />

      {showModal && (
        <CreateRoomModal
          onSelectTheme={handleCreateRoom}
          onCancel={() => setShowModal(false)}
        />
      )}

      {showJoinInput && (
        <JoinRoomModal
          joinRoomId={joinRoomId}
          setJoinRoomId={setJoinRoomId}
          handleJoinRoom={handleJoinRoom}
          onCancel={() => setShowJoinInput(false)}
          error={error}
        />
      )}
    </>
  );
}
