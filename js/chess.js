export function renderChess(){
  const pieces = [
    "♜","♞","♝","♛","♚","♝","♞","♜",
    "♟","♟","♟","♟","♟","♟","♟","♟",
    "","","","","","","","",
    "","","","♙","","","","",
    "","","","","♙","","","",
    "","","♘","","","♘","","",
    "♙","♙","♙","","","♙","♙","♙",
    "♖","","♗","♕","♔","♗","","♖"
  ];

  document.getElementById("miniBoard").innerHTML = pieces.map((piece, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return `<div class="${(row + col) % 2 ? "dark" : "light"}">${piece}</div>`;
  }).join("");
}
