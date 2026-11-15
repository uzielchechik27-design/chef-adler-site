(function () {
  "use strict";
  function jumpHash() {
    var id = location.hash && location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (el) el.scrollIntoView();
  }
  var shot = /(?:\?|&)shot=([a-z]+)/.exec(location.search); if (shot) document.body.classList.add("shot-" + shot[1]);
  jumpHash();
  window.addEventListener("load", jumpHash);

  var SITE = window.SITE || {};
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("menu");

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
  window.addEventListener("scroll", function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });

    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rev.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { rev.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  function fillSlot(name, src, alt) {
    if (!src) return;
    document.querySelectorAll('img[data-slot="' + name + '"]').forEach(function (img) {
      img.src = src;
      if (alt) img.alt = alt;
      img.hidden = false;
      var well = img.closest(".media-well");
      if (well) well.classList.add("has-img");
    });
  }
  var imgs = SITE.images || {};
  fillSlot("about-francescana", imgs["about-francescana"], "Osteria Francescana");
  fillSlot("about-portrait", imgs["about-portrait"], "עומר אדלר במטבח");
  fillSlot("about-sea", imgs["about-sea"], "דיג וים");
  fillSlot("events-table", imgs["events-table"], "שולחן ארוחה");
  fillSlot("ing-tuna", imgs["ing-tuna"], "טונה");
  fillSlot("ing-wagyu", imgs["ing-wagyu"], "וואגיו");
  if (imgs.hero) {
    var hero = document.querySelector(".hero__sea");
    if (hero) {
      hero.style.backgroundImage = "linear-gradient(180deg, rgba(7,16,23,0.25), rgba(7,16,23,0.72)), url('" + imgs.hero + "')";
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    }
  }

  var gallery = document.getElementById("galleryGrid");
  var empty = document.getElementById("galleryEmpty");
  var galleryItems = (imgs.gallery || []).filter(Boolean);
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector(".lb__img");
  var lbIndex = 0;

  function openLb(i) {
    lbIndex = i;
    lbImg.src = galleryItems[i];
    lbImg.alt = "תמונה " + (i + 1);
    if (typeof lb.showModal === "function") lb.showModal();
  }
  function step(d) {
    if (!galleryItems.length) return;
    lbIndex = (lbIndex + d + galleryItems.length) % galleryItems.length;
    lbImg.src = galleryItems[lbIndex];
    lbImg.alt = "תמונה " + (lbIndex + 1);
  }
  if (galleryItems.length) {
    empty.hidden = true;
    gallery.hidden = false;
    galleryItems.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "פתיחת תמונה " + (i + 1));
      var im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      btn.appendChild(im);
      btn.addEventListener("click", function () { openLb(i); });
      gallery.appendChild(btn);
    });
  }
  lb.querySelector(".lb__close").addEventListener("click", function () { lb.close(); });
  lb.querySelector(".lb__prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb__next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.open) return;
    if (e.key === "Escape") lb.close();
    if (e.key === "ArrowRight") step(-1);
    if (e.key === "ArrowLeft") step(1);
  });

  function telHref(phone) {
    var digits = (phone || "").replace(/[^\d+]/g, "");
    return digits ? "tel:" + digits : "";
  }
  function waHref() {
    return SITE.whatsapp ? "https://wa.me/" + String(SITE.whatsapp).replace(/\D/g, "") : "";
  }

  var foot = document.getElementById("footContact");
  var alt = document.getElementById("contactAlt");
  var parts = [];
  if (SITE.phone) {
    parts.push('<a href="' + telHref(SITE.phone) + '" dir="ltr">' + SITE.phone + "</a>");
  }
  if (SITE.email) {
    parts.push('<a href="mailto:' + SITE.email + '">' + SITE.email + "</a>");
  }
  if (SITE.whatsapp) {
    parts.push('<a href="' + waHref() + '" target="_blank" rel="noopener">WhatsApp</a>');
  }
  if (parts.length) {
    foot.innerHTML = parts.join("");
    var altBits = [];
    if (SITE.whatsapp) altBits.push('או בוואטסאפ: <a href="' + waHref() + '" target="_blank" rel="noopener" dir="ltr">' + (SITE.phone || SITE.whatsapp) + "</a>");
    if (SITE.email) altBits.push('או במייל: <a href="mailto:' + SITE.email + '">' + SITE.email + "</a>");
    alt.innerHTML = altBits.join(" · ");
  } else {
    foot.innerHTML = "<span class='muted'>[אימייל] · [טלפון]</span>";
    alt.textContent = "פרטי הטלפון, המייל והוואטסאפ יתווספו לכאן.";
  }

  var form = document.getElementById("contactForm");
  var msg = document.getElementById("cfMsg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cf-name").value.trim();
    var phone = document.getElementById("cf-phone").value.trim();
    if (!name || !phone) {
      msg.className = "form__msg err";
      msg.textContent = "נא למלא שם וטלפון.";
      (!name ? document.getElementById("cf-name") : document.getElementById("cf-phone")).focus();
      return;
    }
    var rows = [];
    form.querySelectorAll("input, textarea").forEach(function (el) {
      if (!el.name) return;
      var v = (el.value || "").trim();
      if (v) rows.push(el.name + ": " + v);
    });
    var body = rows.join("\n");
    var subject = "בקשת הזמנה מהאתר — " + name;
    if (SITE.email) {
      window.location.href = "mailto:" + SITE.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      msg.className = "form__msg ok";
      msg.textContent = "נפתח אצלכם חלון מייל עם הפרטים. נא ללחוץ שליחה כדי להשלים.";
    } else if (SITE.whatsapp) {
      window.open(waHref() + "?text=" + encodeURIComponent(subject + "\n\n" + body), "_blank", "noopener");
      msg.className = "form__msg ok";
      msg.textContent = "נפתח וואטסאפ עם הפרטים.";
    } else {
      msg.className = "form__msg err";
      msg.textContent = "פרטי הקשר של השף עדיין לא הוזנו באתר, ולכן לא ניתן לשלוח את הטופס עדיין.";
    }
  });
})();
