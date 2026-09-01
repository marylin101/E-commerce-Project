const { connectDB, closeDB } = require('../config/database');
const userRepository = require('../repositories/userRepository');
const addressRepository = require('../repositories/addressRepository');
const categoryRepository = require('../repositories/categoryRepository');

async function run() {
  await connectDB();

  const category = await categoryRepository.createCategory({ name: 'Pens' });
  console.log('Created category:', category);

  const testEmail = `test.user.${Date.now()}@example.com`;
  const user = await userRepository.createUser({
    name: 'Test User',
    email: testEmail,
    passwordHash: 'not-a-real-hash-just-testing',
    role: 'customer',
  });
  console.log('Created user:', user);

  const address = await addressRepository.createAddress({
    userId: user._id,
    line1: '123 Test Street',
    city: 'Benoni',
    province: 'Gauteng',
    postalCode: '1501',
  });
  console.log('Created address:', address);

  await userRepository.deleteUser(user._id);
  await addressRepository.deleteAddress(address._id);

  console.log('All Day 1 checks passed.');
  await closeDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Test script failed:', err.message);
  await closeDB();
  process.exit(1);
});
