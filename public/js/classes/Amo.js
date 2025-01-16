class Amo {
    constructor({ x, y, width, height }) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  
    draw(c) {  // Voeg context als parameter toe
      c.fillStyle = 'red';  // Kleur van de lijn (kan aangepast worden)
      c.fillRect(this.x, this.y, this.width, this.height);  // Teken de rechthoek
    }
  }
  