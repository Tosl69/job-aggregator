// Usage: node scripts/make-admin.js user@example.com
// Promotes an existing user to the "admin" role.
require('dotenv').config();
const pool = require('../src/db');

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/make-admin.ajs <email>');
    process.exit(1);
  }

  const result = await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, name, email, role",
    [email]
  );

  if (result.rowCount === 0) {
    console.error(`Aucun utilisateur trouvé avec l'email "${email}".`);
    process.exit(1);
  }

  console.log('Utilisateur promu admin :', result.rows[0]);
  process.exit(0);
}

main().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});