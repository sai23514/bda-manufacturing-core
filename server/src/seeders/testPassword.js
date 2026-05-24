import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const testPassword = async () => {
  try {
    console.log('🔍 Testing password hashing...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@bda.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found. Run npm run seed first.');
      process.exit(1);
    }

    console.log('📧 Email:', admin.email);
    console.log('🔐 Hashed Password:', admin.password);
    console.log('');

    // Test password comparison
    const testPasswords = ['admin123', 'wrong123', 'Admin123'];
    
    for (const pwd of testPasswords) {
      const isMatch = await admin.comparePassword(pwd);
      console.log(`Testing "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testPassword();
