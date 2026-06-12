export function setPage(page){
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.getElementById(`page-${page}`)?.classList.add("active");

  document.querySelectorAll("[data-page]").forEach(btn => {
    const active = btn.dataset.page === page;
    btn.classList.toggle("active", active);
    if(active) btn.setAttribute("aria-current","page");
    else btn.removeAttribute("aria-current");
  });

  document.body.classList.remove("menu-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function bindRouter(){
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.go));
  });
}
