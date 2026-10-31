"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const SUPPORTED_THEMES = ["light", "dark"] as const;
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const storageKey = props.storageKey ?? "theme";
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      themes={[...SUPPORTED_THEMES]}
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme
      disableTransitionOnChange
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
