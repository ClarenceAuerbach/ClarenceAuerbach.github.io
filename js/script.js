document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("background-symbols");
  const numSymbols = 50; // Increased number for better effect
  
  // Clear any existing symbols
  container.innerHTML = '';
  
  // Get viewport dimensions
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  for (let i = 0; i < numSymbols; i++) {
    const symbol = document.createElement("div");
    symbol.className = "symbol";
    
    // Random position
    const top = Math.random() * vh;
    const left = Math.random() * vw;
    
    // Random size between 10px and 40px
    const size = 10 + Math.random() * 30;
    
    // Random animation duration between 3s and 8s
    const duration = 3 + Math.random() * 5;
    
    // Random delay
    const delay = Math.random() * 5;
    
    symbol.style.top = `${top}px`;
    symbol.style.left = `${left}px`;
    symbol.style.width = `${size}px`;
    symbol.style.height = `${size}px`;
    symbol.style.animationDuration = `${duration}s`;
    symbol.style.animationDelay = `${delay}s`;
    
    container.appendChild(symbol);
  }
});