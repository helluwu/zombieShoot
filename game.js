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

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: 2,
  radius: 10
};
let zombies = [];
let bullets = [];
let mouse = { x: 0, y: 0 };
let keys = {};

//movement control and shooting control
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

let playerLives = 3;


let restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', function() {
  // Hide the restart button
  restartButton.style.display = 'none';

  // Reset the game state
  playerLives = 3;
  zombies = [];

  // Restart the game loop
  gameLoop();
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
    zombies.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 1, radius: 10});

  }

  // Move and draw zombies
  for (let i = 0; i < zombies.length; i++) {
    let zombie = zombies[i];
    let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angle) * zombie.speed;
    zombie.y += Math.sin(angle) * zombie.speed;

    // Add collision detection with player
  let dx = player.x - zombie.x;
  let dy = player.y - zombie.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < player.radius + zombie.radius) { // Assuming player and zombie have a 'radius' property
    playerLives--;
    if (playerLives <= 0) {
      // End the game, replace this with your game over logic
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    
    // Show the restart button
  restartButton.style.display = 'block';
  
  return;
    }
    
  }

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