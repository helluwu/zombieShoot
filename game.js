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
let mouse;
let keys;
let shootingInterval;
let MAX_FIRE_RATE = 300;

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
    speed: 1.2,
    radius: 10,
  };
  zombie = { 
    hp: 100,
    speed: 1,
    radius: 10,
  }
  zombieSpawnRate = 0.01;
  hoard = [];
  bullets = [];
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
  playerLives = 3;
  zombies = [];

  // Restart the game loop
  gameLoop();
});



let trees = []; // Array to store the tree elements


  function createTree() {
    // Create the 'wood' part of the tree
    let wood = document.createElement('div');
    wood.className = 'wood';
    wood.style.width = '10px';
    wood.style.height = '20px';
    wood.style.backgroundColor = 'brown';
    wood.style.position = 'absolute';

    // Create the 'leaves' part of the tree
    let leaves = document.createElement('div');
    leaves.className = 'leaves';
    leaves.style.width = '50px';
    leaves.style.height = '50px';
    leaves.style.backgroundColor = 'green';
    leaves.style.position = 'absolute';

    // Position the tree at a random location within the viewport
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    wood.style.left = x + 'px';
    wood.style.top = (y + 50) + 'px'; // Position the wood 50px below the leaves
    leaves.style.left = (x - 20) + 'px'; // Center the leaves over the wood
    leaves.style.top = y + 'px';

    // Append the 'wood' and 'leaves' to the body
    document.body.appendChild(wood);
    document.body.appendChild(leaves);

    trees.push({wood, leaves});
}

// Create 10 trees
for (let i = 0; i < 10; i++) {
    createTree();
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player movement
  if ((keys['w'] || keys['W']) && player.y - player.speed > 0) player.y -= player.speed;
  if ((keys['s'] || keys['S']) && player.y + player.speed < canvas.height) player.y += player.speed;
  if ((keys['a'] || keys['A']) && player.x - player.speed > 0) player.x -= player.speed;
  if ((keys['d'] || keys['D']) && player.x + player.speed < canvas.width) player.x += player.speed;
  // Update player hp (regen)
  if (player.hp < player.maxHp) player.hp += player.hpRegen;

  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();
  // Draw player hp bar
  let barWidth = 50;
  let barHeight = 5;
  let x = player.x - barWidth / 2;
  let y = player.y - player.radius - 10; 
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, barWidth, barHeight);
  let healthPercent = player.hp / player.maxHp;
  ctx.fillStyle = 'green';
  ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

  // Create new zombies
  if (Math.random() < zombieSpawnRate) {
    let angle = Math.random() * Math.PI * 2; // Random angle
    let distance = 500; // Distance from the player
    let x = player.x + Math.cos(angle) * distance;
    let y = player.y + Math.sin(angle) * distance;
    hoard.push({ x: x, y: y, speed: 1, radius: 10});
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

      if (distance < 10 + 5) {
        hoard.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
