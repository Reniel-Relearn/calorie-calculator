export const DESTINATIONS = Object.freeze({
  today: "Today",
  analyze: "Analyze",
  week: "Week",
  settings: "Settings",
});

export function readDestination(href) {
  const value = new URL(href).searchParams.get("view");
  return Object.hasOwn(DESTINATIONS, value) ? value : "today";
}

export function destinationUrl(href, destination) {
  if (!Object.hasOwn(DESTINATIONS, destination)) return null;
  const url = new URL(href);
  url.searchParams.set("view", destination);
  return `${url.pathname}${url.search}`;
}
