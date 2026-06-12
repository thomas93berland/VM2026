export function bindSearch(){
  const input = document.getElementById("searchInput");

  input.addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();

    document.querySelectorAll(".search-item").forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
}
