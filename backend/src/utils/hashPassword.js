import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Hash wallet PIN using bcrypt
 */
export const hashPin = async (pin) => {
  return await bcrypt.hash(pin.toString(), SALT_ROUNDS);
};

/**
 * Compare PIN with hashed PIN
 */
export const comparePin = async (pin, hashedPin) => {
  return await bcrypt.compare(pin.toString(), hashedPin);
};
