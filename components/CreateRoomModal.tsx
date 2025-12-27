import React from "react";
import ThemeCard from "@/components/ThemeCard";

interface CreateRoomModalProps {
  onSelectTheme: (theme: "rainy" | "midnight" | "forest") => void;
  onCancel: () => void;
}

export default function CreateRoomModal({
  onSelectTheme,
  onCancel,
}: CreateRoomModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl max-w-4xl w-full border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center">Select Vibe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Only allow clicking on Rainy Room */}
          <ThemeCard
            title="Rainy Room"
            icon="🌧️"
            theme="rainy"
            description="Chill beats & Rain"
            colorClass="bg-blue-900/50 border-blue-500/50"
            onSelect={onSelectTheme}
          />
          <div className="opacity-50 cursor-not-allowed grayscale">
            <ThemeCard
              title="Midnight Mart"
              icon="🏪"
              theme="midnight"
              description="Coming Soon"
              colorClass="bg-purple-900"
              onSelect={() => {}}
            />
          </div>
          <div className="opacity-50 cursor-not-allowed grayscale">
            <ThemeCard
              title="Forest Camp"
              icon="🔥"
              theme="forest"
              description="Coming Soon"
              colorClass="bg-orange-900"
              onSelect={() => {}}
            />
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
