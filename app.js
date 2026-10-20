// ========================================================
// 1. LECTEUR VIDÉO UNIVERSEL
// ========================================================
function buildVideoIframe(source) {
  if (!source) return "";

  const str = String(source).trim();
  const isNumericVimeo = /^\d+$/.test(str);
  const isVimeoUrl = str.includes("vimeo.com");

  if (isNumericVimeo || isVimeoUrl || str.includes("player.vimeo.com")) {
    let videoId = str;
    let privacyHash = "";

    if (isVimeoUrl) {
      const cleanUrl = str
        .split("?")[0]
        .replace("https://", "")
        .replace("http://", "");
      const segments = cleanUrl.split("/").filter(Boolean);
      const vIndex = segments.findIndex((s) => s.includes("vimeo.com"));
      if (vIndex !== -1 && segments[vIndex + 1]) {
        videoId = segments[vIndex + 1];
        if (segments[vIndex + 2]) privacyHash = `?h=${segments[vIndex + 2]}`;
      }
    } else if (str.includes("?h=")) {
      const parts = str.split("?h=");
      videoId = parts[0];
      privacyHash = `?h=${parts[1]}`;
    }

    const sep = privacyHash ? "&" : "?";
    return `
      <iframe
        src="https://player.vimeo.com/video/${videoId}${privacyHash}${sep}autoplay=1&muted=1&loop=1&autopause=0&playsinline=1"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        playsinline
        webkit-playsinline>
      </iframe>
    `;
  }

  // Branche YouTube (modale Drone) : mute=1 + playsinline obligatoires pour iOS
  return `
    <iframe
      src="https://www.youtube.com/embed/${str}?autoplay=1&mute=1&controls=1&loop=1&playlist=${str}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      playsinline
      webkit-playsinline>
    </iframe>
  `;
}

// ========================================================
// 2. CARROUSEL & SÉLECTEUR DE PROFILS
// ========================================================
function scrollCarousel(id, direction) {
  const track = document.getElementById(id);
  if (!track) return;
  const scrollAmount = track.clientWidth * 0.75 * direction;
  track.scrollBy({ left: scrollAmount, behavior: "smooth" });
}

function selectProfile(type, event) {
  // Mémorise que le profil a été sélectionné pour cette visite
  sessionStorage.setItem("aindev_profile_entered", "true");

  const profileGate = document.getElementById("profile-gate");
  const loaderGate = document.getElementById("nf-loader-gate");
  const loaderAvatarTarget = document.getElementById("loader-avatar-target");
  const headerAvatarContainer = document.getElementById("current-user-avatar");

  // 1. Récupération de l'avatar cliqué (ou visiteur caché par défaut)
  let profileBox = event ? event.currentTarget : null;
  if (!profileBox && type === "visiteur") {
    profileBox = document.querySelector(".hidden-visitor-avatar");
  }

  let defaultAvatarHTML =
    '<img src="images/guillaume-portrait.webp" alt="Guillaume Gemelas" style="width:100%; height:100%; object-fit:cover;">';

  if (profileBox) {
    const avatarWrap = profileBox.querySelector(".profile-avatar-wrap");
    if (avatarWrap) {
      defaultAvatarHTML = avatarWrap.innerHTML;
    }
  }

  // 2. Application de l'avatar
  if (loaderAvatarTarget) {
    loaderAvatarTarget.innerHTML = defaultAvatarHTML;
  }

  const formAvatarContainer = document.getElementById("form-user-avatar");
  if (formAvatarContainer) {
    formAvatarContainer.innerHTML = defaultAvatarHTML;
  }

  const drawerAvatarContainer = document.getElementById("drawer-user-avatar");
  if (drawerAvatarContainer) {
    drawerAvatarContainer.innerHTML = defaultAvatarHTML;
  }

  if (headerAvatarContainer && profileBox) {
    const avatarWrap = profileBox.querySelector(".profile-avatar-wrap");
    if (avatarWrap) {
      const svgElement = avatarWrap.querySelector("svg");
      const imgElement = avatarWrap.querySelector("img");

      if (svgElement) {
        const clonedSvg = svgElement.cloneNode(true);
        clonedSvg.setAttribute("width", "32");
        clonedSvg.setAttribute("height", "32");
        clonedSvg.style.borderRadius = "4px";
        clonedSvg.id = "current-user-avatar";
        headerAvatarContainer.replaceWith(clonedSvg);
      } else if (imgElement) {
        let imgTag = headerAvatarContainer;
        if (headerAvatarContainer.tagName !== "IMG") {
          const newImg = document.createElement("img");
          newImg.id = "current-user-avatar";
          headerAvatarContainer.replaceWith(newImg);
          imgTag = newImg;
        }
        imgTag.src = imgElement.src;
        imgTag.alt = imgElement.alt;
      }
    }
  }

  // 3. Activation du loader
  if (loaderGate) loaderGate.classList.add("active");
  if (profileGate) profileGate.classList.add("hidden");

  // 4. Vidéo d'arrière-plan
  const videoFrame = document.getElementById("billboard-video-frame");
  if (videoFrame && !videoFrame.src && videoFrame.dataset.src) {
    videoFrame.src = videoFrame.dataset.src;
    setTimeout(() => {
      videoFrame.classList.add("is-loaded");
    }, 5000);
  }

  // 5. Fin du loader et navigation
  setTimeout(() => {
    if (loaderGate) loaderGate.classList.remove("active");

    if (type === "guillaume") {
      openModalDetails("about");
    } else if (type === "web") {
      smoothScrollToTarget("row-web");
    } else if (type === "prestations") {
      smoothScrollToTarget("row-prestations");
    } else if (type === "drone") {
      smoothScrollToTarget("row-drone");
    } else if (type === "contact") {
      smoothScrollToTarget("contact-section");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 1500);
}

function switchProfileGate() {
  const profileGate = document.getElementById("profile-gate");
  if (profileGate) profileGate.classList.remove("hidden");
}

window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  if (window.scrollY > 40) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});

// Sécurité au chargement
window.addEventListener("DOMContentLoaded", () => {
  const defaultAvatarHTML =
    '<img src="images/guillaume-portrait.webp" alt="Guillaume Gemelas">';

  const formAvatarContainer = document.getElementById("form-user-avatar");
  if (formAvatarContainer && !formAvatarContainer.innerHTML.trim()) {
    formAvatarContainer.innerHTML = defaultAvatarHTML;
  }

  const drawerAvatarContainer = document.getElementById("drawer-user-avatar");
  if (drawerAvatarContainer && !drawerAvatarContainer.innerHTML.trim()) {
    drawerAvatarContainer.innerHTML = defaultAvatarHTML;
  }
});

// ========================================================
// 3. GESTION DES MODALES
// ========================================================
const modalBackdrop = document.getElementById("nf-modal");
const modalImg = document.getElementById("modal-img");
const modalVideoWrapper = document.getElementById("modal-video-wrapper");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalClient = document.getElementById("modal-client");
const modalCat = document.getElementById("modal-cat");
const modalTech = document.getElementById("modal-tech");
const modalLinkBtn = document.getElementById("modal-link-btn");
const episodesBlock = document.getElementById("modal-episodes-block");
const modalCover = document.getElementById("modal-cover");

let videoTimer = null;

function stopModalVideo() {
  if (videoTimer) clearTimeout(videoTimer);
  if (modalVideoWrapper) {
    modalVideoWrapper.classList.remove("is-playing");
    modalVideoWrapper.innerHTML = "";
  }
  if (modalCover) modalCover.classList.remove("has-video-playing");
}

function resetModalState() {
  stopModalVideo();
  if (modalImg) modalImg.onerror = null;
  if (modalCover) {
    modalCover.classList.remove("is-project-cover");
    modalCover.classList.remove("has-video-playing");
  }

  const sideMeta = document.querySelector(".modal-side-meta");
  if (sideMeta) sideMeta.style.display = "block";

  const brandBadge = document.getElementById("modal-brand-badge");
  if (brandBadge) brandBadge.style.display = "none";

  const socialsRow = document.getElementById("modal-socials-row");
  if (socialsRow) socialsRow.style.display = "none";

  if (episodesBlock) episodesBlock.style.display = "none";
  if (modalLinkBtn) modalLinkBtn.style.display = "none";
}

function openProjectModalFromDOM(element) {
  resetModalState();

  const title = element.querySelector("h4").innerText;
  const cover = element.getAttribute("data-cover");
  const video = element.getAttribute("data-video");
  const client = element.getAttribute("data-client");
  const cat = element.getAttribute("data-cat");
  const tech = element.getAttribute("data-tech");
  const link = element.getAttribute("data-link");
  const descElement = element.querySelector(".project-desc-source");
  const thumbSrc = element.querySelector("img").src;

  const brandBadge = document.getElementById("modal-brand-badge");
  const brandLogo = document.getElementById("modal-brand-logo");
  if (brandBadge && brandLogo) {
    brandLogo.src = thumbSrc;
    brandBadge.style.display = "flex";
  }

  modalImg.src = cover || thumbSrc;
  modalImg.onerror = function () {
    this.onerror = null;
    this.src = thumbSrc;
  };

  modalTitle.innerText = title;
  modalDesc.innerHTML = descElement ? descElement.innerHTML : "";
  modalClient.innerText = client || title;
  modalCat.innerText = cat || "Web";
  modalTech.innerText = tech || "WordPress, SEO";

  const tagsContainer = document.getElementById("modal-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = `
      <span class="meta-tag-match">Projet Sur-Mesure</span>
      <span class="meta-tag-badge">Ain (01)</span>
      <span>2026</span>
    `;
  }

  if (link && link !== "#") {
    modalLinkBtn.href = link;
    modalLinkBtn.target = "_blank";
    modalLinkBtn.rel = "noopener noreferrer";
    modalLinkBtn.style.display = "inline-flex";
    modalLinkBtn.innerHTML =
      '<i class="fa-solid fa-arrow-up-right-from-square"></i> Visiter le site';
    modalLinkBtn.onclick = (e) => {
      e.stopPropagation();
    };
  } else {
    modalLinkBtn.style.display = "none";
    modalLinkBtn.onclick = null;
  }

  if (modalCover) modalCover.classList.add("is-project-cover");

  modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";

  if (video) {
    videoTimer = setTimeout(() => {
      modalVideoWrapper.innerHTML = buildVideoIframe(video);
      setTimeout(() => {
        modalVideoWrapper.classList.add("is-playing");
        if (modalCover) modalCover.classList.add("has-video-playing");
      }, 350);
    }, 1200);
  }
}

function openServiceModalFromDOM(serviceKey) {
  resetModalState();

  const htmlSource = document.getElementById(`service-text-${serviceKey}`);
  if (!htmlSource) return;

  const title = htmlSource.getAttribute("data-title");
  const badge = htmlSource.getAttribute("data-badge");
  const hero = htmlSource.getAttribute("data-hero");
  const client = htmlSource.getAttribute("data-client");
  const cat = htmlSource.getAttribute("data-cat");
  const tech = htmlSource.getAttribute("data-tech");

  modalImg.src = hero;
  modalTitle.innerText = title;
  modalDesc.innerHTML = htmlSource.innerHTML;
  modalClient.innerText = client;
  modalCat.innerText = cat;
  modalTech.innerText = tech;

  const tagsContainer = document.getElementById("modal-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = `
      <span class="meta-tag-match">${badge}</span>
      <span class="meta-tag-badge">Ain (01)</span>
      <span>2026</span>
    `;
  }

  modalLinkBtn.style.display = "inline-flex";
  modalLinkBtn.href = "javascript:void(0)";
  modalLinkBtn.innerHTML =
    '<i class="fa-solid fa-paper-plane"></i> Demander un devis';
  modalLinkBtn.onclick = (e) => {
    e.preventDefault();
    goToContactFromModal();
  };

  modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function goToContactFromModal() {
  forceCloseModal();
  setTimeout(() => {
    smoothScrollToTarget("contact-section");
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      const firstInput = contactSection.querySelector("input[name='nom']");
      if (firstInput) setTimeout(() => firstInput.focus(), 600);
    }
  }, 100);
}

function openModalDetails(type) {
  resetModalState();

  const sideMeta = document.querySelector(".modal-side-meta");
  const socialsRow = document.getElementById("modal-socials-row");

  if (type === "drone-service") {
    modalImg.src = "images/drone.webp";
    modalTitle.innerText = "Prestations Drone 4K & Imagerie Aérienne";
    modalDesc.innerHTML = `
      <p>Je réalise vos prises de vues aériennes en haute définition, vidéos cinématiques et inspections techniques pour valoriser vos projets web, chantiers et infrastructures dans l'Ain et les départements limitrophes.</p>
      <p>J'opère en toute légalité et sécurité avec un numéro d'exploitant, enregistré sur <strong>AlphaTango</strong>, un numéro <strong>SIRET</strong> en règle et une <strong>assurance Responsabilité Civile Professionnelle</strong> dédiée à l'activité aérienne.</p>
      
      <div class="modal-episodes-action-wrap">
        <button type="button" class="btn-episodes-glass" onclick="switchModalToDroneEpisodes()">
          <i class="fa-solid fa-play"></i> Voir tous les épisodes vidéo (8 réalisations 4K)
        </button>
      </div>
    `;
    modalClient.innerText = "Aindev Drone";
    modalCat.innerText = "Captation 4K & Imagerie Aérienne";
    modalTech.innerText = "DJI Air 3, AlphaTango & RC Pro";
    modalLinkBtn.style.display = "inline-flex";
    modalLinkBtn.href = "https://aindev-drone.fr";
    modalLinkBtn.innerHTML =
      '<i class="fa-solid fa-arrow-up-right-from-square"></i> Visiter le site drone';
    modalLinkBtn.onclick = null;
  } else if (type === "faq") {
    modalImg.src = "images/chambre.webp";
    modalTitle.innerText = "Foire Aux Questions & Méthode";
    modalDesc.innerHTML = `<p>Retrouvez ci-dessous toutes les réponses aux questions fréquentes concernant les budgets, les délais, la propriété et le référencement naturel.</p>`;
    if (sideMeta) sideMeta.style.display = "none";
    if (episodesBlock) episodesBlock.style.display = "block";
  } else if (type === "about") {
    modalImg.src = "images/gg3.webp";
    modalTitle.innerText = "Guillaume Gemelas — Fondateur Aindev";
    const aboutHtml = document.getElementById("seo-text-about");
    modalDesc.innerHTML = aboutHtml ? aboutHtml.innerHTML : "";
    modalClient.innerText = "Guillaume Gemelas";
    modalCat.innerText = "Artisan du Web dans l'Ain";
    modalTech.innerText = "React, Next.js, WordPress, SEO";
    if (socialsRow) socialsRow.style.display = "flex";
  } else if (type === "legal") {
    modalImg.src = "images/chambre.webp";
    modalTitle.innerText = "Mentions Légales & Confidentialité";
    if (sideMeta) sideMeta.style.display = "none";
    const legalHtml = document.getElementById("seo-text-legal");
    modalDesc.innerHTML = legalHtml ? legalHtml.innerHTML : "";
  }

  const tagsContainer = document.getElementById("modal-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = `
      <span class="meta-tag-match">100% clients satisfaits</span>
      <span class="meta-tag-badge">Ain (01)</span>
      <span>2026</span>
    `;
  }

  modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function switchModalToDroneEpisodes() {
  forceCloseModal();
  setTimeout(() => {
    openDroneEpisodesModal();
  }, 150);
}

function toggleFaqEpisode(element) {
  const isActive = element.classList.contains("active");
  document.querySelectorAll(".episode-item").forEach((item) => {
    item.classList.remove("active");
  });
  if (!isActive) element.classList.add("active");
}

function closeModal(e) {
  if (e.target === modalBackdrop) forceCloseModal();
}

function forceCloseModal() {
  stopModalVideo();
  if (modalBackdrop) modalBackdrop.classList.remove("open");
  document.body.style.overflow = "auto";
  setTimeout(updateActiveSectionOnScroll, 80);
}

// ========================================================
// 4. MODALE 2 : ÉPISODES DRONE
// ========================================================
const droneModalBackdrop = document.getElementById("nf-drone-episodes-modal");
const droneVideoWrapper = document.getElementById("drone-modal-video-wrapper");
const droneModalCover = document.getElementById("drone-modal-cover");
const dronePlayerTitle = document.getElementById("drone-player-title");
const dronePlayerDesc = document.getElementById("drone-player-desc");
let droneVideoTimer = null;

function openDroneEpisodesModal() {
  droneModalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
  const firstEpisode = document.querySelector(".drone-item-row");
  if (firstEpisode) playDroneEpisodeFromDOM(firstEpisode);
}

function playDroneEpisodeFromDOM(element) {
  if (droneVideoTimer) clearTimeout(droneVideoTimer);
  const videoId = element.getAttribute("data-video");
  const title = element.getAttribute("data-title");
  const desc = element.getAttribute("data-desc");

  dronePlayerTitle.innerText = title;
  dronePlayerDesc.innerText = desc;

  // Mise à jour automatique du lien YouTube vers la vidéo active :
  const ytBtn = document.getElementById("drone-yt-btn");
  if (ytBtn && videoId) {
    ytBtn.href = `https://www.youtube.com/watch?v=${videoId}`;
  }

  document.querySelectorAll(".drone-item-row").forEach((el) => {
    el.classList.toggle("active", el === element);
  });

  droneModalBackdrop.scrollTo({ top: 0, behavior: "smooth" });

  droneVideoWrapper.classList.remove("is-playing");
  droneVideoWrapper.innerHTML = "";

  droneVideoTimer = setTimeout(() => {
    droneVideoWrapper.innerHTML = buildVideoIframe(videoId);
    setTimeout(() => {
      droneVideoWrapper.classList.add("is-playing");
      if (droneModalCover) droneModalCover.classList.add("has-video-playing");
    }, 250);
  }, 200);
}

function closeDroneModal(e) {
  if (e.target === droneModalBackdrop) forceCloseDroneModal();
}

function forceCloseDroneModal() {
  if (droneVideoTimer) clearTimeout(droneVideoTimer);
  if (droneVideoWrapper) {
    droneVideoWrapper.classList.remove("is-playing");
    droneVideoWrapper.innerHTML = "";
  }
  if (droneModalCover) droneModalCover.classList.remove("has-video-playing");
  if (droneModalBackdrop) droneModalBackdrop.classList.remove("open");
  document.body.style.overflow = "auto";
}

function focusSearch() {
  smoothScrollToTarget("row-web");
}

// ========================================================
// 5. PASTILLE & NAVIGATION (VERROUILLAGE SÉCURISÉ)
// ========================================================
const navPill = document.getElementById("nav-pill");
const menuLinks = document.getElementById("menu-links");
const navLinks = document.querySelectorAll(".nf-menu-links a.nav-link");

let isScrollingViaClick = false;
let unlockScrollTimeout = null;

function movePillTo(element) {
  if (!element || !navPill || !menuLinks) return;
  const linkRect = element.getBoundingClientRect();
  const menuRect = menuLinks.getBoundingClientRect();
  const leftPosition = linkRect.left - menuRect.left;
  const linkWidth = linkRect.width;

  navPill.style.opacity = "1";
  navPill.style.width = `${linkWidth}px`;
  navPill.style.transform = `translateX(${leftPosition}px)`;
}

function setActiveLink(linkElement) {
  if (!linkElement) return;
  navLinks.forEach((l) => l.classList.remove("active"));
  linkElement.classList.add("active");
  movePillTo(linkElement);
}

const scrollableSections = [
  { id: "billboard-top", target: "top" },
  { id: "row-web", target: "row-web" },
  { id: "row-prestations", target: "row-prestations" },
  { id: "row-drone", target: "row-drone" },
  { id: "row-reviews", target: "row-reviews" },
  { id: "contact-section", target: "contact-section" },
];

function updateActiveSectionOnScroll() {
  if (isScrollingViaClick || document.body.style.overflow === "hidden") return;

  // Verrouille strictement le profile-gate pour éviter tout affichage involontaire
  const profileGate = document.getElementById("profile-gate");
  if (
    profileGate &&
    sessionStorage.getItem("aindev_profile_entered") === "true"
  ) {
    if (!profileGate.classList.contains("hidden")) {
      profileGate.classList.add("hidden");
    }
  }

  // Protection contre le rebond élastique iOS en bas de page
  const isNearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 100;

  if (window.scrollY < 120 && !isNearBottom) {
    const homeLink = document.querySelector('.nav-link[data-target="top"]');
    if (homeLink && !homeLink.classList.contains("active"))
      setActiveLink(homeLink);
    return;
  }

  if (isNearBottom) {
    const contactLink = document.querySelector(
      '.nav-link[data-target="contact-section"]',
    );
    if (contactLink && !contactLink.classList.contains("active"))
      setActiveLink(contactLink);
    return;
  }

  const viewportAnchor = window.innerHeight * 0.35;
  let bestTarget = null;
  let minDistance = Infinity;

  scrollableSections.forEach((sec) => {
    const el = document.getElementById(sec.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportAnchor);
      if (distance < minDistance) {
        minDistance = distance;
        bestTarget = sec.target;
      }
    }
  });

  if (bestTarget && bestTarget !== "faq" && bestTarget !== "about") {
    const targetLink = document.querySelector(
      `.nav-link[data-target="${bestTarget}"]`,
    );
    if (targetLink && !targetLink.classList.contains("active"))
      setActiveLink(targetLink);
  }
}

window.addEventListener("scroll", updateActiveSectionOnScroll, {
  passive: true,
});

window.addEventListener("DOMContentLoaded", () => {
  const currentActive =
    document.querySelector(".nf-menu-links a.nav-link.active") || navLinks[0];
  setTimeout(() => movePillTo(currentActive), 120);
});

window.addEventListener("resize", () => {
  const currentActive = document.querySelector(
    ".nf-menu-links a.nav-link.active",
  );
  if (currentActive) movePillTo(currentActive);
});

// ========================================================
// 6. GESTION DU MENU MOBILE "EXPLORER ▾"
// ========================================================
function toggleMobileMenu() {
  const drawer = document.getElementById("mobile-nav-drawer");
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  if (!drawer || !toggleBtn) return;

  const isOpen = drawer.classList.contains("open");
  if (isOpen) {
    drawer.classList.remove("open");
    toggleBtn.classList.remove("open");
    document.body.style.overflow = "auto";
  } else {
    drawer.classList.add("open");
    toggleBtn.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function handleMobileNavClick(targetId, e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  toggleMobileMenu();

  if (targetId === "about") {
    openModalDetails("about");
  } else if (targetId === "faq") {
    openModalDetails("faq");
  } else {
    smoothScrollToTarget(targetId);
  }
}

// ========================================================
// 7. MODALE AVIS CLIENTS (GOOGLE 5.0 ★)
// ========================================================
function openReviewModal(cardElement) {
  resetModalState();

  const brandBadge = document.getElementById("modal-brand-badge");
  if (brandBadge) brandBadge.style.display = "none";

  const socialsRow = document.getElementById("modal-socials-row");
  if (socialsRow) socialsRow.style.display = "none";

  let author = "Avis Client Certifié";
  let fullText =
    "Témoignage authentique et vérifié issu de la fiche Google Établissement d'Aindev.";
  let projectLink = "https://g.co/kgs/52nCtbk";

  if (cardElement && typeof cardElement === "object" && cardElement.nodeType) {
    author =
      cardElement.getAttribute("data-author") ||
      cardElement
        .querySelector(".author")
        ?.innerText.replace("· Avis vérifié", "")
        .trim() ||
      author;
    const fullTextElement =
      cardElement.querySelector(".review-full-text") ||
      cardElement.querySelector(".review-snippet");
    if (fullTextElement) fullText = fullTextElement.innerHTML.trim();
  }

  modalImg.src = "images/chambre.webp";
  modalTitle.innerText = author;

  modalDesc.innerHTML = `
    <div class="modal-review-highlight" style="margin-top: 0; background: rgba(0, 91, 154, 0.12); border-left: 4px solid var(--aindev-cyan); padding: 22px 26px; border-radius: 0 12px 12px 0;">
      <div class="review-quote-head" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span class="stars" style="color:#f5c518; font-size:1.1rem; letter-spacing:2px;">★★★★★</span>
        <span class="author-tag" style="color:var(--aindev-cyan); font-weight:700; font-size:0.88rem;">Avis 5.0 / 5.0 vérifié Google</span>
      </div>
      <p style="font-size: 1.05rem; line-height: 1.8; color: #ffffff; font-style: italic;">« ${fullText} »</p>
    </div>
    <br>
    <p style="color: #a0aab5; font-size: 0.95rem; line-height: 1.6;">
      Témoignage authentique certifié issu de la fiche officielle Google Établissement de <strong>Guillaume Gemelas — Aindev</strong> (artisan développeur web et télépilote drone dans l'Ain).
    </p>
  `;

  modalClient.innerText = author;
  modalCat.innerText = "Avis Client Certifié";
  modalTech.innerText = "Recommandation 5.0 ★";

  const tagsContainer = document.getElementById("modal-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = `
      <span class="meta-tag-match">Avis Vérifié Google</span>
      <span class="meta-tag-badge">Ain (01)</span>
      <span>2026</span>
    `;
  }

  modalLinkBtn.style.display = "inline-flex";
  modalLinkBtn.href = projectLink;
  modalLinkBtn.innerHTML =
    '<i class="fa-brands fa-google"></i> Voir sur Google Avis';
  modalLinkBtn.onclick = null;

  if (episodesBlock) episodesBlock.style.display = "none";
  modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

// Fonction appelée par le bouton du Billboard
function scrollToContact(e) {
  smoothScrollToTarget("contact-section", e);
}

// ========================================================
// 8. FONCTION UNIVERSELLE DE DÉFILEMENT DOUX (CORRECTIF SAFARI IOS)
// ========================================================
function smoothScrollToTarget(targetId, e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 1. Verrouille fermement le profile-gate pour empêcher Safari iOS de le rouvrir
  const profileGate = document.getElementById("profile-gate");
  if (profileGate) {
    profileGate.classList.add("hidden");
  }

  // 2. Désactive temporairement le scrollspy
  isScrollingViaClick = true;
  if (unlockScrollTimeout) clearTimeout(unlockScrollTimeout);

  if (!targetId || targetId === "top" || targetId === "#") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const homeLink = document.querySelector('.nav-link[data-target="top"]');
    if (homeLink) setActiveLink(homeLink);
  } else {
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 65;
      const pos =
        el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: pos,
        behavior: "smooth",
      });

      const matchedLink = document.querySelector(
        `.nav-link[data-target="${targetId}"]`,
      );
      if (matchedLink) setActiveLink(matchedLink);
    }
  }

  // 3. Réactive le suivi de défilement une fois l'animation stabilisée
  unlockScrollTimeout = setTimeout(() => {
    isScrollingViaClick = false;
  }, 1000);
}

// Intercepte TOUS les liens internes avec '#' (Desktop, Footer, Mobile, etc.)
// SAUF les boutons d'action de modale !
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // 1. Si c'est le bouton d'action de la modale, on ne le touche SURTOUT PAS
    if (anchor.id === "modal-link-btn") return;

    // 2. Si c'est un bouton avec déjà un onclick personnalisé, on ne le touche pas
    if (anchor.getAttribute("onclick")) return;

    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.replace(/^#/, "");
      smoothScrollToTarget(targetId, e);
    });
  });
});

// ========================================================
// GESTIONNAIRE D'ENVOI NETLIFY & TOAST DE CONFIRMATION
// ========================================================
function showFormToast(isSuccess, title, message) {
  const toast = document.getElementById("form-toast");
  const toastTitle = document.getElementById("toast-title");
  const toastMsg = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");
  if (!toast) return;

  if (isSuccess) {
    toast.classList.remove("error");
    if (toastIcon)
      toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  } else {
    toast.classList.add("error");
    if (toastIcon)
      toastIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
  }

  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector('form[name="contact-aindev"]');
  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';
    }

    const formData = new FormData(contactForm);
    const bodyParams = new URLSearchParams(formData).toString();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Statut HTTP : ${response.status}`);
        }
        contactForm.reset();
        showFormToast(
          true,
          "Message bien reçu !",
          "Merci pour votre confiance, je vous recontacte sous 24h.",
        );
      })
      .catch((err) => {
        console.error("Échec envoi Netlify :", err);
        showFormToast(
          false,
          "Une erreur est survenue",
          "Merci de vérifier votre connexion ou de me joindre au 06 36 42 18 59.",
        );
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      });
  });
});
