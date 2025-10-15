export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasAlpha = /[A-Za-z]/.test(password);
  const hasNum = /\d/.test(password);
  return hasAlpha && hasNum;
}