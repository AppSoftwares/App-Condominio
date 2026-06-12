// Creado por Jesús Pirela.
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '').trim();
}

export const generateSecureToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
