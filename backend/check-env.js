// Quick script to check environment variables
console.log('🔍 Environment Variables Check:\n');
console.log('================================');

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SHIPMOJO_PUBLIC_KEY',
  'SHIPMOJO_PRIVATE_KEY',
  'SHIPMOJO_PICKUP_PINCODE',
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL'
];

let missingCount = 0;
let presentCount = 0;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET (${value.substring(0, 10)}...)`);
    presentCount++;
  } else {
    console.log(`❌ ${varName}: MISSING`);
    missingCount++;
  }
});

console.log('\n================================');
console.log(`📊 Summary:`);
console.log(`   Present: ${presentCount}/${requiredVars.length}`);
console.log(`   Missing: ${missingCount}/${requiredVars.length}`);
console.log('================================\n');

if (missingCount > 0) {
  console.log('⚠️  Some variables are missing!');
  console.log('   Add them in Render Dashboard → Environment tab');
  process.exit(1);
} else {
  console.log('✅ All environment variables are set!');
  process.exit(0);
}
