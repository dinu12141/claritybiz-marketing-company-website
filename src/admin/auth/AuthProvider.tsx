import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { logAuthEvent } from "@/admin/api";
import { errorMessage, requireSupabase } from "@/lib/supabase";
import type { ProfileRow } from "@/lib/types";

export type AuthStatus = "loading" | "signed_out" | "pending" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  permissions: Set<string>;
  roleKey: string | null;
  isSuperAdmin: boolean;
  can: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = requireSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [profileLoaded, setProfileLoaded] = useState(false);
  const loggedLoginFor = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionResolved(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setSessionResolved(true);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setPermissions(new Set());
        loggedLoginFor.current = null;
      }
      if (event === "SIGNED_IN" && nextSession?.user && loggedLoginFor.current !== nextSession.user.id) {
        loggedLoginFor.current = nextSession.user.id;
        // Defer: never call Supabase synchronously inside the auth callback.
        setTimeout(() => {
          logAuthEvent("login").catch(() => undefined);
        }, 0);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const loadProfile = useCallback(
    async (userId: string) => {
      const [profileResult, permissionResult] = await Promise.all([
        supabase.from("profiles").select("*, role:roles(*)").eq("id", userId).maybeSingle(),
        supabase.rpc("my_permissions"),
      ]);
      setProfile((profileResult.data as ProfileRow | null) ?? null);
      const keys = Array.isArray(permissionResult.data) ? (permissionResult.data as string[]) : [];
      setPermissions(new Set(keys));
    },
    [supabase],
  );

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setProfileLoaded(true);
      return;
    }
    let active = true;
    setProfileLoaded(false);
    loadProfile(userId)
      .catch(() => undefined)
      .finally(() => {
        if (active) setProfileLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? errorMessage(error) : null;
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      return error ? errorMessage(error) : null;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    try {
      await logAuthEvent("logout");
    } catch {
      // ignore audit failures on sign-out
    }
    await supabase.auth.signOut();
  }, [supabase]);

  const roleKey = profile?.role?.key ?? null;
  const isSuperAdmin = roleKey === "super_admin";

  const status: AuthStatus = !sessionResolved
    ? "loading"
    : !session
      ? "signed_out"
      : !profileLoaded
        ? "loading"
        : profile && profile.is_active && profile.role_id
          ? "ready"
          : "pending";

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      permissions,
      roleKey,
      isSuperAdmin,
      can: (permission: string) => isSuperAdmin || permissions.has(permission),
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [status, session, profile, permissions, roleKey, isSuperAdmin, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
