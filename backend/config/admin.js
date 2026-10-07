const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'AdminPassword123!';

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      role: 'admin'
    });
    console.log(`✅ Default admin account created: ${email}`);
    return;
  }

  if (admin.role !== 'admin') {
    throw new Error(`Cannot create admin account: ${email} already belongs to a ${admin.role}`);
  }

  console.log(`✅ Admin account ready: ${email}`);
}

module.exports = {
  ensureAdminUser,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD
};
