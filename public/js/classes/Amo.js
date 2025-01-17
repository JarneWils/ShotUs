class Amo {
  constructor({ x, y, radius }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(c) {  // Voeg context als parameter toe
    c.fillStyle = 'red';  // Kleur van de cirkel
    c.beginPath();  // Begin een nieuw pad voor de cirkel
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);  // Teken de cirkel
    c.fill();  // Vul de cirkel met kleur
  }
}
