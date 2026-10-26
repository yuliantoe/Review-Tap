import { Business, Card, ScanLog } from '../types';

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz_01',
    nama: 'Kopi Kenangan Senopati',
    place_id: 'ChIJ5cK_b_b0aS4RM_12y2PZ6e0',
    pemilik_email: 'owner.senopati@kopikenangan.id',
    kategori: 'Kafe & Minuman',
    kota: 'Jakarta Selatan',
    alamat: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    rating: 4.8,
    total_ulasan_google: 1420,
    dibuat: '2026-08-10T09:00:00Z',
    no_wa: '081298765432',
  },
  {
    id: 'biz_02',
    nama: 'Resto Padang Sederhana Thamrin',
    place_id: 'ChIJ9Tf37Uf1aS4RzU4Lkq_Y0_g',
    pemilik_email: 'thamrin@sederhana.co.id',
    kategori: 'Restoran Keluarga',
    kota: 'Jakarta Pusat',
    alamat: 'Jl. M.H. Thamrin No. 8, Gondangdia, Menteng',
    rating: 4.6,
    total_ulasan_google: 2890,
    dibuat: '2026-08-15T11:20:00Z',
    no_wa: '081198761234',
  },
  {
    id: 'biz_03',
    nama: 'Bumi Artisan Bakery Dharmawangsa',
    place_id: 'ChIJX99d42v1aS4RsK6n3dY_6cM',
    pemilik_email: 'halo@bumibakery.com',
    kategori: 'Bakery & Pastry',
    kota: 'Jakarta Selatan',
    alamat: 'Jl. Dharmawangsa Raya No. 12, Pulo, Kebayoran Baru',
    rating: 4.9,
    total_ulasan_google: 640,
    dibuat: '2026-09-01T14:30:00Z',
    no_wa: '081388776655',
  },
  {
    id: 'biz_04',
    nama: 'Klinik Gigi Harmoni Kemang',
    place_id: 'ChIJg_G49Hj1aS4RVY4L2aO9t5g',
    pemilik_email: 'drg.lina@harmonidental.id',
    kategori: 'Klinik Kesehatan',
    kota: 'Jakarta Selatan',
    alamat: 'Jl. Kemang Raya No. 25B, Bangka, Mampang Prapatan',
    rating: 4.9,
    total_ulasan_google: 380,
    dibuat: '2026-09-12T08:15:00Z',
    no_wa: '081512345678',
  },
  {
    id: 'biz_05',
    nama: 'Batavia Gentlemen Barbershop',
    place_id: 'ChIJ085k2Vb0aS4RfQ8_aZq2e3k',
    pemilik_email: 'manager@bataviabarber.co.id',
    kategori: 'Perawatan Pribadi',
    kota: 'Jakarta Barat',
    alamat: 'Jl. Hayam Wuruk No. 88, Taman Sari',
    rating: 4.7,
    total_ulasan_google: 512,
    dibuat: '2026-09-20T10:00:00Z',
    no_wa: '081876543210',
  },
];

export const INITIAL_CARDS: Card[] = [
  // Active cards for Kopi Kenangan Senopati
  {
    code: 'K9X4M2',
    business_id: 'biz_01',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-02T10:14:00Z',
    dibuat: '2026-08-28T08:00:00Z',
    catatan: 'Area meja kasir',
    pin_nfc: '1234',
    no_wa: '081298765432',
  },
  {
    code: 'R7T3P1',
    business_id: 'biz_01',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-02T10:18:00Z',
    dibuat: '2026-08-28T08:00:00Z',
    catatan: 'Area pick-up barista',
    pin_nfc: '4829',
    no_wa: '081298765432',
  },
  {
    code: 'T2W8N5',
    business_id: 'biz_01',
    tipe: 'nfc',
    status: 'aktif',
    diaktifkan_pada: '2026-09-10T16:40:00Z',
    dibuat: '2026-08-28T08:00:00Z',
    pin_nfc: '5612',
    no_wa: '081298765432',
  },
  // Resto Padang Sederhana
  {
    code: 'B4L9K7',
    business_id: 'biz_02',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-05T12:00:00Z',
    dibuat: '2026-09-01T08:00:00Z',
    catatan: 'Kasir pembayaran',
    pin_nfc: '7721',
    no_wa: '081198761234',
  },
  {
    code: 'S3M8V1',
    business_id: 'biz_02',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-05T12:05:00Z',
    dibuat: '2026-09-01T08:00:00Z',
    pin_nfc: '9034',
    no_wa: '081198761234',
  },
  // Bumi Bakery
  {
    code: 'P6D2Y9',
    business_id: 'biz_03',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-15T09:30:00Z',
    dibuat: '2026-09-10T08:00:00Z',
    pin_nfc: '3319',
    no_wa: '081388776655',
  },
  // Klinik Gigi Harmoni
  {
    code: 'H8C4A3',
    business_id: 'biz_04',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-18T14:00:00Z',
    dibuat: '2026-09-10T08:00:00Z',
    pin_nfc: '8102',
    no_wa: '081512345678',
  },
  // Batavia Barbershop
  {
    code: 'V5N7Q8',
    business_id: 'biz_05',
    tipe: 'nfc_qr',
    status: 'aktif',
    diaktifkan_pada: '2026-09-25T11:20:00Z',
    dibuat: '2026-09-20T08:00:00Z',
    pin_nfc: '6543',
    no_wa: '081876543210',
  },
  // Unactivated / Baru cards (Ready for activation test in customer simulation!)
  {
    code: 'N3W001',
    business_id: null,
    tipe: 'nfc_qr',
    status: 'baru',
    diaktifkan_pada: null,
    dibuat: '2026-10-20T09:00:00Z',
    catatan: 'Belum terpasang bisnis, scan untuk aktivasi',
    pin_nfc: '1234',
  },
  {
    code: 'N3W002',
    business_id: null,
    tipe: 'nfc_qr',
    status: 'baru',
    diaktifkan_pada: null,
    dibuat: '2026-10-20T09:00:00Z',
    catatan: 'Belum terpasang bisnis, siap kirim ke mitra',
    pin_nfc: '5678',
  },
  // Nonaktif card
  {
    code: 'D1S999',
    business_id: 'biz_01',
    tipe: 'nfc_qr',
    status: 'nonaktif',
    diaktifkan_pada: '2026-09-02T10:20:00Z',
    dibuat: '2026-08-28T08:00:00Z',
    catatan: 'Dinonaktifkan sementara karena diganti',
    pin_nfc: '9999',
  },
  // Hilang card
  {
    code: 'L0S888',
    business_id: 'biz_02',
    tipe: 'nfc_qr',
    status: 'hilang',
    diaktifkan_pada: '2026-09-05T12:10:00Z',
    dibuat: '2026-08-30T09:00:00Z',
    catatan: 'Dilaporkan rusak/hilang',
    pin_nfc: '8888',
  },
];

// Helper to generate realistic 14-day history of scans
export function generateSeedScans(): ScanLog[] {
  const scans: ScanLog[] = [];
  const now = new Date('2026-10-24T21:00:00Z');
  
  // Weights per business
  const activeCards = [
    { code: 'K9X4M2', biz: 'biz_01', weight: 40 },
    { code: 'R7T3P1', biz: 'biz_01', weight: 28 },
    { code: 'T2W8N5', biz: 'biz_01', weight: 15 },
    { code: 'B4L9K7', biz: 'biz_02', weight: 35 },
    { code: 'S3M8V1', biz: 'biz_02', weight: 18 },
    { code: 'P6D2Y9', biz: 'biz_03', weight: 22 },
    { code: 'H8C4A3', biz: 'biz_04', weight: 14 },
    { code: 'V5N7Q8', biz: 'biz_05', weight: 19 },
  ];

  let logId = 1;

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now);
    dayDate.setUTCDate(dayDate.getUTCDate() - dayOffset);

    // Weekend boost
    const dayOfWeek = dayDate.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayMultiplier = isWeekend ? 1.45 : 1.0;

    // Scan volume per day between 22 and 45
    const baseDailyCount = Math.floor((24 + Math.sin(dayOffset * 0.8) * 8) * dayMultiplier);

    for (let i = 0; i < baseDailyCount; i++) {
      // Pick card based on weighted distribution
      const randomWeight = Math.random() * 191;
      let cumulative = 0;
      let chosenCard = activeCards[0];
      for (const c of activeCards) {
        cumulative += c.weight;
        if (randomWeight <= cumulative) {
          chosenCard = c;
          break;
        }
      }

      // Time distribution: peaks at lunch (11-14) and dinner/evening (17-21)
      let hour: number;
      const rHour = Math.random();
      if (rHour < 0.35) {
        hour = 11 + Math.floor(Math.random() * 4); // 11 to 14
      } else if (rHour < 0.75) {
        hour = 17 + Math.floor(Math.random() * 5); // 17 to 21
      } else {
        hour = 8 + Math.floor(Math.random() * 14); // general business hours
      }

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const scanDate = new Date(dayDate);
      scanDate.setUTCHours(hour, minute, second);

      // Source: ~68% NFC, 32% QR (as noted in typical contactless cards)
      const sumber = Math.random() < 0.68 ? 'nfc' : 'qr';
      // Device: ~56% Android, 41% iOS, 3% other
      const rDevice = Math.random();
      const perangkat = rDevice < 0.56 ? 'android' : rDevice < 0.97 ? 'ios' : 'lain';

      scans.push({
        id: `scan_${logId++}`,
        code: chosenCard.code,
        business_id: chosenCard.biz,
        waktu: scanDate.toISOString(),
        sumber,
        perangkat,
        hasil: 'redirect',
        user_agent: perangkat === 'ios' ? 'Mobile Safari / iOS 19.4' : 'Chrome Mobile / Android 16',
      });
    }

    // Add occasional unactivated or blocked attempt
    if (dayOffset % 3 === 0) {
      const scanDate = new Date(dayDate);
      scanDate.setUTCHours(15, 20, 0);
      scans.push({
        id: `scan_${logId++}`,
        code: 'N3W001',
        business_id: null,
        waktu: scanDate.toISOString(),
        sumber: 'nfc',
        perangkat: 'android',
        hasil: 'aktivasi',
      });
    }
    if (dayOffset % 5 === 0) {
      const scanDate = new Date(dayDate);
      scanDate.setUTCHours(19, 45, 0);
      scans.push({
        id: `scan_${logId++}`,
        code: 'D1S999',
        business_id: 'biz_01',
        waktu: scanDate.toISOString(),
        sumber: 'qr',
        perangkat: 'ios',
        hasil: 'ditolak',
      });
    }
  }

  // Sort chronologically descending
  return scans.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
}
