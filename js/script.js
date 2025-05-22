// Script de base – prêt pour ajouter des interactions
document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio minimaliste chargé.");
});


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("background-symbols");
  const numSymbols = 30;

  for (let i = 0; i < numSymbols; i++) {
    const symbol = document.createElement("div");
    symbol.className = "symbol";
    symbol.style.top = `${Math.random() * 100}%`;
    symbol.style.left = `${Math.random() * 100}%`;
    symbol.style.animationDelay = `${Math.random() * 6}s`;
    symbol.style.transform = `scale(${0.5 + Math.random()})`;
    container.appendChild(symbol);
  }
});