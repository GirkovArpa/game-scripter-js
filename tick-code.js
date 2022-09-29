
if (global.ticks === undefined) console.log('tick');
global.ticks = ++global.ticks || 0;

global.objects ||=[];
global.objects.bullets ||=[];

global.images ||=[];

global.angleBetweenPoints ||= function({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  const dy = y2 - y1;
  const dx = x2 - x1;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  if (theta < 0) theta = 360 + theta;
  return theta;
}

global.rotateAround ||= function({ x, y }, angle) {
  const radians = angle * (Math.PI / 180);
  return {
    x: x * Math.cos(radians) - y * Math.sin(radians),
    y: x * Math.sin(radians) + y * Math.cos(radians)
  };
}

global.areColliding = function (a, b) {
  return !(
    ((a.y + a.height) < (b.y)) ||
    (a.y > (b.y + b.height)) ||
    ((a.x + a.width) < b.x) ||
    (a.x > (b.x + b.width))
  );
}

if (global.ticks === 0) {
  const width = 48;
  const height = 48;

  const player = {
    width,
    height,
    x: width / 2,
    y: height / 2,
    origin: {
      x: width / 2,
      y: height / 2
    },
    angle: 0,
    ticksSinceLastBullet: 0
  };

  global.objects.player = player;
  global.objects.push(player);

  Graphics.Image.load('internal://assets/sprites/spritesheet_characters.png').then(image => {
    player.image = new Graphics.Image(width, height, function (gfx) {
      gfx.draw(image, {
        width,
        height,
        srcWidth: 51,
        srcHeight: 44,
        srcX: 112,
        srcY: 87
      });
    });
  });

  global.objects.monsters = Array.from({ length: 3 }, () => {
    const x = Math.round(Math.random() * (global.canvas.width / 2) + (global.canvas.width / 2));
    const y = Math.round(Math.random() * global.canvas.height);
    const monster = {
      speed: 3,
      width: 64,
      height: 64,
      x,
      y,
      origin: {
        x: 64 / 2,
        y: 64 / 2,
      },
      angle: global.angleBetweenPoints(global.objects.player, { x, y })
    };
    global.objects.push(monster);
    return monster;
  });

  Graphics.Image.load('internal://assets/sprites/gargant-move.png')
    .then(image => {
      const images = Array.from({ length: 8 }, (_, i) => {
        return new Graphics.Image(64, 64, function (gfx) {
          gfx.draw(image, {
            width: 64,
            height: 64,
            srcWidth: 64,
            srcHeight: 64,
            x: 0,
            y: 0,
            srcX: 0,
            srcY: i * 64
          });
        });
      });
      global.objects.monsters.forEach(monster => monster.images = images);
    });

  global.gargantDeathImages = [];

  Graphics.Image.load('internal://assets/sprites/gargant-death-0.png').then(image => {
    const images = Array.from({ length: 8 }, (_, i) => {
      return new Graphics.Image(64, 64, function (gfx) {
        gfx.draw(image, {
          width: 64,
          height: 64,
          srcWidth: 64,
          srcHeight: 64,
          x: 0,
          y: 0,
          srcX: 0,
          srcY: i * 64
        });
      });
    });
    global.gargantDeathImages.push(...images);

    Graphics.Image.load('internal://assets/sprites/gargant-death-1.png').then(image => {
      const images = Array.from({ length: 8 }, (_, i) => {
        return new Graphics.Image(64, 64, function (gfx) {
          gfx.draw(image, {
            width: 64,
            height: 64,
            srcWidth: 64,
            srcHeight: 64,
            x: 0,
            y: 0,
            srcX: 0,
            srcY: i * 64
          });
        });
      });
      global.gargantDeathImages.push(...images);
    });
  });

  Graphics.Image.load('internal://assets/sprites/spritesheet_tiles.png').then(image => {
    global.images.push(image);
    global.images.tiles = image;
  });
}

global.objects.forEach(object => {
  if (!object.images?.length) return;
  if (object.imageSpeed === 0) return;
  const index = object.images.indexOf(object.image);
  object.image = object.images[(index + 1) % object.images.length];
});

global.objects.monsters.forEach(monster => {
  if (monster.isDead) {
    const index = monster.images.indexOf(monster.image);
    if (index === monster.images.length - 1) {
      monster.imageSpeed = 0;
    }
    return;
  }
  const angle = global.angleBetweenPoints(monster, global.objects.player);
  monster.angle = angle;
  monster.x += monster.speed * Math.cos(angle * Math.PI / 180);
  monster.y += monster.speed * Math.sin(angle * Math.PI / 180);
});

const { player } = global.objects;

player.ticksSinceLastBullet++;

if (global.mouse.left) {
  player.angle = global.angleBetweenPoints(player, global.mouse);
  if (player.ticksSinceLastBullet >= 5) spawnBullet();
}

if (!global.mouse.left) {
  if (global.key.right || global.key.d) {
    player.x += 10;
    player.angle = 0;
  }

  if (global.key.left || global.key.a) {
    player.x -= 10;
    player.angle = 180;
  }

  if (global.key.up || global.key.w) {
    player.y -= 10;
    player.angle = 270;
  }

  if (global.key.down || global.key.s) {
    player.y += 10;
    player.angle = 90;
  }
}

global.objects.bullets.forEach(bullet => {
  if (bullet.mustBeDestroyed) return;
  bullet.x += bullet.speed * Math.cos(bullet.angle * Math.PI / 180);
  bullet.y += bullet.speed * Math.sin(bullet.angle * Math.PI / 180);

  const { width, height } = global.canvas;

  if ((bullet.x > width + 10) || (bullet.x < 0) || (bullet.y > height) || (bullet.y < 0)) {
    bullet.mustBeDestroyed = true;
  }
});

function spawnBullet() {
  const { player } = global.objects;

  player.ticksSinceLastBullet = 0;

  const rotated = global.rotateAround({
    x: 47 - player.origin.x,
    y: 33 - player.origin.y
  }, player.angle);

  const x = rotated.x + player.x;
  const y = rotated.y + player.y;

  const bullet = {
    width: 21,
    height: 7,
    speed: 5,
    x,
    y,
    angle: player.angle,
    origin: {
      x: 0,
      y: 3
    },
    image: new Graphics.Image(21, 7, function (gfx) {
      gfx.fillStyle = 'yellow';
      gfx.fillRect(0, 0, 21, 7);
    })
  };
  global.objects.push(bullet);
  global.objects.bullets.push(bullet);
}


global.objects.bullets.forEach(bullet => {
  global.objects.monsters.forEach(monster => {
    if (monster.isDead) return;
    if (global.areColliding(bullet, monster)) {
      bullet.mustBeDestroyed = true;
      monster.isDead = true;
      monster.images = [...global.gargantDeathImages];
    }
  });
});

let indexToRemove = null;
while ((indexToRemove = global.objects.findIndex(obj => obj.mustBeDestroyed)) !== -1) {
  const obj = global.objects[indexToRemove];

  obj.x = -999;
  obj.y = -999;
  global.objects.splice(indexToRemove, 1);
}