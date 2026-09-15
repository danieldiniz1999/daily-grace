import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  full_name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  notification_enabled: z.boolean().optional(),
  preferred_bible_version: z.string().max(10).optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    type ProfileUpdate = {
      full_name?: string;
      phone?: string;
      notification_enabled?: boolean;
      preferred_bible_version?: string;
    };
    const update = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as ProfileUpdate;
    if (Object.keys(update).length === 0) return { ok: true };

    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => passwordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData.user) throw new Error("Usuária não encontrada.");

    const email = userData.user.email;
    if (!email) throw new Error("E-mail não encontrado.");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });

    if (signInError) throw new Error("Senha atual incorreta.");

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) throw new Error(updateError.message);
    return { ok: true };
  });

export const uploadAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Payload inválido.");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Arquivo inválido.");
    return { file };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { file } = data;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);
    return { avatarUrl };
  });
