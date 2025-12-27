import { ThemeConfigs } from "@/types";

export const themeConfigs: ThemeConfigs = {
  rainy: {
    name: "Rainy Room",
    // Using style attribute to directly load the image
    bgImage: "/assets/rainy/bg-main2.png",
    bgClass: "bg-slate-900", // fallback color
    objects: [
      {
        id: "cat",
        name: "Cat",
        imagePath: "/assets/rainy/cat-strip.gif",
        soundPath: "/sounds/rainy/cat-strip.wav",
        // Based on the new background, the cat is around the carpet area
        position: { top: "68%", left: "33%" },
        size: { width: "14%" },
      },
      // Reserved for the kettle (currently hidden or use a placeholder)
      {
        id: "kettle",
        name: "Kettle",
        imagePath: "/assets/rainy/kettle-boiling.gif",
        soundPath: "/sounds/rainy/kettle-boiling.wav",
        position: { top: "50%", left: "72%" }, // Right side of the table
        size: { width: "15%" },
      },
      // Reserved for the computer
      {
        id: "computer",
        name: "Computer",
        imagePath: "/assets/rainy/computer-running.gif",
        soundPath: "/sounds/rainy/computer-running.wav",
        position: { top: "37%", left: "62%" }, // Left side of the table
        size: { width: "17%" },
      },
      // Reserved for the window (rain sound) - This is an invisible button area
      {
        id: "window",
        name: "Rain Window",
        imagePath: "/assets/rainy/window-raining2.gif",
        soundPath: "/sounds/rainy/window-raining.wav",
        position: { top: "29.4%", left: "24%" },
        size: { width: "38.6%" },
      },
    ],
    decorations: [
      {
        id: "keyboard",
        name: "Keyboard",
        imagePath: "/assets/rainy/keyboard.png",
        position: { top: "48%", left: "57%" },
        size: { width: "8%" },
      },
      {
        id: "chair",
        name: "Chair",
        imagePath: "/assets/rainy/chair.png",
        position: { top: "66%", left: "53%" },
        size: { width: "25%" },
      },
    ],
  },
  // Keep other rooms as is for now, update later
  midnight: {
    name: "Midnight Mart",
    bgImage: "",
    bgClass: "bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900",
    objects: [],
  },
  forest: {
    name: "Forest Camp",
    bgImage: "",
    bgClass: "bg-gradient-to-br from-green-900 via-orange-900 to-green-800",
    objects: [],
  },
};
