# Sound Asset Structure

Place your sound files in the following structure:

```
public/sounds/
├── rainy/
│   ├── background.mp3      # Background music for rainy theme
│   ├── window.mp3          # Sound when window
│   ├── lamp.mp3            # Sound when lamp
│   ├── plant.mp3           # Sound when plant
│   └── book.mp3            # Sound when book
├── midnight/
│   ├── background.mp3
│   ├── neon.mp3
│   ├── fridge.mp3
│   ├── radio.mp3
│   └── vending.mp3
└── forest/
    ├── background.mp3
    ├── fire.mp3
    ├── tent.mp3
    ├── trees.mp3
    └── guitar.mp3
```

## How it works:

1. **Background Music**: Always plays (loops) when in room
2. **Object Sounds**: Play when object is activated, loop while active
3. **Mute Button**: Mutes all sounds (background + objects)
4. **Mix**: Multiple object sounds can play simultaneously

## Audio Format:
- Recommended: `.mp3` or `.ogg` for best browser compatibility
- All sounds should loop seamlessly
