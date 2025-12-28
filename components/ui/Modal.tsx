import React from "react";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({ onClose, children, title }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-contain bg-center bg-no-repeat p-8"
        style={{
          backgroundImage: "url('/assets/ui/modal-bg_compressed.png')",
          imageRendering: "pixelated",
          backgroundSize: "100% 100%",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="relative z-10">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-8 h-8 bg-contain bg-center bg-no-repeat hover:scale-110 transition-transform"
            style={{
              backgroundImage: "url('/assets/ui/close-icon_compressed.png')",
              imageRendering: "pixelated",
            }}
          >
            <span className="sr-only">Close</span>
          </button>

          <h2
            className="text-3xl md:text-4xl text-center text-orange-100 font-bold tracking-widest mb-6"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              textShadow: "3px 3px 0px #000",
            }}
          >
            {title}
          </h2>

          {children}
        </div>
      </div>
    </div>
  );
}
