const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Path to your service account key file
// Make sure this file name matches the one you downloaded!
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let adminApp = null;
try {
  if (!serviceAccountPath || !process.env.FIREBASE_PROJECT_ID) {
    console.warn('Zenius: Firebase credentials missing in .env. Running in mock mode.');
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.STORAGE_BUCKET
    });
    console.log('Zenius: Firebase Admin SDK Initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.stack);
}

const db = adminApp ? admin.firestore() : {
  collection: () => ({
    doc: () => ({ set: async () => ({}) }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({ get: async () => ({ docs: [] }) }),
    get: async () => ({ docs: [] })
  })
};

module.exports = { db, admin };