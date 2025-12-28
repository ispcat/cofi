import React from "react";
import Modal from "@/components/ui/Modal";
import PixelatedButton from "@/components/ui/PixelatedButton";
import PixelatedInput from "@/components/ui/PixelatedInput";

interface JoinRoomModalProps {
  joinRoomId: string;
  setJoinRoomId: (id: string) => void;
  handleJoinRoom: (e: React.FormEvent) => void;
  onCancel: () => void;
  error?: string;
}

export default function JoinRoomModal({
  joinRoomId,
  setJoinRoomId,
  handleJoinRoom,
  onCancel,
  error,
}: JoinRoomModalProps) {
  return (
    <Modal onClose={onCancel} title="ENTER ROOM ID">
      <form onSubmit={handleJoinRoom} className="w-full max-w-sm mx-auto">
        <PixelatedInput
          type="text"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="ABCD"
        />
        {error && (
          <p className="text-red-400 mt-4 bg-red-900/20 py-2 rounded text-center">
            {error}
          </p>
        )}
        <div className="mt-6">
          <PixelatedButton type="submit">Join</PixelatedButton>
        </div>
      </form>
    </Modal>
  );
}
