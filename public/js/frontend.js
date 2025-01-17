const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1450 * devicePixelRatio
canvas.height = 650 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
const frontEndProjectiles = {}

const SHOTS_COUNT = 10;

const AMOSIZE = 10;


socket.on('updateProjectiles', (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      })
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (id === socket.id) {
      const player = backEndPlayers[socket.id];
      const bulletsContainer = document.querySelector("#bulletsContainer");

      // Zorg ervoor dat het aantal bullets overeenkomt met het aantal schoten van de speler
      const bullets = bulletsContainer.querySelectorAll(".bullet");

      // Toon of verberg bullets afhankelijk van het aantal schoten
      for (let i = 0; i < 10; i++) {
        if (i < player.shots) {
          bullets[i].style.display = "inline-block"; // Bullet zichtbaar maken
        } else {
          bullets[i].style.opacity = 0; // Bullet verbergen
        }
      }

      if (player.shots === 10) {
        bullets.forEach(bullet => {
            bullet.style.opacity = 1; // Bullet volledig zichtbaar maken
        });
    }
    }

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 15,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
      })

      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backEndPlayer.score)

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      // update de hp van de speler
      frontEndPlayers[id].hp = backEndPlayer.hp;

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      // removes old elements
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // adds sorted elements
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontEndPlayers[id]
    }
  }
})


let walls = []
// Ontvang de muren van de server en maak nieuwe wall objecten aan
socket.on('updateWalls', (newWalls) => {
  walls = newWalls.map(wall => new Walls({
    x: wall.x,
    y: wall.y,
    width: wall.width,
    height: wall.height
  }));
});


let amo = []
// Ontvang de amo van de server en maak nieuwe wall objecten aan
socket.on('updateAmo', (newAmo) => {
  amo = newAmo.map(amo => new Amo({
    x: amo.x,
    y: amo.y,
    width: amo.width,
    height: amo.height,
    radius: AMOSIZE
  }));
});

let heal = []
// Ontvang de amo van de server en maak nieuwe wall objecten aan
socket.on('updateHeal', (newHeal) => {
  heal = newHeal.map(heal => new Heal({
    x: heal.x,
    y: heal.y,
    width: heal.width,
    height: heal.height,
    radius: 10
  }));
});



let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  walls.forEach(wall => wall.draw(c))
  amo.forEach(amo => amo.draw(c))
  heal.forEach(heal => heal.draw(c))

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    if (frontEndPlayer.x - frontEndPlayer.radius < 0)
      frontEndPlayer.x = frontEndPlayer.radius;
    
    if (frontEndPlayer.x + frontEndPlayer.radius > canvas.width / devicePixelRatio)
      frontEndPlayer.x = canvas.width / devicePixelRatio - frontEndPlayer.radius;
    
    if (frontEndPlayer.y - frontEndPlayer.radius < 0)
      frontEndPlayer.y = frontEndPlayer.radius;
    
    if (frontEndPlayer.y + frontEndPlayer.radius > canvas.height / devicePixelRatio)
      frontEndPlayer.y = canvas.height / devicePixelRatio - frontEndPlayer.radius;
    
    frontEndPlayer.draw()
  }

  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }
}

animate()

const keys = {
  ArrowUp: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  },
  ArrowDown: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  }
}

const SPEED = 5
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {


  if (keys.ArrowUp.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    // frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'ArrowUp', sequenceNumber })
  }

  if (keys.ArrowLeft.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'ArrowLeft', sequenceNumber })
  }

  if (keys.ArrowDown.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    // frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'ArrowDown', sequenceNumber })
  }

  if (keys.ArrowRight.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'ArrowRight', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'ArrowUp':
      keys.ArrowUp.pressed = true
      break

    case 'ArrowLeft':
      keys.ArrowLeft.pressed = true
      break

    case 'ArrowDown':
      keys.ArrowDown.pressed = true
      break

    case 'ArrowRight':
      keys.ArrowRight.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'ArrowUp':
      keys.ArrowUp.pressed = false
      break

    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break

    case 'ArrowDown':
      keys.ArrowDown.pressed = false
      break

    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
  }
})

document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault();

  document.querySelector('#usernameForm').style.display = 'none';
  gameStarted = true; // Het spel is nu gestart

  socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector('#usernameInput').value
  });
  
  console.log('Sending to backend:', {
    width: canvas.width,
    height: canvas.height
  });
});

