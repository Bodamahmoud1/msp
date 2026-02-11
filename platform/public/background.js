let mouseX = 0.5;
let mouseY = 0.5;
let currentX = 0.5;
let currentY = 0.5;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

function animate() {
  // Linear interpolation (lerp) for smooth movement
  // Adjust 0.1 to change smoothness (lower = smoother/slower)
  currentX += (mouseX - currentX);
  currentY += (mouseY - currentY);

  document.body.style.setProperty('--mouse-x', currentX);
  document.body.style.setProperty('--mouse-y', currentY);

  requestAnimationFrame(animate);
}

animate();
