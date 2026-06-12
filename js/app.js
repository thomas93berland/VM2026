import { loadState, saveState } from "./store.js";
import { bindRouter } from "./router.js";
import { bindText } from "./stateBindings.js";
import { injectIcons } from "./icons.js";
import { bindSearch } from "./search.js";

import { renderHome } from "./home.js";
import { renderBetting, updateSlipNumbers, placeBet, addMatch } from "./betting.js";
import { renderForum, addPost } from "./forum.js";
import { renderChat, changeRoom, sendChat } from "./chat.js";
import { renderProfile, editName } from "./profile.js";
import { renderChess } from "./chess.js";

let state = loadState();

function persist(){
  saveState(state);
}

function renderAll(){
  injectIcons();
  bindText(state);
  renderHome(state);
  renderBetting(state, persist, renderAll);
  renderForum(state);
  renderChat(state);
  renderProfile(state);
  renderChess();
}

function bindEvents(){
  bindRouter();
  bindSearch();

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("stakeInput").addEventListener("input", () => updateSlipNumbers(state));

  document.getElementById("placeBetBtn").addEventListener("click", () => {
    if(placeBet(state)){
      persist();
      renderAll();
    }
  });

  document.getElementById("clearSlipBtn").addEventListener("click", () => {
    state.selected = [];
    persist();
    renderAll();
  });

  document.getElementById("matchForm").addEventListener("submit", event => {
    addMatch(state, event);
    persist();
    renderAll();
  });

  document.getElementById("postForm").addEventListener("submit", event => {
    addPost(state, event);
    persist();
    renderAll();
  });

  document.getElementById("chatForm").addEventListener("submit", event => {
    sendChat(state, event);
    persist();
    renderChat(state);
  });

  document.querySelectorAll(".room").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".room").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      changeRoom(btn.dataset.room);
      renderChat(state);
    });
  });

  document.getElementById("editNameBtn").addEventListener("click", () => {
    if(editName(state)){
      persist();
      renderAll();
    }
  });
}

bindEvents();
renderAll();
