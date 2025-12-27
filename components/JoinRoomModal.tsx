import React from "react";

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form
        onSubmit={handleJoinRoom}
        className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Enter Room ID</h2>
        <input
          type="text"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="ABCD"
          className="w-full bg-gray-900 border border-gray-600 rounded-lg py-4 text-center text-3xl tracking-[1em] font-mono mb-6 focus:outline-none focus:border-blue-500"
        />
        {error && (
          <p className="text-red-400 mb-6 bg-red-900/20 py-2 rounded text-center">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 rounded-lg font-bold"
          >
            Join
          </button>
        </div>
      </form>
    </div>
  );
}
