// Creado por Jesús Pirela.

const TITLE_REGEX = /\b(sr\.?|sra\.?|lcdo\.?|lcda\.?|lic\.?|ing\.?|dr\.?|dra\.?|prof\.?|tec\.?)\b/i;
const ID_REGEX = /\b(v-|e-|j-|g-|p-)?\d{6,10}\b/i;
const PHONE_REGEX = /\b(0414|0424|0412|0416|0426|0212)\d{7}\b|\+\d{10,13}/i;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

export function detectPersonalData(concept: string): boolean {
  if (!concept) return false;
  if (TITLE_REGEX.test(concept)) return true;
  if (ID_REGEX.test(concept)) return true;
  if (PHONE_REGEX.test(concept)) return true;
  if (EMAIL_REGEX.test(concept)) return true;

  // Check for 2+ consecutive capitalized words (e.g. "Juan Perez")
  const words = concept.split(/\s+/);
  let consecutiveCapCount = 0;
  for (const word of words) {
    if (word.length > 1 && /^[A-ZÁÉÍÓÚÑ]/.test(word) && !/^(BS|USD|ZELLE|PAGO|MANTENIMIENTO|CUOTA|MES|ANTERIOR|TOTAL|GASTO|INGRESO|REF|BANCO|TRANSFERENCIA|DIVISAS)$/.test(word.toUpperCase())) {
      consecutiveCapCount++;
      if (consecutiveCapCount >= 2) return true;
    } else {
      consecutiveCapCount = 0;
    }
  }

  return false;
}

export function redactPersonalData(concept: string): string {
  if (!concept) return '';
  let redacted = concept;
  redacted = redacted.replace(EMAIL_REGEX, '[EMAIL_RESERVADO]');
  redacted = redacted.replace(PHONE_REGEX, '[TEL_RESERVADO]');
  redacted = redacted.replace(ID_REGEX, '[CEDULA_RESERVADA]');
  redacted = redacted.replace(TITLE_REGEX, '[TITULO]');

  const words = redacted.split(/\s+/);
  const cleanedWords = words.map(word => {
    if (word.length > 1 && /^[A-ZÁÉÍÓÚÑ]/.test(word) && !/^(BS|USD|ZELLE|PAGO|MANTENIMIENTO|CUOTA|MES|ANTERIOR|TOTAL|GASTO|INGRESO|REF|CONCEPTO|FECHA|BANCO|TRANSFERENCIA|DIVISAS)$/.test(word.toUpperCase())) {
      return '[RESERVADO]';
    }
    return word;
  });

  return cleanedWords.join(' ');
}
