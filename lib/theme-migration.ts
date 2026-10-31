// Runs before next-themes reads the persisted preference on the initial load.
export const themeMigrationScript = `(() => {
  try {
    const root = document.documentElement;
    root.classList.remove("steel-blue", "steel", "green", "plum", "olive", "rose", "theme-steel", "theme-green", "theme-plum", "theme-olive", "theme-rose");
    const stored = window.localStorage.getItem("theme");
    if (stored !== "light" && stored !== "dark") window.localStorage.setItem("theme", "light");
  } catch {}
})();`;
