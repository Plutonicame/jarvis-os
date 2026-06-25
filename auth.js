// ═══════════════════════════════════════════════════
// auth.js — Jarvis OS Authentication (Supabase)
// ═══════════════════════════════════════════════════

// ⚠️  REMPLACE CES VALEURS par les tiennes depuis supabase.com
const SUPABASE_URL = 'https://XXXXXXXXXXXX.supabase.co'
const SUPABASE_ANON_KEY = 'eyJXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

// ── Charge le SDK Supabase depuis CDN ──────────────
let supabase = null

export async function initSupabase() {
  if (supabase) return supabase
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  return supabase
}

export function getClient() {
  if (!supabase) throw new Error('Supabase non initialisé. Appelle initSupabase() d\'abord.')
  return supabase
}

// ── Inscription ───────────────────────────────────
export async function signUp(email, password, displayName) {
  const sb = await initSupabase()
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  })
  if (error) throw error
  return data
}

// ── Connexion ─────────────────────────────────────
export async function signIn(email, password) {
  const sb = await initSupabase()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ── Déconnexion ───────────────────────────────────
export async function signOut() {
  const sb = await initSupabase()
  const { error } = await sb.auth.signOut()
  if (error) throw error
}

// ── Session courante ──────────────────────────────
export async function getSession() {
  const sb = await initSupabase()
  const { data: { session } } = await sb.auth.getSession()
  return session
}

// ── Utilisateur courant ───────────────────────────
export async function getCurrentUser() {
  const sb = await initSupabase()
  const { data: { user } } = await sb.auth.getUser()
  return user
}

// ── Écoute les changements de session ─────────────
export async function onAuthChange(callback) {
  const sb = await initSupabase()
  return sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// ── Reset mot de passe ────────────────────────────
export async function resetPassword(email) {
  const sb = await initSupabase()
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/index.html#reset-password'
  })
  if (error) throw error
}
