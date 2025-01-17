class Heal {
    constructor({ x, y, radius }) {
      this.x = x;
      this.y = y;
      this.radius = radius;
  
      // Laad de afbeelding
      this.image = new Image();
      this.image.src = 'img/Hartje.png'; // Vervang dit met het pad naar je PNG-afbeelding
    }
  
    draw(c) {
      // Controleer of de afbeelding geladen is
      if (this.image.complete) {
        const size = this.radius * 2; // Diameter van de cirkel wordt gebruikt voor breedte en hoogte
        c.drawImage(this.image, this.x - this.radius, this.y - this.radius, size, size);
      } else {
        // Fallback, bijvoorbeeld een rode cirkel tekenen totdat de afbeelding is geladen
        c.fillStyle = 'red';
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
      }
    }
  }
  