
if (global.paints === undefined) console.log('paint');

global.paints = ++global.paints || 0;

if (global.images.tiles instanceof Graphics.Image) {
  const { tiles } = global.images;

  const { width, height } = global.canvas;

  for (let x = 0; x < width; x += 64) {
    for (let y = 0; y < height; y += 64) {
      const random = global.seededRandom(99, x / 64, y / 64) % 4;
      const srcX = random * 64 + (random * 10);

      gfx.draw(tiles, {
        x,
        y,
        width: 64,
        height: 64,
        srcX,
        srcY: 0,
        srcWidth: 64,
        srcHeight: 64
      });
    }
  }
}

global.objects.forEach(({ x, y, origin, angle, image }) => {
  if (image instanceof Graphics.Image) {
    gfx.save();
    gfx.rotate(angle * (Math.PI / 180), x, y);
    gfx.draw(image, {
      x: x - origin.x,
      y: y - origin.y
    });    gfx.restore();  }});