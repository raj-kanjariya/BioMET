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

  if (window.scrollY > 600) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
});

// accordion
document.querySelectorAll(".acc-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".acc-item");
    const acc = item?.closest(".acc");

    if (!item) return;

    // close sibling accordion items
    acc?.querySelectorAll(".acc-item").forEach(i => {
      if (i !== item) {
        i.classList.remove("open");
      }
    });

    item.classList.toggle("open");
  });
});

// image fallback helper
function safeImg(imgEl, fallback) {
  imgEl.addEventListener("error", () => {
    // Prevent an endless error loop if the fallback image is also missing
    if (imgEl.dataset.fallbackApplied === "true") return;

    imgEl.dataset.fallbackApplied = "true";
    imgEl.src = fallback;
  });
}

// shared renderer for people, committee, and speaker cards
function renderCards(holder, list, fallback) {
  if (!holder) return;

  holder.innerHTML = (list || []).map(person => {
    const hasProfile = person.profile && person.profile !== "#";
    const imageSource = person.image
      ? `assets/images/people/${person.image}`
      : fallback;

    return `
      <a class="card soft person"
         href="${hasProfile ? person.profile : "#"}"
         ${hasProfile ? 'target="_blank" rel="noopener"' : ""}
         ${hasProfile ? "" : 'aria-disabled="true" onclick="return false;"'}>

        <img
          src="${imageSource}"
          alt="${person.name || ""}"
        >

        <div>
          <h4>${person.name || ""}</h4>
          <p>
            ${person.role || ""}<br>
            <span class="small">${person.affiliation || ""}</span>
          </p>
        </div>
      </a>
    `;
  }).join("");

  holder.querySelectorAll("img").forEach(img => {
    safeImg(img, fallback);
  });
}

// helper to normalize old and new JSON keys
function getList(data, primaryKey, fallbackKey = null) {
  if (Array.isArray(data?.[primaryKey])) {
    return data[primaryKey];
  }

  if (fallbackKey && Array.isArray(data?.[fallbackKey])) {
    return data[fallbackKey];
  }

  return [];
}

async function loadPeopleAndConvenors() {
  // older page IDs
  const peopleHolder = document.getElementById("peopleGrid");
  const convenorHolder = document.getElementById("convenersGrid");
  const advisoryHolder = document.getElementById("advisoryGrid");

  // chairs.html IDs
  const leadershipHolder = document.getElementById("leadershipGrid");
  const chairpersonsHolder = document.getElementById("chairpersonsGrid");
  const organizingSecretariesHolder =
    document.getElementById("organizingSecretariesGrid");

  const organizingCommitteeMembersHolder =
    document.getElementById("organizingCommitteeMembersGrid");

  const institutionalAdvisorsHolder =
    document.getElementById("institutionalAdvisorsGrid");

  const advisoryCommitteeHolder =
    document.getElementById("advisoryCommitteeGrid");

  // speaker page IDs
  const plenaryHolder = document.getElementById("plenaryGrid");
  const speakersHolder = document.getElementById("speakersGrid");

  // if none of the target elements exist, stop
  if (
    !peopleHolder &&
    !convenorHolder &&
    !advisoryHolder &&
    !leadershipHolder &&
    !chairpersonsHolder &&
    !organizingSecretariesHolder &&
    !organizingCommitteeMembersHolder &&
    !institutionalAdvisorsHolder &&
    !advisoryCommitteeHolder &&
    !plenaryHolder &&
    !speakersHolder
  ) {
    return;
  }

  try {
    const response = await fetch("data/people.json");

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} while loading data/people.json`
      );
    }

    const data = await response.json();
    const fallback = "assets/images/people/_placeholder.jpg";

    // backward compatibility for older pages
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

    // leadership and institutional advisors
    if (leadershipHolder) {
      const leadership = getList(data, "leadership");
      const institutionalAdvisors =
        getList(data, "institutional_advisors");

      renderCards(
        leadershipHolder,
        [...leadership, ...institutionalAdvisors],
        fallback
      );
    }

    // chairpersons
    if (chairpersonsHolder) {
      renderCards(
        chairpersonsHolder,
        getList(data, "chairpersons", "people"),
        fallback
      );
    }

    // organizing secretaries
    if (organizingSecretariesHolder) {
      renderCards(
        organizingSecretariesHolder,
        getList(data, "organizing_secretaries"),
        fallback
      );
    }

    // organizing committee members
    if (organizingCommitteeMembersHolder) {
      renderCards(
        organizingCommitteeMembersHolder,
        getList(data, "organizing_committee_members"),
        fallback
      );
    }

    // institutional advisors
    if (institutionalAdvisorsHolder) {
      renderCards(
        institutionalAdvisorsHolder,
        getList(data, "institutional_advisors"),
        fallback
      );
    }

    // advisory committee
    if (advisoryCommitteeHolder) {
      renderCards(
        advisoryCommitteeHolder,
        getList(data, "advisory_committee", "advisory"),
        fallback
      );
    }

    // plenary speakers
    if (plenaryHolder) {
      renderCards(
        plenaryHolder,
        getList(data, "plenary"),
        fallback
      );
    }

    // invited speakers
    if (speakersHolder) {
      renderCards(
        speakersHolder,
        getList(data, "speakers"),
        fallback
      );
    }

  } catch (error) {
    console.warn(
      "People/Committee/Speakers data not loaded:",
      error
    );
  }
}

async function loadLogos() {
  const holder = document.getElementById("logoRow");

  if (!holder) return;

  try {
    const response = await fetch("data/logos.json");

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} while loading data/logos.json`
      );
    }

    const data = await response.json();
    const fallback =
      "assets/images/logos/_logo-placeholder.svg";

    holder.innerHTML = (data.logos || []).map(logo => {
      const hasUrl = logo.url && logo.url !== "#";

      return `
        <a class="card soft"
           style="display:flex;align-items:center;justify-content:center;padding:14px;min-height:84px"
           href="${hasUrl ? logo.url : "#"}"
           ${hasUrl ? 'target="_blank" rel="noopener"' : ""}
           ${hasUrl ? "" : 'aria-disabled="true" onclick="return false;"'}
           aria-label="${logo.name || "Logo"}">

          <img
            src="assets/images/logos/${logo.file || ""}"
            alt="${logo.name || "Logo"}"
            style="max-height:54px;max-width:100%;object-fit:contain"
          >
        </a>
      `;
    }).join("");

    holder.querySelectorAll("img").forEach(img => {
      safeImg(img, fallback);
    });

  } catch (error) {
    console.warn(
      "Logo data not loaded:",
      error
    );
  }
}

loadPeopleAndConvenors();
loadLogos();