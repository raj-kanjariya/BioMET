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



// homepage countdown + sprinkle/confetti celebration
function initHomepageCountdown() {
  const countdownWrap = document.getElementById("countdown-wrap");
  const countdown = document.getElementById("countdown");
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (
    !countdownWrap ||
    !countdown ||
    !daysEl ||
    !hoursEl ||
    !minutesEl ||
    !secondsEl
  ) {
    return;
  }

  const targetText = countdownWrap.dataset.countdownTarget;
  const targetTime = new Date(targetText).getTime();

  if (!targetText || Number.isNaN(targetTime)) {
    console.warn("Invalid countdown target:", targetText);
    return;
  }

  let timerId = null;
  let hasCompleted = false;

  function setCountdownValues(days, hours, minutes, seconds) {
    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  function hideCountdown(immediately = false) {
    if (immediately) {
      countdownWrap.hidden = true;
      return;
    }

    countdownWrap.classList.add("is-hiding");

    window.setTimeout(() => {
      countdownWrap.hidden = true;
    }, 800);
  }

  function readCelebrationFlag() {
    try {
      return sessionStorage.getItem("biomet-countdown-celebrated") === "true";
    } catch (error) {
      return false;
    }
  }

  function saveCelebrationFlag() {
    try {
      sessionStorage.setItem("biomet-countdown-celebrated", "true");
    } catch (error) {
      // sessionStorage can be blocked on some browsers or file:// previews.
    }
  }

  function launchSprinkles() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const layer = document.createElement("div");
    layer.className = "sprinkle-layer";
    layer.setAttribute("aria-hidden", "true");

    const colors = [
      "#ffd166",
      "#00b4d8",
      "#ef476f",
      "#ffffff",
      "#7ae582",
      "#b892ff"
    ];

    const pieceCount = window.innerWidth < 600 ? 80 : 150;

    for (let index = 0; index < pieceCount; index += 1) {
      const piece = document.createElement("span");
      const width = 5 + Math.random() * 7;
      const height = 10 + Math.random() * 12;
      const isRound = Math.random() > 0.72;

      piece.className = "sprinkle-piece";
      piece.style.setProperty("--start-x", `${Math.random() * 100}vw`);
      piece.style.setProperty("--piece-width", `${width}px`);
      piece.style.setProperty("--piece-height", `${isRound ? width : height}px`);
      piece.style.setProperty("--piece-radius", isRound ? "50%" : "999px");
      piece.style.setProperty(
        "--piece-color",
        colors[Math.floor(Math.random() * colors.length)]
      );
      piece.style.setProperty(
        "--drift-x",
        `${Math.round((Math.random() - 0.5) * 320)}px`
      );
      piece.style.setProperty(
        "--spin",
        `${Math.round(540 + Math.random() * 1080)}deg`
      );
      piece.style.setProperty(
        "--fall-duration",
        `${(2.4 + Math.random() * 1.8).toFixed(2)}s`
      );
      piece.style.setProperty(
        "--fall-delay",
        `${(Math.random() * 0.9).toFixed(2)}s`
      );

      layer.appendChild(piece);
    }

    document.body.appendChild(layer);

    window.setTimeout(() => {
      layer.remove();
    }, 5200);
  }

  function finishCountdown() {
    if (hasCompleted) return;
    hasCompleted = true;

    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }

    setCountdownValues(0, 0, 0, 0);
    countdown.setAttribute("aria-label", "The BioMET 2026 countdown has ended.");

    // On the first completed view in this browser tab/session, show sprinkles.
    // On later refreshes, keep the expired timer hidden without replaying them.
    if (readCelebrationFlag()) {
      hideCountdown(true);
      return;
    }

    saveCelebrationFlag();
    launchSprinkles();

    window.setTimeout(() => {
      hideCountdown(false);
    }, 4200);
  }

  function updateCountdown() {
    const difference = targetTime - Date.now();

    if (difference <= 0) {
      finishCountdown();
      return;
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference / 3600000) % 24);
    const minutes = Math.floor((difference / 60000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    setCountdownValues(days, hours, minutes, seconds);
    countdown.setAttribute(
      "aria-label",
      `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining.`
    );
  }

  updateCountdown();

  if (!hasCompleted) {
    timerId = window.setInterval(updateCountdown, 1000);
  }
}


loadPeopleAndConvenors();
loadLogos();
initHomepageCountdown();