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
let shootingInterval1;
let shootingInterval2
let medkits = [];
let speedBoosts = [];
let fireRateBoosts = [];
let killCount = 0;


// CONSTANTS
let MAX_FIRE_RATE = 250;

let MAX_ZOMBIE_SPAWN_RATE = 0.05;
let MAX_ZOMBIE_SPEED = 2;
let MAX_ZOMBIE_HP = 100;

let SPAWN_MEDKIT_RATE = 0.01;
let SPAWN_SPEED_BOOST_RATE = 0.01;
let SPAWN_FIRE_RATE_BOOST_RATE = 0.01;

// xp bar variables
let maxExp = 100; // Replace with the actual maximum experience
let expBarWidth = 200; // Width of the experience bar
let expBarHeight = 20; // Height of the experience bar
let expBarX = canvas.width - expBarWidth - 10; // 10px from the right edge of the canvas
let expBarY = 10; // 10px from the top of the canvas

// Start the game
let menu = document.getElementById('menu');
let startButton = document.getElementById('startButton');

startButton.addEventListener('click', function() {
  menu.style.display = 'none';
  gameStarted = true;
  gameLoop();
});

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
    kills: 0,
    speed: 2.5,
    radius: 10,
  };
  zombie = { 
    hp: 9,
    maxHp: 9,
    speed: 1.5,
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
  updateFireRate1(player.fireRate);
}

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

let playerImage = new Image();
playerImage.src = 'imgs/lvl1.png'; 

let zombieImage = new Image();
zombieImage.src = 'imgs/zombie.png';

let xpImage = new Image();
xpImage.src = 'imgs/bullet.png';

function updateFireRate1(newFireRate) {
  player.fireRate = newFireRate;
  // Clear the old interval
  if (shootingInterval1) clearInterval(shootingInterval1);

  // Set a new interval with the updated fire rate
  shootingInterval1 = setInterval(() => {
    if (gameStarted) {
      bullets.push({ id:1, x: player.x, y: player.y, speed: 6, angle: Math.atan2(mouse.y - player.y, mouse.x - player.x), size: 10 });
    }
  }, MAX_FIRE_RATE / player.fireRate);
}

startGame();

function gameLoop() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player movement
  if ((keys['w'] || keys['W']) && player.y - player.speed > 0) player.y -= player.speed;
  if ((keys['s'] || keys['S']) && player.y + player.speed < canvas.height) player.y += player.speed;
  if ((keys['a'] || keys['A']) && player.x - player.speed > 0) player.x -= player.speed;
  if ((keys['d'] || keys['D']) && player.x + player.speed < canvas.width) player.x += player.speed;
  // Update player hp (regen)
  if (player.hp < player.maxHp) player.hp += player.hpRegen;
  // Update player fire rate every 10 kills
  if (player.fireRate < MAX_FIRE_RATE && player.kills % 11 == 10) {
    player.kills++;
    updateFireRate1(player.fireRate + 0.5);
  }
  // New weapon 2 : Bazooka
  if (player.exp == 100) {
    if (shootingInterval2) clearInterval(shootingInterval2);
      shootingInterval2 = setInterval(() => {
        if (gameStarted) {
          bullets.push({ id: 2, x: player.x, y: player.y, speed: 3, angle: Math.atan2(mouse.y - player.y, mouse.x - player.x), size: 50 });
        }
      }, MAX_FIRE_RATE / player.fireRate * 3);
    player.exp += 10;
  }
  // New weapon 3 : orbiting bullets
  if (player.exp == 1000) {

  }

  // Update zombie stats every
  if (zombie.maxHp < MAX_ZOMBIE_HP) zombie.maxHp += 0.0005;
  if (zombie.speed < MAX_ZOMBIE_SPEED) zombie.speed += 0.00001;
  if (zombieSpawnRate < MAX_ZOMBIE_SPAWN_RATE) zombieSpawnRate += 0.000001;

  // Draw player
  ctx.drawImage(playerImage, player.x - 45, player.y-10, 120, 100);

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

  // ZOMBIES DRAW & UPDATE ====================================================
  for (let i = 0; i < hoard.length; i++) {
    let zombie = hoard[i];
    let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angle) * zombie.speed;
    zombie.y += Math.sin(angle) * zombie.speed;

    // Add collision detection with player
    let dx = (player.x + 5) - zombie.x;
    let dy = (player.y + 1) - zombie.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + zombie.radius) { 
        player.hp--;
        if (player.hp <= 0) {
            // End the game
            document.getElementById('overlay').style.display = 'block';
            over.style.display = 'block';
            restartButton.style.display = 'block';
            gameStarted = false;
            return;
        }
    }
    ctx.drawImage(zombieImage, zombie.x, zombie.y, 120, 100);
    if (zombie.hp < zombie.maxHp) {
      let barWidth = 50; 
      let barHeight = 5;
      let healthPercent = zombie.hp / zombie.maxHp;
      ctx.fillStyle = 'red';
      ctx.fillRect(zombie.x - barWidth / 2, zombie.y - 60, barWidth * healthPercent, barHeight);
    }
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
    ctx.arc(bullet.x +70, bullet.y + 35, bullet.size, 0, Math.PI * 2 );
    ctx.fillStyle = 'black';
    ctx.fill();

    // Check for bullet-zombie collisions
    for (let j = 0; j < hoard.length; j++) {
      let zombie = hoard[j];
      let dx = bullet.x - zombie.x;
      let dy = bullet.y - zombie.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.size * 1.2 + zombie.radius) {
        zombie.hp -= player.dmg;
        if (zombie.hp <= 0) {
          killCount++;
          hoard.splice(j, 1);
          j--; 
          // Drop exp and/or items
          expPoints.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_MEDKIT_RATE) medkits.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_SPEED_BOOST_RATE) speedBoosts.push({ x: zombie.x, y: zombie.y });
          if (Math.random() < SPAWN_FIRE_RATE_BOOST_RATE) fireRateBoosts.push({ x: zombie.x, y: zombie.y });
          // Increase player's kills
          player.kills++;
        } else { 
          hoard[j] = zombie;
        }
        if (bullet.id == 1) {
          bullets.splice(i, 1);
          i--; 
          break;
        }
      }
    }
  }

  // Draw experience points
  for (let i = 0; i < expPoints.length; i++) {
    let xp = expPoints[i];
    // Draw experience point
    ctx.drawImage(xpImage, xp.x - 5, xp.y - 5, 40, 40);

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

  // Draw the border of the experience bar
ctx.fillStyle = 'black';
ctx.fillRect(expBarX - 1, expBarY - 1, expBarWidth + 2, expBarHeight + 2);

  // Draw the background of the experience bar
ctx.fillStyle = 'gray';
ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);

// Draw the current experience
let currentExpWidth = (player.exp / maxExp) * expBarWidth;
ctx.fillStyle = 'yellow';
ctx.fillRect(expBarX, expBarY, currentExpWidth, expBarHeight);
  requestAnimationFrame(gameLoop);
}
gameLoop();
