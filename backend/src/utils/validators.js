/**
 * Common validation utilities
 */

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000;
};

export const isValidPin = (pin) => {
  return /^\d{4}$/.test(pin);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

export const sanitizeUser = (user) => {
  const { password, walletPin, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};
