import { escapeHtml } from "./helpers.js";

let currentRoom = "public";

export function renderChat(state){
  const title = document.getElementById("roomTitle");
  const messages = document.getElementById("messages");

  title.textContent = currentRoom === "public" ? "Offentlig chat" : `Privat chat med ${currentRoom}`;

  messages.innerHTML = (state.chat[currentRoom] || []).map(msg => `
    <div class="message ${msg.from === state.user.name ? "me" : ""}">
      <small>${escapeHtml(msg.from)}</small>
      ${escapeHtml(msg.text)}
    </div>
  `).join("");

  messages.scrollTop = messages.scrollHeight;
}

export function changeRoom(room){
  currentRoom = room;
}

export function sendChat(state, event){
  event.preventDefault();

  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;

  state.chat[currentRoom] ??= [];
  state.chat[currentRoom].push({
    from: state.user.name,
    text
  });

  input.value = "";
}
