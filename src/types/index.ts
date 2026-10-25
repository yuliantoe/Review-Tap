export type CardType = 'nfc' | 'qr' | 'nfc_qr';

export type CardStatus = 'baru' | 'aktif' | 'nonaktif' | 'hilang';

export type ScanSource = 'nfc' | 'qr';

export type DeviceType = 'ios' | 'android' | 'lain';

export type ScanResult = 'redirect' | 'aktivasi' | 'ditolak';

export interface Business {
  id: string;
  nama: string;
  place_id: string;
  pemilik_email: string;
  kategori: string;
  kota: string;
  alamat: string;
  rating: number;
  total_ulasan_google: number;
  dibuat: string;
}

export interface Card {
  code: string; // PK, 6 chars (e.g., 'K9X4M2')
  business_id: string | null;
  tipe: CardType;
  status: CardStatus;
  diaktifkan_pada: string | null;
  dibuat: string;
  catatan?: string;
}

export interface ScanLog {
  id: string;
  code: string;
  business_id: string | null;
  waktu: string; // ISO string
  sumber: ScanSource;
  perangkat: DeviceType;
  hasil: ScanResult;
  user_agent?: string;
  ip_pseudo?: string;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "14 Okt"
  total: number;
  nfc: number;
  qr: number;
  redirects: number;
  activations: number;
  blocked: number;
}

export interface AdminUser {
  username: string;
  loggedInAt: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

