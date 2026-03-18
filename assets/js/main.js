// mobile nav
const toggle = document.querySelector(".nav-toggle");
const navlinks = document.querySelector(".navlinks");

if (toggle && navlinks) {
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

// image fallback helper
function safeImg(imgEl, fallback) {
  imgEl.addEventListener("error", () => {
    imgEl.src = fallback;
  });
}

// shared renderer for people/committee/speakers cards
function renderCards(holder, list, fallback) {
  if (!holder) return;

  holder.innerHTML = (list || []).map(p => {
    const hasProfile = p.profile && p.profile !== "#";

    return `
      <a class="card soft person"
         href="${hasProfile ? p.profile : "#"}"
         ${hasProfile ? 'target="_blank" rel="noopener"' : ''}>

        <img src="assets/images/people/${p.image || ''}" alt="${p.name || ''}">

        <div>
          <h4>${p.name || ''}</h4>
          <p>
            ${p.role || ''}<br>
            <span class="small">${p.affiliation || ''}</span>
          </p>
        </div>
      </a>
    `;
  }).join("");

  holder.querySelectorAll("img").forEach(img => safeImg(img, fallback));
}

// helper to normalize old/new JSON keys
function getList(data, primaryKey, fallbackKey = null) {
  if (Array.isArray(data?.[primaryKey])) return data[primaryKey];
  if (fallbackKey && Array.isArray(data?.[fallbackKey])) return data[fallbackKey];
  return [];
}

async function loadPeopleAndConvenors() {
  // old page ids
  const peopleHolder = document.getElementById("peopleGrid");
  const convenorHolder = document.getElementById("convenersGrid");
  const advisoryHolder = document.getElementById("advisoryGrid");

  // new chairs.html ids
  const leadershipHolder = document.getElementById("leadershipGrid");
  const chairpersonsHolder = document.getElementById("chairpersonsGrid");
  const organizingSecretariesHolder = document.getElementById("organizingSecretariesGrid");
  const institutionalAdvisorsHolder = document.getElementById("institutionalAdvisorsGrid");
  const advisoryCommitteeHolder = document.getElementById("advisoryCommitteeGrid");

  // speakers page ids
  const plenaryHolder = document.getElementById("plenaryGrid");
  const speakersHolder = document.getElementById("speakersGrid");

  // if none of the target holders exist, do nothing
  if (
    !peopleHolder &&
    !convenorHolder &&
    !advisoryHolder &&
    !leadershipHolder &&
    !chairpersonsHolder &&
    !organizingSecretariesHolder &&
    !institutionalAdvisorsHolder &&
    !advisoryCommitteeHolder &&
    !plenaryHolder &&
    !speakersHolder
  ) {
    return;
  }

  try {
    const res = await fetch("data/people.json");
    if (!res.ok) throw new Error(`HTTP ${res.status} while loading data/people.json`);

    const data = await res.json();
    const fallback = "assets/images/people/_placeholder.jpg";

    // backward compatibility
    if (peopleHolder) {
      renderCards(
        peopleHolder,
        getList(data, "chairpersons", "people"),
        fallback
      );
    }

    if (convenorHolder) {
      renderCards(
        convenorHolder,
        getList(data, "conveners", "convenors"),
        fallback
      );
    }

    if (advisoryHolder) {
      renderCards(
        advisoryHolder,
        getList(data, "advisory_committee", "advisory"),
        fallback
      );
    }

    // new committee hierarchy
    if (leadershipHolder) {
      const leadership = getList(data, "leadership");
      const institutionalAdvisors = getList(data, "institutional_advisors");
      renderCards(
        leadershipHolder,
        [...leadership, ...institutionalAdvisors],
        fallback
      );
    }

    if (chairpersonsHolder) {
      renderCards(
        chairpersonsHolder,
        getList(data, "chairpersons", "people"),
        fallback
      );
    }

    if (organizingSecretariesHolder) {
      renderCards(
        organizingSecretariesHolder,
        getList(data, "organizing_secretaries"),
        fallback
      );
    }

    if (institutionalAdvisorsHolder) {
      renderCards(
        institutionalAdvisorsHolder,
        getList(data, "institutional_advisors"),
        fallback
      );
    }

    if (advisoryCommitteeHolder) {
      renderCards(
        advisoryCommitteeHolder,
        getList(data, "advisory_committee", "advisory"),
        fallback
      );
    }

    // speakers support
    if (plenaryHolder) {
      renderCards(
        plenaryHolder,
        getList(data, "plenary"),
        fallback
      );
    }

    if (speakersHolder) {
      renderCards(
        speakersHolder,
        getList(data, "speakers"),
        fallback
      );
    }

  } catch (e) {
    console.warn("People/Committee/Speakers data not loaded:", e);
  }
}

async function loadLogos() {
  const holder = document.getElementById("logoRow");
  if (!holder) return;

  try {
    const res = await fetch("data/logos.json");
    if (!res.ok) throw new Error(`HTTP ${res.status} while loading data/logos.json`);

    const data = await res.json();
    const fallback = "assets/images/logos/_logo-placeholder.svg";

    holder.innerHTML = (data.logos || []).map(l => `
      <a class="card soft"
         style="display:flex;align-items:center;justify-content:center;padding:14px;min-height:84px"
         href="${l.url || '#'}"
         ${l.url && l.url !== '#' ? 'target="_blank" rel="noopener"' : ''}
         aria-label="${l.name || 'Logo'}">
        <img src="assets/images/logos/${l.file || ''}"
             alt="${l.name || 'Logo'}"
             style="max-height:54px;max-width:100%;object-fit:contain">
      </a>
    `).join("");

    holder.querySelectorAll("img").forEach(img => safeImg(img, fallback));
  } catch (e) {
    console.warn("Logo data not loaded:", e);
  }
}

loadPeopleAndConvenors();
loadLogos();