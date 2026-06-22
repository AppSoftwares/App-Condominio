// Creado por Jesús Pirela.
/**
 * Sanitiza una cadena eliminando caracteres potencialmente peligrosos.
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '') // Elimina etiquetas HTML básicas
    .replace(/['";]/g, '') // Previene inyecciones simples de SQL/JS
    .trim();
}

/**
 * Valida si un correo tiene un formato correcto.
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export const generateSecureToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
