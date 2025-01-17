const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}

// SPEED PLAYER
const SPEED = 2.5

// SPEED KOGEL
const KOGEL_SPEED = 3

const RADIUS = 20
const PROJECTILE_RADIUS = 5
let projectileId = 0

//canvas.width = 1450
//canvas.height = 650
// Voeg hier je muren array toe
const WIDTH_WALL = 10;
const walls = [
  { x: 1450 - 100, y: 80, width: WIDTH_WALL, height: 150 }, // Rechter Boven muur
  { x: 1450 - 400, y: 80, width: 300, height: WIDTH_WALL }, // Boven Rechter muur
  { x: 1450 - 100, y: 650 - 230, width: WIDTH_WALL, height: 150 }, // Rechter Onder muur
  { x: 1450 - 400, y: 650 - 85, width: 300, height: WIDTH_WALL }, // Onder Rechter muur

  { x: 100, y: 80, width: WIDTH_WALL, height: 150 }, // Linker Boven muur
  { x: 100, y: 80, width: 300, height: WIDTH_WALL }, // Boven Linker muur
  { x: 100, y: 650 - 230, width: WIDTH_WALL, height: 150 }, // Linker Onder muur
  { x: 100, y: 650 - 85, width: 300, height: WIDTH_WALL }, // Onder Linker muur

  { x: 1450 - 500, y: 225, width: WIDTH_WALL, height: 200 }, // Rechter muur
  { x: 500, y: 225, width: WIDTH_WALL, height: 200 }, // Linker muur
  { x: 625, y: 150, width: 200, height: WIDTH_WALL }, // Boven muur
  { x: 625, y: 650 - 150, width: 200, height: WIDTH_WALL }, // Onder muur
]


let amo = [
  { x: 1450 / 2, y: 650 / 2 - 25, width: 10, height: 10 }
];



io.on('connection', (socket) => {

  io.emit('updatePlayers', backEndPlayers)

  socket.emit('updateWalls', walls);

  socket.emit('updateAmo', amo);

  socket.on('initGame', ({ username, width, height, devicePixelRatio}) => {

    const scaledWidth = width * devicePixelRatio;
    const scaledHeight = height * devicePixelRatio;

    backEndPlayers[socket.id] = {
      x: 1450/2,
      y: 20,
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username,
      hp: 3,
      canvas: { width: scaledWidth, height: scaledHeight },
      radius: RADIUS,
      shots: 100000,
      hasHitAmo: false,
    }

    backEndPlayers[socket.id].canvas = {
      width,
      height
    }

    backEndPlayers[socket.id].radius = RADIUS

  })

  socket.on('shoot', ({ x, y, angle, }) => {

    const player = backEndPlayers[socket.id];

    if (player.shots <= 0) {
      return; // Stop het schieten als de speler geen schoten meer heeft
    }

    // Verlaag het aantal schoten van de speler
    player.shots -= 1;

    projectileId++

    const velocity = {
      x: Math.cos(angle) * KOGEL_SPEED,
      y: Math.sin(angle) * KOGEL_SPEED
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }


  })

  socket.on('disconnect', (reason) => {
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {

    const backEndPlayer = backEndPlayers[socket.id]
  
    if (!backEndPlayers[socket.id]) return
  
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    let newX = backEndPlayer.x;
    let newY = backEndPlayer.y;
  
    switch (keycode) {
      case 'ArrowUp':
        newY -= SPEED;
        break
  
      case 'ArrowLeft':
        newX -= SPEED;
        break
  
      case 'ArrowDown':
        newY += SPEED;
        break
  
      case 'ArrowRight':
        newX += SPEED;
        break
    }
  
    // Controleer of de speler niet tegen een muur aanloopt
    let collisionWithWall = false;
    for (const wall of walls) {
      const playerSides = {
        left: newX - backEndPlayer.radius,
        right: newX + backEndPlayer.radius,
        top: newY - backEndPlayer.radius,
        bottom: newY + backEndPlayer.radius
      };
  
      const wallLeft = wall.x;
      const wallRight = wall.x + wall.width;
      const wallTop = wall.y;
      const wallBottom = wall.y + wall.height;
  
      if (
        playerSides.right - 5 > wallLeft &&
        playerSides.left + 5< wallRight &&
        playerSides.bottom - 5> wallTop &&
        playerSides.top + 5< wallBottom
      ) {
        collisionWithWall = true;
        break;
      }
    }

    // Als er geen botsing is, werk dan de positie bij
    if (!collisionWithWall) {
      backEndPlayer.x = newX;
      backEndPlayer.y = newY;
    }


    // Controleer of de speler niet tegen het amo-blokje aanloopt
    let collisionWithAmo = false;

    for (const amoBlock of amo) {
      const amoLeft = amoBlock.x;
      const amoRight = amoBlock.x + amoBlock.width;
      const amoTop = amoBlock.y;
      const amoBottom = amoBlock.y + amoBlock.height;

      if (
        newX + backEndPlayer.radius > amoLeft &&
        newX - backEndPlayer.radius < amoRight &&
        newY + backEndPlayer.radius > amoTop &&
        newY - backEndPlayer.radius < amoBottom
      ) {
        collisionWithAmo = true;

        if (!backEndPlayer.hasHitAmo) {
          backEndPlayer.shots = 10;
          backEndPlayer.hasHitAmo = true;
        }
        break;
      }
    }

     // Reset de vlag als er geen botsing meer is
     if (!collisionWithAmo) {
      backEndPlayer.hasHitAmo = false;
    }

  
    // Zorg ervoor dat de speler niet buiten het canvas beweegt
    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }
    
    if (playerSides.left < 0) {
      backEndPlayer.x = backEndPlayer.radius;
    }
    if (playerSides.right > 1450) {
      backEndPlayer.x = 1450 - backEndPlayer.radius;
    }
    if (playerSides.top < 0) {
      backEndPlayer.y = backEndPlayer.radius;
    }
    if (playerSides.bottom > 650) {
      backEndPlayer.y = 650 - backEndPlayer.radius;
    }
  })
})  

// backend ticker
setInterval(() => {

  let toDeleteProjectiles = []

  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = 5
    const playerCanvas = backEndPlayers[backEndProjectiles[id].playerId]?.canvas

    // Verwijder projectiles die buiten het canvas gaan
    if (playerCanvas &&
      (backEndProjectiles[id].x - PROJECTILE_RADIUS >= playerCanvas.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >= playerCanvas.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0)
    ) {
      toDeleteProjectiles.push(id)
      continue
    }

    // Check voor collision met andere spelers
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        if (backEndPlayers[backEndProjectiles[id].playerId]) {
          backEndPlayers[backEndProjectiles[id].playerId].score += 1;
          backEndPlayers[playerId].hp -= 1;
          toDeleteProjectiles.push(id)
          if (backEndPlayers[playerId].hp <= 0) {
            delete backEndPlayers[playerId];
          }
          break
        }
      }
    }

    // Check collision met muren
    for (const wall of walls) {
      const projectileLeft = backEndProjectiles[id].x - PROJECTILE_RADIUS
      const projectileRight = backEndProjectiles[id].x + PROJECTILE_RADIUS
      const projectileTop = backEndProjectiles[id].y - PROJECTILE_RADIUS
      const projectileBottom = backEndProjectiles[id].y + PROJECTILE_RADIUS

      const wallLeft = wall.x
      const wallRight = wall.x + wall.width
      const wallTop = wall.y
      const wallBottom = wall.y + wall.height

      if (
        projectileRight > wallLeft &&
        projectileLeft < wallRight &&
        projectileBottom > wallTop &&
        projectileTop < wallBottom
      ) {
        toDeleteProjectiles.push(id)
        break
      }
    }
  }

  // Verwijder de projectiles
  toDeleteProjectiles.forEach(id => {
    delete backEndProjectiles[id]
  })

  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
}, 15)

server.listen(port, () => {
})

