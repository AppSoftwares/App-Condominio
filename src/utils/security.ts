/**
 * Utilidades básicas de seguridad para sanitización de entradas
 */

export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '').trim();
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
