// checkAdminClaim.js
// Usage: node checkAdminClaim.js <user-email>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download this from Firebase Console > Project Settings > Service Accounts

if (process.argv.length < 3) {
  console.error('Usage: node checkAdminClaim.js <user-email>');
  process.exit(1);
}

const userEmail = process.argv[2];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.auth().getUserByEmail(userEmail)
  .then(userRecord => {
    const claims = userRecord.customClaims || {};
    console.log('Custom claims for', userEmail, ':', claims);
    if (claims.admin) {
      console.log('✅ This user IS an admin.');
    } else {
      console.log('❌ This user is NOT an admin.');
    }
  })
  .catch(error => {
    console.error('Error fetching user data:', error);
  });
