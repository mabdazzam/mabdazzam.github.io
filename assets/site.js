document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeKey = "maa-color-theme";
  const themeButton = document.createElement("button");
  themeButton.className = "theme-toggle";
  themeButton.type = "button";
  themeButton.setAttribute("aria-pressed", "false");
  themeButton.innerHTML = '<span class="theme-icon" aria-hidden="true"></span><span class="theme-label"></span>';

  const savedTheme = (() => {
    try { return localStorage.getItem(themeKey); } catch { return null; }
  })();
  const initialTheme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const updateThemeButton = (theme) => {
    const dark = theme === "dark";
    themeButton.querySelector(".theme-icon").textContent = dark ? "☼" : "☾";
    themeButton.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";
    themeButton.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
    themeButton.setAttribute("aria-pressed", String(dark));
  };

  root.dataset.theme = initialTheme;
  updateThemeButton(initialTheme);
  const nav = document.querySelector(".top-nav");
  if (nav) nav.append(themeButton);
  else {
    const back = document.querySelector(".back");
    if (back) back.insertAdjacentElement("afterend", themeButton);
    else document.body.append(themeButton);
  }
  themeButton.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    updateThemeButton(theme);
    try { localStorage.setItem(themeKey, theme); } catch { /* Theme still works for this page. */ }
  });

  if (document.body.classList.contains("academic-profile")) {
    const progress = document.querySelector(".reading-progress");
    const siteHeader = document.querySelector(".site-header");
    const sectionLinks = [...document.querySelectorAll('.top-nav a[href^="#"]')]
      .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
      .filter(({ section }) => section);

    let updateQueued = false;
    const updateReadingPosition = () => {
      if (updateQueued) return;
      updateQueued = true;
      requestAnimationFrame(() => {
        updateQueued = false;
        const doc = document.documentElement;
        const scrollRange = doc.scrollHeight - window.innerHeight;
        const progressRatio = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
        if (progress) progress.style.transform = `scaleX(${progressRatio})`;
        if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 28);

        const activationLine = Math.min(150, window.innerHeight * .28);
        let active = null;
        sectionLinks.forEach(({ link, section }) => {
          if (section.getBoundingClientRect().top <= activationLine) active = link;
        });
        sectionLinks.forEach(({ link }) => {
          if (link === active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    };
    window.addEventListener("scroll", updateReadingPosition, { passive: true });
    window.addEventListener("resize", updateReadingPosition);
    updateReadingPosition();

    const filters = [...document.querySelectorAll("[data-project-filter]")];
    const projects = [...document.querySelectorAll(".project-row[data-project-groups]")];
    if (filters.length && projects.length) {
      document.body.classList.add("filters-ready");
      filters.forEach((filterButton) => {
        filterButton.addEventListener("click", () => {
          const selected = filterButton.dataset.projectFilter;
          filters.forEach((button) => button.setAttribute("aria-pressed", String(button === filterButton)));
          projects.forEach((project) => {
            const groups = project.dataset.projectGroups.split(/\s+/);
            project.hidden = selected !== "all" && !groups.includes(selected);
          });
          updateReadingPosition();
        });
      });
    }
  }

  const triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length || typeof HTMLDialogElement === "undefined") return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Expanded research figure");

  const close = document.createElement("button");
  close.className = "lightbox-close";
  close.type = "button";
  close.setAttribute("aria-label", "Close expanded figure");
  close.textContent = "Close  ×";

  const figure = document.createElement("figure");
  figure.className = "lightbox-figure";
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  figure.append(image, caption);
  dialog.append(close, figure);
  document.body.append(dialog);

  let opener = null;
  let returnScrollX = 0;
  let returnScrollY = 0;
  const dismiss = () => dialog.close();
  close.addEventListener("click", dismiss);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dismiss();
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    caption.textContent = "";
    const trigger = opener;
    const scrollX = returnScrollX;
    const scrollY = returnScrollY;
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      window.scrollTo(scrollX, scrollY);
    });
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const source = trigger.querySelector("img");
      if (!source) return;
      opener = trigger;
      returnScrollX = window.scrollX;
      returnScrollY = window.scrollY;
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      caption.textContent = trigger.dataset.caption || source.alt;
      dialog.showModal();
      close.focus({ preventScroll: true });
    });
  });
});
