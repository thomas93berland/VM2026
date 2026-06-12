import { escapeHtml, toast } from "./helpers.js";

export function renderForum(state){
  const wrap = document.getElementById("posts");

  wrap.innerHTML = state.forum.map(post => `
    <article class="post-card search-item">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.text)}</p>
      <footer>
        <span>Av ${escapeHtml(post.author)}</span>
        <span>♡ ${post.likes || 0}</span>
      </footer>
    </article>
  `).join("");
}

export function addPost(state, event){
  event.preventDefault();

  const title = document.getElementById("postTitle").value.trim();
  const text = document.getElementById("postText").value.trim();

  if(!title || !text) return;

  state.forum.unshift({
    title,
    text,
    author: state.user.name,
    likes: 0
  });

  state.activity.unshift({
    icon: "chat",
    text: "Du publiserte et foruminnlegg",
    time: "nå"
  });

  event.target.reset();
  toast("Innlegg publisert.");
}
