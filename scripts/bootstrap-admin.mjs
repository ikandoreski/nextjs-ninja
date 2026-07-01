import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local tidak ditemukan.");
  }

  const content = readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function bootstrapAdmin() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey || !email || !password) {
    throw new Error("Konfigurasi bootstrap admin belum lengkap di .env.local.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  });

  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUser = existingUsers.users.find((user) => user.email === email);

  if (existingUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        user_metadata: {
          role: "super_admin",
          full_name: "Ninja388 Super Admin",
        },
      }
    );

    if (updateError) {
      throw updateError;
    }

    console.log(`Admin sudah ada. Password diperbarui untuk ${email}`);
    return;
  }

  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "super_admin",
      full_name: "Ninja388 Super Admin",
    },
  });

  if (createError) {
    throw createError;
  }

  console.log(`Admin berhasil dibuat untuk ${email}`);
}

bootstrapAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
