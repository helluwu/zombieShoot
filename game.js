// JavaScript (game.js)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let player = { x: 400, y: 300, speed: 4 };
let zombies = [];
let bullets = [];
let mouse = { x: 0, y: 0 };
let keys = {};

window.addEventListener('keydown', function(e) {
  keys[e.key] = true;
});

window.addEventListener('keyup', function(e) {
  keys[e.key] = false;
});

canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener('click', function() {
  bullets.push({ x: player.x, y: player.y, speed: 5, angle: Math.atan2(mouse.y - player.y, mouse.x - player.x) });
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player based on keys
  if (keys['w'] || keys['W']) player.y -= player.speed;
  if (keys['s'] || keys['S']) player.y += player.speed;
  if (keys['a'] || keys['A']) player.x -= player.speed;
  if (keys['d'] || keys['D']) player.x += player.speed;


  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // Create new zombies
  if (Math.random() < 0.01) {
    zombies.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 1 });
  }

  // Move and draw zombies
  for (let i = 0; i < zombies.length; i++) {
    let zombie = zombies[i];
    let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angle) * zombie.speed;
    zombie.y += Math.sin(angle) * zombie.speed;

    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  // Move and draw bullets
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Check for bullet-zombie collisions
    for (let j = 0; j < zombies.length; j++) {
      let zombie = zombies[j];
      let dx = bullet.x - zombie.x;
      let dy = bullet.y - zombie.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10 + 5) {
        zombies.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();