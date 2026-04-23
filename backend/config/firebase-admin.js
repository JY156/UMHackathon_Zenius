const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Path to your service account key file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let adminApp = null;
let bucket = null; // ✅ Declare bucket at module scope

try {
  if (!serviceAccountPath || !process.env.FIREBASE_PROJECT_ID) {
    console.warn('Zenius: Firebase credentials missing in .env. Running in mock mode.');
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.STORAGE_BUCKET // e.g., "your-project.appspot.com"
    });
    
    // ✅ Initialize bucket if storage is configured
    if (process.env.STORAGE_BUCKET) {
      bucket = admin.storage().bucket();
    }
    
    console.log('Zenius: Firebase Admin SDK Initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.stack);
}

// Mock objects for development without credentials
const db = adminApp ? admin.firestore() : {
  collection: () => ({
    doc: () => ({ set: async () => ({}) }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({ get: async () => ({ docs: [] }) }),
    get: async () => ({ docs: [] })
  })
};

// ✅ EXPORT BUCKET (this was missing!)
module.exports = { db, admin, bucket };