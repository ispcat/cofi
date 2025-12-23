# Cofi - Ambient Rooms

A minimalist web app for creating and joining ambient rooms with friends. Built with Next.js, TypeScript, and SQLite.

## Features

- **Landing Page**: Minimalist design with animated gradient background
- **Create Room**: Choose from 3 ambient themes (Rainy Room, Midnight Mart, Forest Camp)
- **Join Room**: Enter a 4-digit room ID to join existing rooms
- **Interactive Rooms**: Click objects to toggle ambient sounds and effects

## Tech Stack

- **Frontend**: React, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
cofi/
├── app/
│   ├── api/
│   │   └── rooms/          # API routes for room management
│   ├── room/[id]/          # Dynamic room page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   └── ThemeCard.tsx       # Theme selection card component
├── lib/
│   └── db.ts               # Database utilities
└── public/
    └── sounds/             # Sound assets (to be added)
```

## Themes

### 🌧️ Rainy Room
Cozy atmosphere with rain sounds and blue-gray tones.

### 🏪 Midnight Mart
Late-night convenience store vibes with neon purple/green aesthetics.

### 🔥 Forest Camp
Warm campfire setting with orange and green forest tones.

## Usage

1. **Create a Room**: Click "Create Room" and select your preferred theme
2. **Share Room ID**: Share the generated 4-digit ID with friends
3. **Join a Room**: Others can join using "Join Room" with your ID
4. **Interact**: Click on objects in the room to toggle ambient sounds

## License

ISC
