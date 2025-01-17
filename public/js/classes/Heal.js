class Heal {
    constructor({ x, y, radius }) {
      this.x = x;
      this.y = y;
      this.radius = radius;
    }
  
    draw(c) {
      // Teken een rode cirkel
      c.fillStyle = 'red';
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      c.fill();
    }
  }
  