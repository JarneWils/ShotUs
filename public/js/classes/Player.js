class Player {
  constructor({ x, y, radius, color, username, image,}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.hp = 3  // Begin met 3 hartjes voor elke speler
    this.image = image

    // Laad de hartjes-afbeelding
    this.heartImage = new Image();
    this.heartImage.src = 'img/Hartje.png';  // Pad naar je hartjes PNG-bestand
  }

  draw() {
    c.font = '600 16px sans-serif';
    c.fillStyle = 'rgb(100, 120, 120)';

    // Bereken de breedte van de username tekst
    const textWidth = c.measureText(this.username).width;

    // Centreer de tekst door de helft van de breedte af te trekken
    c.fillText(this.username, this.x - textWidth / 2, this.y + this.radius + 18);

     // Bereken de totale breedte van de hartjes
     const heartWidth = 15;
     const totalHeartsWidth = this.hp * heartWidth;
     const startX = this.x - totalHeartsWidth / 2;
 
     // Teken de hartjes boven de speler
     for (let i = 0; i < this.hp; i++) {
       const heartX = startX + i * heartWidth;
       c.drawImage(this.heartImage, heartX, this.y - this.radius - 18, heartWidth, heartWidth);
     }

     c.save();

     if (this.image) {
       // Teken de afbeelding van de speler (avatar)
       c.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
     } else {
       // Teken een eenvoudige cirkel als de afbeelding niet is geladen
       c.beginPath();
       c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
       c.fillStyle = this.color;
       c.fill();
     }
 
     c.restore();
  }
}
