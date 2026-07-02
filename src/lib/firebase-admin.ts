import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

type FirebaseServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function parseServiceAccount(raw: string): FirebaseServiceAccount {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Konfigurasi Firebase service account belum diisi.");
  }

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as FirebaseServiceAccount;
  }

  const decoded = Buffer.from(trimmed, "base64").toString("utf8");
  return JSON.parse(decoded) as FirebaseServiceAccount;
}

export function getFirebaseStorageBucket() {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON belum dikonfigurasi.");
  }

  const serviceAccount = parseServiceAccount(serviceAccountRaw);
  const projectId =
    process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || undefined;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : undefined);

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID belum dikonfigurasi.");
  }

  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET belum dikonfigurasi.");
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount as never),
      projectId,
      storageBucket,
    });
  }

  return getStorage().bucket(storageBucket);
}

