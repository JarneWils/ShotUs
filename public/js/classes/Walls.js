class Walls {
  constructor({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    //this.radius = 25;
  }

  draw(c) {
    c.fillStyle = '#475569';

    // Begin een nieuw pad voor de rechthoek met afgeronde hoeken
    c.beginPath();
    c.fillRect(this.x, this.y, this.width, this.height, );
    c.closePath();

    // Teken de rechthoek met gevulde zwarte kleur
    c.fill();

    // Teken de outline
    c.stroke();
  }
}
