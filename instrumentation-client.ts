let committedRoute = window.location.pathname + window.location.search;

window.addEventListener("storefront:navigation-commit", event => {
  const route = (event as CustomEvent<string>).detail;
  if (typeof route === "string") committedRoute = route;
});

// Compare against the committed route: popstate may already have updated location.
export function onRouterTransitionStart(url: string) {
  const destination = new URL(url, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname + destination.search === committedRoute) return;
  window.dispatchEvent(new CustomEvent("storefront:navigation-start"));
}
