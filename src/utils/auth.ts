// Define types for the global window object
declare global {
  interface Window {
    handleLogin: (email: string, password: string, isAdmin: boolean) => boolean;
  }
}

// Admin emails whitelist
const ADMIN_EMAILS = [
  'ikoroeric2@gmail.com',
  'tpad663@gmail.com',
  'honoureboiye@gmail.com',
  'kingscaleb33@gmail.com',
  'admin@remos.edu.ng'
];
const ADMIN_PASSWORD = 'Nwabueze1#';
const CUSTOMER_PASSWORD = 'password';

// Validate customer email domain
const isValidCustomerEmail = (email: string) => {
  return email.endsWith('@Gmail.com');
};

// Validate if email is in admin whitelist
export const isValidAdminEmail = (email: string) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Generate a random verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Login helper function
window.handleLogin = function(email: string, password: string, isAdmin: boolean) {
  if (isAdmin) {
    // Admin login validation
    if (!isValidAdminEmail(email)) {
      throw new Error('Admin access restricted. Please use an authorized admin email.');
    }

    if (password !== ADMIN_PASSWORD) {
      throw new Error('Invalid password. Admin password required.');
    }
  } else {
    // Customer login validation
    if (!isValidCustomerEmail(email)) {
      throw new Error('Please use your Caleb University email (@calebuniversity.edu.ng).');
    }

    if (password !== CUSTOMER_PASSWORD) {
      throw new Error(`Invalid password. Default password is "${CUSTOMER_PASSWORD}".`);
    }
  }

  // Simulate successful login
  return true;
};

// Export login helper for TypeScript imports
export const handleLogin = window.handleLogin;
