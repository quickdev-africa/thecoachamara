// setAdminClaim.js
// Usage: node setAdminClaim.js <user-email>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download this from Firebase Console > Project Settings > Service Accounts

if (process.argv.length < 3) {
  console.error('Usage: node setAdminClaim.js <user-email>');
  process.exit(1);
}

const userEmail = process.argv[2];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.auth().getUserByEmail(userEmail)
  .then(userRecord => {
    return admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
  })
  .then(() => {
    console.log('✅ Admin claim set for', userEmail);
  })
  .catch(error => {
    console.error('Error setting admin claim:', error);
  });
