import React from "react";
import ThemeCard from "@/components/ThemeCard";
import Modal from "@/components/ui/Modal";

interface CreateRoomModalProps {
  onSelectTheme: (theme: "rainy" | "midnight" | "forest") => void;
  onCancel: () => void;
}

export default function CreateRoomModal({
  onSelectTheme,
  onCancel,
}: CreateRoomModalProps) {
  return (
    <Modal onClose={onCancel} title="SELECT VIBE">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Only allow clicking on Rainy Room */}
        <ThemeCard
          title="Rainy Room"
          imageUrl="/assets/ui/rainy-theme_compressed.png"
          theme="rainy"
          description="Chill beats & Rain"
          colorClass="bg-blue-900/50 border-blue-500/50"
          onSelect={onSelectTheme}
        />
        <div className="w-full h-full opacity-50 cursor-not-allowed grayscale">
          <ThemeCard
            title="Midnight Mart"
            imageUrl="/assets/ui/midnight-theme_compressed.png"
            theme="midnight"
            description="Coming Soon"
            colorClass="bg-purple-900"
            onSelect={() => {}}
          />
        </div>
        <div className="w-full h-full opacity-50 cursor-not-allowed grayscale">
          <ThemeCard
            title="Forest Camp"
            imageUrl="/assets/ui/forest-theme_compressed.png"
            theme="forest"
            description="Coming Soon"
            colorClass="bg-orange-900"
            onSelect={() => {}}
          />
        </div>
      </div>
    </Modal>
  );
}
