import { hash } from "@node-rs/argon2";

/**
 * Generate an Argon2id hash for a password, e.g. to seed AUTH_BOOTSTRAP_PASSWORD_HASH.
 * Usage: npm run auth:hash -- "my-strong-password"
 */
const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run auth:hash -- "<password>"');
  process.exit(1);
}

hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 })
  .then((h) => console.log(h))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
