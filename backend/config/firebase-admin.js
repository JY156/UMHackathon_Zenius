const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Path to your service account key file
// Make sure this file name matches the one you downloaded!
const serviceAccountPath = path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('Zenius: Firebase Admin SDK Initialized');
} catch (error) {
  console.error('Firebase initialization error:', error.stack);
}

const db = admin.firestore();

module.exports = { db, admin };