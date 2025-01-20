class Walls {
  constructor({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.radius = 25; // Hoekradius voor afgeronde hoeken
  }

  draw(c) {
    c.fillStyle = '#000000';  // Zwarte kleur voor de rechthoek
    c.strokeStyle = '#475569'; // Grijze outline
    c.lineWidth = 5;          // Breedte van de outline

    // Begin een nieuw pad voor de rechthoek met afgeronde hoeken
    c.beginPath();
    c.moveTo(this.x + this.radius, this.y); // Begin aan de bovenkant met afgeronde hoeken
    c.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, this.radius); // Boven rechterhoek
    c.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, this.radius); // Onder rechterhoek
    c.arcTo(this.x, this.y + this.height, this.x, this.y, this.radius); // Onder linkerhoek
    c.arcTo(this.x, this.y, this.x + this.width, this.y, this.radius); // Boven linkerhoek
    c.closePath();

    // Teken de rechthoek met gevulde zwarte kleur
    c.fill();

    // Teken de outline
    c.stroke();
  }
}
