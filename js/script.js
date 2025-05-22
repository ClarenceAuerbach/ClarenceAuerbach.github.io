document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("background-symbols");
  const count = 50;
  
  for (let i = 0; i < count; i++) {
    const symbol = document.createElement("div");
    symbol.className = "symbol";
    symbol.textContent = "C"; 

    symbol.style.left = `${Math.random() * 100}%`;
    symbol.style.top = `${Math.random() * 100}%`;
    
    symbol.style.animationDelay = `${Math.random() * 3}s`;
    symbol.style.animationDuration = `${3 + Math.random() * 2}s`;
    
    container.appendChild(symbol);
  }
});