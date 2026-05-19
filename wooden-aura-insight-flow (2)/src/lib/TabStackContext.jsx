import React, { createContext, useContext, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Tracks per-tab navigation stacks so that pressing Back returns to the
 * previous page within the same tab, not across tabs.
 */

const TAB_ROOTS = ["/dashboard", "/journal", "/health", "/exercise-library", "/profile"];

const TAB_MAP = {
  "/partner": "/journal",
  "/cool-down": "/journal",
  "/vision-board": "/journal",
  "/daily-check-in": "/journal",
  "/sync-space": "/journal",
  "/new-analysis": "/journal",
  "/onboarding": "/journal",
  "/mood-map": "/health",
  "/health-report": "/health",
  "/monthly-report": "/health",
  "/sentiment-trends": "/health",
  "/health": "/health",
  "/challenges": "/exercise-library",
  "/quiz": "/exercise-library",
  "/archive": "/exercise-library",
  "/weekly-challenge": "/exercise-library",
  "/goals": "/exercise-library",
  "/wisdom": "/exercise-library",
  "/coach": "/exercise-library",
  "/relationship-manager": "/profile",
  "/feedback": "/profile",
  "/premium": "/profile",
  "/analysis-management": "/profile",
};

export function getTabForPath(path) {
  if (TAB_ROOTS.includes(path)) return path;
  // Check prefix matches
  for (const [prefix, tab] of Object.entries(TAB_MAP)) {
    if (path === prefix || path.startsWith(prefix + "/")) return tab;
  }
  return "/dashboard";
}

const TabStackContext = createContext(null);

export function TabStackProvider({ children }) {
  // Map of tabRoot -> stack of paths (most recent last)
  const stacks = useRef({
    "/dashboard": ["/dashboard"],
    "/journal": ["/journal"],
    "/health": ["/health"],
    "/exercise-library": ["/exercise-library"],
    "/profile": ["/profile"],
  });

  const pushPath = useCallback((path) => {
    const tab = getTabForPath(path);
    const stack = stacks.current[tab] ?? [tab];
    // Avoid duplicate consecutive entries
    if (stack[stack.length - 1] === path) return;
    stacks.current[tab] = [...stack, path];
  }, []);

  const popPath = useCallback((tab) => {
    const stack = stacks.current[tab] ?? [tab];
    if (stack.length <= 1) return tab; // already at root
    const next = [...stack];
    next.pop();
    stacks.current[tab] = next;
    return next[next.length - 1];
  }, []);

  const resetStack = useCallback((tab) => {
    stacks.current[tab] = [tab];
  }, []);

  const getStack = useCallback((tab) => stacks.current[tab] ?? [tab], []);

  return (
    <TabStackContext.Provider value={{ pushPath, popPath, resetStack, getStack }}>
      {children}
    </TabStackContext.Provider>
  );
}

export function useTabStack() {
  return useContext(TabStackContext);
}