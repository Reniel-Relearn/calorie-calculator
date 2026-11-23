import { clearAuthCallbackUrl } from "../auth/auth-routes.js";
import { DESTINATIONS, destinationUrl, readDestination } from "./navigation-routes.js";

export function createNavigationController({ view, browser = window, onChange = () => {} }) {
  let ready = false;
  let destination = null;
  let previous = "today";

  function navigate(next, { replace = false, focus = true, fromHistory = false } = {}) {
    if (!ready || !Object.hasOwn(DESTINATIONS, next)) return false;
    const changed = next !== destination;
    if (changed && destination && destination !== "settings") previous = destination;
    destination = next;
    if (!fromHistory) {
      // Authentication has already succeeded; never copy callback credentials into a new entry.
      clearAuthCallbackUrl(browser.location, browser.history);
      const path = destinationUrl(browser.location.href, next);
      if (replace || browser.location.pathname + browser.location.search !== path) {
        browser.history[replace ? "replaceState" : "pushState"]({ view: next }, "", path);
      }
    }
    view.show(next, { focus });
    onChange(next, { changed, focus });
    return true;
  }

  function handlePopState() {
    if (!ready) return;
    navigate(readDestination(browser.location.href), { fromHistory: true });
  }
  browser.addEventListener("popstate", handlePopState);

  return Object.freeze({
    activate({ focus = true } = {}) {
      ready = true;
      view.setReady(true);
      const next = destination ?? readDestination(browser.location.href);
      navigate(next, { replace: true, focus });
    },
    navigate,
    returnFromSettings: () => destination === "settings" && navigate(previous),
    suspend() {
      ready = false;
      view.setReady(false);
    },
    reset() {
      ready = false;
      destination = null;
      previous = "today";
      view.setReady(false);
      const url = new URL(browser.location.href);
      url.searchParams.delete("view");
      browser.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    },
    destroy() {
      ready = false;
      browser.removeEventListener("popstate", handlePopState);
      view.setReady(false);
    },
  });
}
