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
