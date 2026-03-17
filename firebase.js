// ── Cronos Jobs — Firebase Shared Config ──────────────────────────────────
// Import this file in every page via:
//   <script type="module">
//     import { auth, db, storage, requireAuth, getEmployerProfile, signOutEmployer } from './firebase.js'
//   </script>

import { initializeApp }                              from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signOut }       from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"
import { getFirestore, doc, getDoc,
         updateDoc, serverTimestamp }                  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js"
import { getStorage }                                  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js"

// ── Firebase config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDX-5ECZCYsLt2mJcGqz-zGE2tmWVkD4AU",
  authDomain:        "jobs-42a5d.firebaseapp.com",
  projectId:         "jobs-42a5d",
  storageBucket:     "jobs-42a5d.firebasestorage.app",
  messagingSenderId: "39630535466",
  appId:             "1:39630535466:web:827d2a210006b5a7013c53",
  measurementId:     "G-7TRX5MXV55"
}

const app     = initializeApp(firebaseConfig)
const auth    = getAuth(app)
const db      = getFirestore(app)
const storage = getStorage(app)

// ── Analytics (optional — fails silently if blocked) ───────────────────────
let analytics = null
try {
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js")
  analytics = getAnalytics(app)
} catch (e) { /* analytics blocked or unavailable — continue without it */ }

export { app, auth, db, storage, analytics }


// ── requireAuth(redirectTo?) ───────────────────────────────────────────────
// Call at the top of any employer-portal page.
// Redirects to employer-login.html if no user is signed in.
// Returns a Promise that resolves to the Firebase user object.
//
// Usage:
//   const user = await requireAuth()
//
export function requireAuth(redirectTo = 'employer-login.html') {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      if (!user) {
        // Use replace() so the protected page is removed from history
        window.location.replace(redirectTo)
      } else {
        resolve(user)
      }
    })
  })
}


// ── getEmployerProfile(uid) ────────────────────────────────────────────────
// Fetches the employer's Firestore document.
// Returns the document data (with uid injected) or null if not found.
//
// Usage:
//   const profile = await getEmployerProfile(user.uid)
//
export async function getEmployerProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'employers', uid))
    return snap.exists() ? { uid, ...snap.data() } : null
  } catch (err) {
    console.error('getEmployerProfile failed:', err)
    return null
  }
}


// ── signOutEmployer() ──────────────────────────────────────────────────────
// Signs the employer out of Firebase Auth and redirects to login.
// Uses replace() so the back button can't return to the dashboard.
//
// Usage:
//   window.signOut = signOutEmployer  (expose to inline handlers)
//
export async function signOutEmployer() {
  try {
    await signOut(auth)
  } catch (e) { /* continue even if signOut fails */ }
  window.location.replace('employer-login.html')
}


// ── approveEmployer(uid, plan, planRenews) ─────────────────────────────────
// CRONOS INTERNAL USE — called from the admin control system.
// Sets verificationStatus to 'approved', activates the plan,
// and gives the employer access to post jobs.
//
// plan:       'Starter' | 'Growth' | 'Enterprise'
// planRenews: human-readable date string e.g. '1 Jun 2026'
//
// Usage:
//   await approveEmployer('uid123', 'Growth', '1 Jun 2026')
//
export async function approveEmployer(uid, plan, planRenews) {
  await updateDoc(doc(db, 'employers', uid), {
    verified:           true,
    verificationStatus: 'approved',
    plan:               plan,
    planStatus:         'active',
    planRenews:         planRenews || null,
    approvedAt:         serverTimestamp(),
    updatedAt:          serverTimestamp(),
  })
}


// ── rejectEmployer(uid, reason?) ───────────────────────────────────────────
// CRONOS INTERNAL USE — called from the admin control system.
// Rejects the employer's verification application.
// The employer will see a rejection message on login.
//
// Usage:
//   await rejectEmployer('uid123', 'Could not verify CIPC registration.')
//
export async function rejectEmployer(uid, reason) {
  await updateDoc(doc(db, 'employers', uid), {
    verified:           false,
    verificationStatus: 'rejected',
    rejectionReason:    reason || '',
    updatedAt:          serverTimestamp(),
  })
}


// ── setEmployerPlan(uid, plan, planStatus, planRenews) ─────────────────────
// CRONOS INTERNAL USE — updates an employer's plan after invoice payment.
// Use this to activate, expire, or change a plan without re-approving.
//
// planStatus: 'active' | 'expiring' | 'expired' | 'inactive'
//
// Usage:
//   await setEmployerPlan('uid123', 'Growth', 'active', '1 Sep 2026')
//   await setEmployerPlan('uid123', 'Growth', 'expired', null)
//
export async function setEmployerPlan(uid, plan, planStatus, planRenews) {
  await updateDoc(doc(db, 'employers', uid), {
    plan:       plan,
    planStatus: planStatus,
    planRenews: planRenews || null,
    updatedAt:  serverTimestamp(),
  })
}