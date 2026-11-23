import { DESTINATIONS } from "./navigation-routes.js";

export function createNavigationView({ onNavigate }) {
  const shell = document.getElementById("private-shell");
  const nav = document.getElementById("primary-navigation");
  const title = document.getElementById("destination-title");
  const skip = document.getElementById("skip-app");
  const account = document.getElementById("account-controls");
  const header = document.querySelector(".site-header__content");
  const settingsAccount = document.getElementById("settings-account");
  const panels = [...shell.querySelectorAll("[data-destination]")];
  const links = [...nav.querySelectorAll("[data-navigate]")];
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-navigate]");
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(link.dataset.navigate);
  });

  return Object.freeze({
    setReady(ready) {
      shell.hidden = !ready;
      nav.hidden = !ready;
      document.body.classList.toggle("private-navigation-ready", ready);
      (ready ? settingsAccount : header).append(account);
      if (!ready) {
        for (const panel of panels) panel.hidden = true;
        for (const link of links) link.removeAttribute("aria-current");
        document.title = "CalorieCheck";
      }
    },
    show(destination, { focus }) {
      for (const panel of panels) panel.hidden = panel.dataset.destination !== destination;
      for (const link of links) {
        if (link.dataset.navigate === destination) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
      title.textContent = DESTINATIONS[destination];
      document.title = `${DESTINATIONS[destination]} | CalorieCheck`;
      skip.href = "#destination-title";
      skip.textContent = `Skip to ${DESTINATIONS[destination]}`;
      if (focus) {
        title.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    },
  });
}
