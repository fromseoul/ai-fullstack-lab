import { supabase } from "../config/supabase.js";
import type { Profile, UpdateProfileRequest } from "@repo/shared";

export async function getOrCreateProfile(
  uid: string,
  email?: string,
  displayName?: string,
  avatarUrl?: string,
): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  if (existing) {
    // 기존 프로필에 displayName/avatarUrl이 없으면 업데이트
    const updates: Record<string, unknown> = {};
    if (!existing.display_name && displayName) updates.display_name = displayName;
    if (!existing.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;

    if (Object.keys(updates).length > 0) {
      const { data: updated } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", uid)
        .select()
        .single();
      if (updated) return mapProfileRow(updated);
    }

    return mapProfileRow(existing);
  }

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: uid,
      email: email || null,
      display_name: displayName || null,
      avatar_url: avatarUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return mapProfileRow(created);
}

export async function getProfileById(uid: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  if (error || !data) return null;
  return mapProfileRow(data);
}

export async function updateProfile(uid: string, updates: UpdateProfileRequest): Promise<Profile> {
  const updateData: Record<string, unknown> = {};
  if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.bio !== undefined) updateData.bio = updates.bio;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", uid)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return mapProfileRow(data);
}

function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string | null,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    bio: row.bio as string | null,
    role: row.role as "user" | "admin",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
