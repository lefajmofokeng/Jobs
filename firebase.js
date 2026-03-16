// ── Cronos Jobs — Firebase Shared Config ──────────────────────────────────
// Import this file in every page via:
//   <script type="module">
//     import { auth, db, storage } from './firebase.js';
//   </script>

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore }                         from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage }                           from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { getAnalytics }                         from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDX-5ECZCYsLt2mJcGqz-zGE2tmWVkD4AU",
  authDomain:        "jobs-42a5d.firebaseapp.com",
  projectId:         "jobs-42a5d",
  storageBucket:     "jobs-42a5d.firebasestorage.app",
  messagingSenderId: "39630535466",
  appId:             "1:39630535466:web:827d2a210006b5a7013c53",
  measurementId:     "G-7TRX5MXV55"
};

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getFirestore(app);
const storage   = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };


// ── Auth helpers ───────────────────────────────────────────────────────────

/**
 * requireAuth(redirectTo?)
 * Call at the top of any employer-portal page.
 * If no user is signed in, redirects to employer-login.html immediately.
 * Returns a Promise that resolves to the Firebase user object.
 *
 * Usage:
 *   import { requireAuth } from './firebase.js';
 *   const user = await requireAuth();
 */
export function requireAuth(redirectTo = 'employer-login.html') {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

/**
 * getEmployerProfile(uid)
 * Fetches the employer's Firestore document from the 'employers' collection.
 * Returns the document data or null if not found.
 *
 * Usage:
 *   import { getEmployerProfile } from './firebase.js';
 *   const profile = await getEmployerProfile(user.uid);
 */
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function getEmployerProfile(uid) {
  const snap = await getDoc(doc(db, 'employers', uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * signOutEmployer()
 * Signs the user out and redirects to employer-login.html.
 *
 * Usage:
 *   import { signOutEmployer } from './firebase.js';
 *   <button onclick="signOutEmployer()">Sign out</button>
 */
export async function signOutEmployer() {
  await signOut(auth);
  window.location.href = 'employer-login.html';
}
