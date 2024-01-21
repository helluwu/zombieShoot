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

// Initialize game variables
let gameStarted;
let player;
let zombie;
let zombieSpawnRate;
let hoard;
let bullets;
let expPoints;
let mouse;
let keys;
let shootingInterval;
let medkits = [];
let speedBoosts = [];
let fireRateBoosts = [];

// CONSTANTS
let MAX_FIRE_RATE = 250;

let MAX_ZOMBIE_SPAWN_RATE = 0.05;
let MAX_ZOMBIE_SPEED = 2;
let MAX_ZOMBIE_HP = 100;

let SPAWN_MEDKIT_RATE = 0.01;
let SPAWN_SPEED_BOOST_RATE = 0.01;
let SPAWN_FIRE_RATE_BOOST_RATE = 0.01;

// Start the game
function startGame () {
  gameStarted = true;
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    hp: 100,
    maxHp: 100,
    hpRegen: 0.01,
    fireRate: 0.25,
    dmg: 10,
    exp: 0,
    speed: 1.2,
    radius: 10,
  };
  zombie = { 
    hp: 9,
    maxHp: 10,
    speed: 1,
    radius: 10,
  }
  zombieSpawnRate = 0.005;
  hoard = [];
  bullets = [];
  expPoints = [];
  medkits = [];
  speedBoosts = [];
  fireRateBoosts = [];
  mouse = { x: 0, y: 0 };
  keys = {};
  if (shootingInterval) clearInterval(shootingInterval);
  shootingInterval = setInterval(() => {
    if (gameStarted) {
      bullets.push({ x: player.x, y: player.y, speed: 5, angle: Math.atan2(mouse.y - player.y, mouse.x - player.x) });
    }
  }, MAX_FIRE_RATE / player.fireRate);
}
startGame();

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

let restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', function() {
  // Hide the restart button
  restartButton.style.display = 'none';
  over.style.display = 'none';
  document.getElementById('overlay').style.display = 'none';

  // Reset the game state
  startGame();

  // Restart the game loop
  gameLoop();
});


// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player movement
  if ((keys['w'] || keys['W']) && player.y - player.speed > 0) player.y -= player.speed;
  if ((keys['s'] || keys['S']) && player.y + player.speed < canvas.height) player.y += player.speed;
  if ((keys['a'] || keys['A']) && player.x - player.speed > 0) player.x -= player.speed;
  if ((keys['d'] || keys['D']) && player.x + player.speed < canvas.width) player.x += player.speed;
  // Update player hp (regen)
  if (player.hp < player.maxHp) player.hp += player.hpRegen;

  // Update zombie stats
  console.log(zombie.hp, zombie.speed, zombieSpawnRate)
  if (zombie.hp < MAX_ZOMBIE_HP) zombie.hp += 0.0005;
  if (zombie.speed < MAX_ZOMBIE_SPEED) zombie.speed += 0.00001;
  if (zombieSpawnRate < MAX_ZOMBIE_SPAWN_RATE) zombieSpawnRate += 0.000001;

  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();
  // Draw player hp bar
  let barWidth = 50;
  let barHeight = 5;
  let x = player.x - barWidth / 2;
  let y = player.y - player.radius - 10; 
  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fillRect(x, y, barWidth, barHeight);
  let healthPercent = player.hp / player.maxHp;
  ctx.fillStyle = 'rgb(0, 255, 0)'; 
  ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

  // Create new zombies
  if (Math.random() < zombieSpawnRate) {
    let angle = Math.random() * Math.PI * 2; // Random angle
    let distance = 500; // Distance from the player
    let x = player.x + Math.cos(angle) * distance;
    let y = player.y + Math.sin(angle) * distance;
    let z = {
      x: x,
      y: y,
      hp: zombie.hp,
      maxHp: zombie.maxHp,
      speed: zombie.speed,
      radius: zombie.radius,
    }
    hoard.push(z);
  }

  // Move and draw zombies
  for (let i = 0; i < hoard.length; i++) {
    let zombie = hoard[i];
    let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angle) * zombie.speed;
    zombie.y += Math.sin(angle) * zombie.speed;

  // Add collision detection with player
  let dx = player.x - zombie.x;
  let dy = player.y - zombie.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

if (distance < player.radius + zombie.radius) { // Assuming player and zombie have a 'radius' property
    player.hp--;
    if (player.hp <= 0) {
        // End the game
        document.getElementById('overlay').style.display = 'block';
        
        // Show the restart button
        over.style.display = 'block';
        restartButton.style.display = 'block';
        gameStarted = false;
    
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
    // Remove bullet if it is off the canvas
    if (bullet.x < -50 || bullet.y < -50 || bullet.x > canvas.width + 50 || bullet.y > canvas.height + 50) {
      bullets.splice(i, 1);
      i--; // Decrement i to account for the removed bullet
      continue;
    }
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Check for bullet-zombie collisions
    for (let j = 0; j < hoard.length; j++) {
      let zombie = hoard[j];
      let dx = bullet.x - zombie.x;
      let dy = bullet.y - zombie.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 15) {
        zombie.hp -= player.dmg;
        if (zombie.hp <= 0) {
          hoard.splice(j, 1);
          j--; 
          // Drop exp and/or items
          expPoints.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_MEDKIT_RATE) medkits.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_SPEED_BOOST_RATE) speedBoosts.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_FIRE_RATE_BOOST_RATE) fireRateBoosts.push({ x: zombie.x, y: zombie.y });

        } else { 
          hoard[j] = zombie;
        }
        
        bullets.splice(i, 1);
        i--; 
        break;
      }
    }
    // Check for exp-player collisions
    for (let i = 0; i < expPoints.length; i++) {
      let xp = expPoints[i];
      // Draw experience point
      ctx.beginPath();
      ctx.arc(xp.x, xp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'yellow';
      ctx.fill();

      // Check for collision with player
      let dx = player.x - xp.x;
      let dy = player.y - xp.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < player.radius + 5) {
        // Increase player's experience
        player.exp += 10;
        // Remove experience point
        expPoints.splice(i, 1);
        i--;
      }
    }
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
