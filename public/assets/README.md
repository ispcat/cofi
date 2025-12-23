# Asset Structure

Place your GIF files in the following structure:

```
public/assets/
├── rainy/
│   ├── window.gif
│   ├── lamp.gif
│   ├── plant.gif
│   └── book.gif
├── midnight/
│   ├── neon.gif
│   ├── fridge.gif
│   ├── radio.gif
│   └── vending.gif
└── forest/
    ├── fire.gif
    ├── tent.gif
    ├── trees.gif
    └── guitar.gif
```

## How it works:
- When **active**: The GIF plays (animated)
- When **inactive**: Shows the first frame only (static)
- When **unassigned**: Gray filter is applied

The first frame is automatically extracted from the GIF using HTML5 Canvas, so you only need to provide the `.gif` files!

