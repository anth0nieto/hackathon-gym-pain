/**
 * WhatsApp number in international format, digits only. A 10-digit number without country code
 * ("11 2233 4455") is taken as an Argentine mobile and gets 549 in front.
 */
// ponytail: only Argentina is guessed; other countries must be typed with their code.
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^00/, '');
  return digits.length === 10 ? `549${digits}` : digits;
}

export const isValidPhone = (phone: string) => /^\d{11,15}$/.test(phone);

/** wa.me link that opens a chat with "Hola, <first name>" already typed. */
export const whatsappLink = (phone: string, name: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(`Hola, ${name.trim().split(/\s+/)[0]}`)}`;
