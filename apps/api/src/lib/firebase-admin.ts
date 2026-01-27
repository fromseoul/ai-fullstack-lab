import admin from "firebase-admin";

// Firebase Admin 초기화
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    console.warn("Firebase Admin: 서비스 계정 정보가 없습니다. 카카오 로그인이 작동하지 않습니다.");
    admin.initializeApp({ projectId });
  }
}

export const firebaseAdmin = admin;
export const adminAuth = admin.auth();
