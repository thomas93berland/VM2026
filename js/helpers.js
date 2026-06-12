export function formatNumber(value){
  return Number(value || 0).toLocaleString("nb-NO");
}

export function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function formatTime(value){
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("nb-NO", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.hidden = true, 2400);
}
