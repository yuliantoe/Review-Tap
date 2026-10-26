import { Business, Card } from '../types';

/**
 * Returns the base web app URL where ReviewTap is currently running.
 * On browser, dynamically uses window.location.origin so scanned QR/NFC
 * opens the actual running web app (development, staging, or production).
 */
export const getBaseAppUrl = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'https://reviewtap.id';
};

/**
 * Direct web activation URL for a specific card code.
 * When visited on mobile/desktop, auto-fills the card code in the activation form.
 * E.g. https://domain.com/?code=K9X4M2&src=nfc
 */
export const getCardActivationWebUrl = (
  code: string,
  source: 'nfc' | 'qr' = 'qr'
): string => {
  const base = getBaseAppUrl();
  const cleanCode = code.trim().toUpperCase();
  return `${base}/?code=${encodeURIComponent(cleanCode)}&src=${source}`;
};

/**
 * Returns the target link for a card:
 * - Sebelum diaktivasi (status !== 'aktif'):
 *   Langsung mengarah ke link Web Aktivasi (https://.../?code=[KODE]&src=...)
 * - Setelah diaktivasi (status === 'aktif'):
 *   Mengarah ke link formulir Google Review bisnis yang terhubung
 */
export const getCardTargetPayload = (
  card: Pick<Card, 'code' | 'status'>,
  business?: Business | null,
  source: 'nfc' | 'qr' = 'qr'
): {
  url: string;
  isBeforeActivation: boolean;
  label: string;
} => {
  // SEBELUM DIAKTIVASI: Link langsung ke Web Aktivasi
  if (card.status !== 'aktif') {
    return {
      url: getCardActivationWebUrl(card.code, source),
      isBeforeActivation: true,
      label: 'Web Aktivasi Kartu (Otomatis Isi Kode)',
    };
  }

  // SETELAH DIAKTIVASI: Link langsung ke Google Review bisnis
  if (business?.place_id) {
    const isDirectUrl = business.place_id.startsWith('http://') || business.place_id.startsWith('https://');
    const reviewUrl = isDirectUrl
      ? business.place_id
      : `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.place_id)}`;

    return {
      url: reviewUrl,
      isBeforeActivation: false,
      label: 'Google Write Review',
    };
  }

  // Fallback jika belum punya link bisnis
  return {
    url: getCardActivationWebUrl(card.code, source),
    isBeforeActivation: true,
    label: 'Web Aktivasi Kartu',
  };
};
