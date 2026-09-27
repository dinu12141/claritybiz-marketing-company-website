import { knownRoutePaths } from "@/data/site";

/** True when the built file is opened directly from disk (no HTTP server). */
export const isFileProtocol = () =>
  typeof window !== "undefined" && window.location.protocol === "file:";

/**
 * Resolves the router basename at runtime so clean URLs work whether the
 * site is deployed at the domain root ("/") or served from a sub-folder
 * (e.g. "/preview/site/").
 */
export function resolveBasename(): string {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname.replace(/\/index\.html$/i, "/");

  // A known route appears in the path: everything before it is the base.
  for (const route of knownRoutePaths) {
    const index = pathname.indexOf(route);
    if (index === -1) continue;
    const next = pathname.charAt(index + route.length);
    if (next === "" || next === "/") {
      return pathname.slice(0, index) || "/";
    }
  }

  // Directory-style path (e.g. "/some/folder/") → served from a sub-folder.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/$/, "");
  }

  return "/";
}
