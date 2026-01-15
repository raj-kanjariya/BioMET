// mobile nav
const toggle = document.querySelector(".nav-toggle");
const navlinks = document.querySelector(".navlinks");
if (toggle && navlinks){
  toggle.addEventListener("click", () => {
    navlinks.classList.toggle("show");
  });
}

// back to top
const topBtn = document.getElementById("topBtn");
window.addEventListener("scroll", () => {
  if (!topBtn) return;
  if (window.scrollY > 600) topBtn.classList.add("show");
  else topBtn.classList.remove("show");
});

// accordion
document.querySelectorAll(".acc-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".acc-item");
    const acc = item?.closest(".acc");
    if (!item) return;
    // close siblings
    acc?.querySelectorAll(".acc-item").forEach(i => {
      if (i !== item) i.classList.remove("open");
    });
    item.classList.toggle("open");
  });
});

// People & logos auto-loading (fallback if missing)
function safeImg(imgEl, fallback){
  imgEl.addEventListener("error", () => { imgEl.src = fallback; });
}

async function loadPeople(){
  const holder = document.getElementById("peopleGrid");
  if (!holder) return;
  try{
    const res = await fetch("data/people.json");
    const data = await res.json();
    const fallback = "assets/images/people/_placeholder.jpg";
    holder.innerHTML = data.people.map(p => `
      <div class="card soft person">
        <img src="assets/images/people/${p.image}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <p>${p.role}<br><span class="small">${p.affiliation}</span></p>
        </div>
      </div>
    `).join("");
    holder.querySelectorAll("img").forEach(img => safeImg(img, fallback));
  }catch(e){
    console.warn("People data not loaded:", e);
  }
}

async function loadLogos(){
  const holder = document.getElementById("logoRow");
  if (!holder) return;
  try{
    const res = await fetch("data/logos.json");
    const data = await res.json();
    const fallback = "assets/images/logos/_logo-placeholder.svg";
    holder.innerHTML = data.logos.map(l => `
      <a class="card soft" style="display:flex;align-items:center;justify-content:center;padding:14px;min-height:84px" href="${l.url||'#'}" aria-label="${l.name}">
        <img src="assets/images/logos/${l.file}" alt="${l.name}" style="max-height:54px;max-width:100%;object-fit:contain">
      </a>
    `).join("");
    holder.querySelectorAll("img").forEach(img => safeImg(img, fallback));
  }catch(e){
    console.warn("Logo data not loaded:", e);
  }
}

loadPeople();
loadLogos();