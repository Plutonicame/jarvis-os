// ═══════════════════════════════════════════════════
// db.js — Jarvis OS Database Layer
// ═══════════════════════════════════════════════════
import { getClient } from './auth.js'

// ── PROFILS UTILISATEURS ──────────────────────────

export async function getProfile(userId) {
  const { data, error } = await getClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(userId, updates) {
  const { data, error } = await getClient()
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── MODULES UTILISATEUR ───────────────────────────

export async function getUserModules(userId) {
  const { data, error } = await getClient()
    .from('user_modules')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveUserModules(userId, modules) {
  // Supprime tous les modules existants puis réinsère dans l'ordre
  const { error: delError } = await getClient()
    .from('user_modules')
    .delete()
    .eq('user_id', userId)
  if (delError) throw delError

  if (!modules.length) return []

  const rows = modules.map((m, i) => ({
    user_id: userId,
    position: i,
    name: m.name,
    icon: m.icon,
    sub: m.sub,
    content: m.content,   // HTML de l'app
    app_id: m.app_id ?? null,
    is_active: m.is_active ?? true,
    permissions: m.permissions ?? {},
    config: m.config ?? {},
    updated_at: new Date().toISOString()
  }))

  const { data, error } = await getClient()
    .from('user_modules')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function updateModuleStatus(userId, position, isActive) {
  const { error } = await getClient()
    .from('user_modules')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('position', position)
  if (error) throw error
}

// ── CATALOGUE DES APPS DISPONIBLES ───────────────

export async function getAppRegistry() {
  const { data, error } = await getClient()
    .from('app_registry')
    .select('*')
    .eq('is_published', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

// ── PARAMÈTRES UTILISATEUR ────────────────────────

export async function getUserSettings(userId) {
  const { data, error } = await getClient()
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data?.settings ?? {}
}

export async function saveUserSettings(userId, settings) {
  const { error } = await getClient()
    .from('profiles')
    .update({ settings, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}
