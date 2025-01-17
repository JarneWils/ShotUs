class Amo {
  constructor({ x, y, radius }) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    // Maak een afbeelding van de SVG
    this.image = new Image();
    const svg = `
      <svg fill="#ffa200" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
          <g> 
            <g> 
              <polygon points="297.236,327.676 184.324,214.763 35.455,363.632 21.849,350.027 0,371.876 13.605,385.481 126.518,498.395 126.519,498.395 140.124,512 161.973,490.151 148.368,476.545 "></polygon> 
            </g> 
          </g> 
          <g> 
            <g> 
              <path d="M479.49,12.536c-3.024,1.166-70.873,27.806-141.442,93.595l67.821,67.821c65.787-70.565,92.429-138.417,93.595-141.441 L512,0L479.49,12.536z"></path> 
            </g> 
          </g> 
          <g> 
            <g> 
              <polygon points="306.914,118.696 261.546,164.064 206.494,193.234 318.765,305.505 347.935,250.455 393.303,205.086 "></polygon> 
            </g> 
          </g> 
        </g>
      </svg>`;
    this.image.src = `data:image/svg+xml;base64,${btoa(svg)}`; // Converteer SVG naar Base64
  }

  draw(c) {
    // Controleer of de afbeelding geladen is
    if (this.image.complete) {
      const size = this.radius * 2; // Diameter van de cirkel wordt gebruikt voor breedte en hoogte
      c.drawImage(this.image, this.x - this.radius, this.y - this.radius, size, size);
    } else {
      // Fallback: een rode cirkel tekenen totdat de SVG is geladen
      c.fillStyle = '#ffa200';
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      c.fill();
    }
  }
}
