/**
 * validateEnv.js
 * Validates required environment variables at startup.
 * Call this before the app starts accepting requests.
 */

const REQUIRED_VARS = [
  { key: 'MONGODB_URI',    desc: 'MongoDB connection string' },
  { key: 'JWT_SECRET',     desc: 'JWT signing secret (min 32 chars)', minLength: 32 },
];

const WEAK_SECRETS = [
  'secret', 'password', 'changeme', 'example', 'your_jwt_secret',
  'CHANGE_ME', 'jwt_secret', 'fallback',
];

export function validateEnv() {
  const errors = [];

  for (const { key, desc, minLength } of REQUIRED_VARS) {
    const val = process.env[key];
    if (!val || !val.trim()) {
      errors.push(`  ✗ Missing: ${key} — ${desc}`);
      continue;
    }
    if (minLength && val.trim().length < minLength) {
      errors.push(`  ✗ Too short: ${key} must be at least ${minLength} characters`);
    }
    if (key === 'JWT_SECRET') {
      const lower = val.toLowerCase();
      if (WEAK_SECRETS.some((w) => lower.includes(w))) {
        errors.push(`  ✗ Weak secret: ${key} — use a cryptographically random string`);
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLOUDINARY_API_SECRET) {
      errors.push('  ✗ Missing: CLOUDINARY_API_SECRET (required in production)');
    }
    if (!process.env.GEMINI_API_KEY) {
      errors.push('  ✗ Missing: GEMINI_API_KEY (required in production)');
    }
  }

  if (errors.length > 0) {
    console.error('\n🔴 ENV VALIDATION FAILED — fix these before starting the server:\n');
    errors.forEach((e) => console.error(e));
    console.error(
      '\nTip: Copy backend/.env.example to backend/.env and fill in real values.\n' +
      'Generate a JWT secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n'
    );
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

