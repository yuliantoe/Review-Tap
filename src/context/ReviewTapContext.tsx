import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Business, Card, ScanLog, CardType, CardStatus, ScanSource, DeviceType, DailyStat, AdminUser, AdminCredentials } from '../types';
import { INITIAL_BUSINESSES, INITIAL_CARDS, generateSeedScans } from '../data/initialData';

export type AdminTab = 'dashboard' | 'cards' | 'businesses' | 'simulator' | 'guide';

interface SimulateScanOutcome {
  success: boolean;
  result: 'redirect' | 'aktivasi' | 'ditolak';
  message: string;
  redirectUrl?: string;
  card?: Card;
  business?: Business;
}

interface ReviewTapContextType {
  businesses: Business[];
  cards: Card[];
  scans: ScanLog[];
  activeTab: 'dashboard' | 'activation' | 'cards' | 'businesses' | 'simulator' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'activation' | 'cards' | 'businesses' | 'simulator' | 'guide') => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  filterBusinessId: string;
  setFilterBusinessId: (id: string) => void;
  timeRange: '7d' | '14d' | '30d';
  setTimeRange: (range: '7d' | '14d' | '30d') => void;

  // Admin Authentication
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  isLoginModalOpen: boolean;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  openLoginModal: (targetTab?: AdminTab) => void;
  closeLoginModal: () => void;
  loginAdmin: (username: string, password: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  updateAdminPassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  navigateToAdmin: (targetTab?: AdminTab) => void;

  // Actions
  batchCreateCards: (count: number, tipe: CardType) => Card[];
  activateCard: (code: string, businessId: string, options?: { pinNfc?: string; noWa?: string }) => boolean;
  updateCardStatus: (code: string, status: CardStatus) => void;
  updateCardBusiness: (code: string, businessId: string | null) => void;
  updateCardPin: (code: string, pin: string) => void;
  updateCardWhatsApp: (code: string, noWa: string) => void;
  deleteCard: (code: string) => void;

  addBusiness: (biz: Omit<Business, 'id' | 'dibuat'>) => Business;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;

  simulateScan: (code: string, sumber: ScanSource, perangkat?: DeviceType) => SimulateScanOutcome;
  resetToDefaults: () => void;
  exportCsv: (type: 'cards' | 'scans') => void;

  // Selected card for quick inspection or modal
  inspectCardCode: string | null;
  setInspectCardCode: (code: string | null) => void;

  // NFC Scanned code for auto-filling activation form
  scannedNfcCode: string | null;
  setScannedNfcCode: (code: string | null) => void;

  // Analytics helpers
  statsSummary: {
    totalScans: number;
    nfcScans: number;
    qrScans: number;
    nfcRatio: number;
    qrRatio: number;
    activeCardsCount: number;
    totalCardsCount: number;
    successRate: number;
    growthPercent: number;
    dailyStats: DailyStat[];
    businessScanCounts: { business: Business; scanCount: number; nfcCount: number; qrCount: number }[];
    deviceStats: { ios: number; android: number; lain: number };
  };
}

const ReviewTapContext = createContext<ReviewTapContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUSINESSES: 'reviewtap_businesses_v1',
  CARDS: 'reviewtap_cards_v1',
  SCANS: 'reviewtap_scans_v1',
  ADMIN_CREDS: 'reviewtap_admin_creds_v1',
  ADMIN_SESSION: 'reviewtap_admin_session_v1',
};

const DEFAULT_ADMIN_CREDS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
};

// Generate random unique 6-character alphanumeric code (e.g. K9X4M2)
export function generateCardCode(existingCodes: Set<string>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous chars like 0/O, 1/I
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingCodes.has(code));
  return code;
}

export const ReviewTapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
    } catch {
      return INITIAL_BUSINESSES;
    }
  });

  const [cards, setCards] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [scans, setScans] = useState<ScanLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCANS);
      return saved ? JSON.parse(saved) : generateSeedScans();
    } catch {
      return generateSeedScans();
    }
  });

  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CREDS;
    } catch {
      return DEFAULT_ADMIN_CREDS;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTabState] = useState<'dashboard' | 'activation' | 'cards' | 'businesses' | 'simulator' | 'guide'>('activation');
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return Boolean(saved);
    } catch {
      return false;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<AdminTab>('dashboard');
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [inspectCardCode, setInspectCardCode] = useState<string | null>(null);
  const [scannedNfcCode, setScannedNfcCode] = useState<string | null>(null);

  const isAdminAuthenticated = Boolean(adminUser);

  const openLoginModal = (targetTab: AdminTab = 'dashboard') => {
    setPendingTab(targetTab);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const navigateToAdmin = (targetTab: AdminTab = 'dashboard') => {
    if (isAdminAuthenticated) {
      setIsAdminModeState(true);
      setActiveTabState(targetTab);
    } else {
      openLoginModal(targetTab);
    }
  };

  const setActiveTab = (tab: 'dashboard' | 'activation' | 'cards' | 'businesses' | 'simulator' | 'guide') => {
    if (tab !== 'activation' && !isAdminAuthenticated) {
      openLoginModal(tab as AdminTab);
      return;
    }
    setActiveTabState(tab);
  };

  const setIsAdminMode = (val: boolean) => {
    if (val && !isAdminAuthenticated) {
      openLoginModal('dashboard');
      return;
    }
    setIsAdminModeState(val);
  };

  const loginAdmin = (username: string, password: string): { success: boolean; message: string } => {
    const cleanUser = username.trim();
    if (!cleanUser) {
      return { success: false, message: 'Username tidak boleh kosong.' };
    }
    if (!password) {
      return { success: false, message: 'Password tidak boleh kosong.' };
    }

    if (cleanUser.toLowerCase() === adminCreds.username.toLowerCase() && password === adminCreds.password) {
      const user: AdminUser = {
        username: adminCreds.username,
        loggedInAt: new Date().toISOString(),
      };
      setAdminUser(user);
      setIsAdminModeState(true);
      setActiveTabState(pendingTab || 'dashboard');
      setIsLoginModalOpen(false);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      } catch {
        // ignore
      }
      return { success: true, message: 'Login berhasil! Selamat datang di Dashboard Administrator.' };
    }

    return {
      success: false,
      message: 'Username atau password salah. Cek kredensial Anda atau gunakan username: admin dan password: admin123.',
    };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsAdminModeState(false);
    setActiveTabState('activation');
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch {
      // ignore
    }
  };

  const updateAdminPassword = (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (oldPassword !== adminCreds.password) {
      return { success: false, message: 'Password lama saat ini tidak cocok.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter.' };
    }

    const updated: AdminCredentials = {
      ...adminCreds,
      password: newPassword,
    };
    setAdminCreds(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true, message: 'Password administrator berhasil diperbarui!' };
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    } catch {
      // ignore
    }
  }, [businesses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans));
    } catch {
      // ignore
    }
  }, [scans]);

  // Batch Create Cards
  const batchCreateCards = (count: number, tipe: CardType): Card[] => {
    const existingCodes = new Set(cards.map((c) => c.code));
    const newCards: Card[] = [];
    const nowIso = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const code = generateCardCode(existingCodes);
      existingCodes.add(code);
      const defaultPin = String(Math.floor(1000 + Math.random() * 9000));
      const card: Card = {
        code,
        business_id: null,
        tipe,
        status: 'baru',
        diaktifkan_pada: null,
        dibuat: nowIso,
        catatan: 'Belum diaktifkan. Tulis ke NFC / Cetak QR',
        pin_nfc: defaultPin,
      };
      newCards.push(card);
    }

    setCards((prev) => [...newCards, ...prev]);
    return newCards;
  };

  // Activate Card (Step 3 & 4 in workflow)
  const activateCard = (
    code: string,
    businessId: string,
    options?: { pinNfc?: string; noWa?: string }
  ): boolean => {
    const card = cards.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!card) return false;

    const nowIso = new Date().toISOString();
    setCards((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === code.toUpperCase()) {
          return {
            ...c,
            business_id: businessId,
            status: 'aktif',
            diaktifkan_pada: nowIso,
            pin_nfc: options?.pinNfc || c.pin_nfc || '1234',
            no_wa: options?.noWa || c.no_wa,
          };
        }
        return c;
      })
    );

    // Also record an activation scan event
    const newScan: ScanLog = {
      id: `scan_${Date.now()}_act`,
      code: card.code,
      business_id: businessId,
      waktu: nowIso,
      sumber: 'nfc',
      perangkat: 'android',
      hasil: 'aktivasi',
      user_agent: 'ReviewTap Activation Portal / Mobile',
    };
    setScans((prev) => [newScan, ...prev]);

    return true;
  };

  const updateCardStatus = (code: string, status: CardStatus) => {
    setCards((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status } : c))
    );
  };

  const updateCardBusiness = (code: string, businessId: string | null) => {
    setCards((prev) =>
      prev.map((c) => (c.code === code ? { ...c, business_id: businessId } : c))
    );
  };

  const updateCardPin = (code: string, pin: string) => {
    setCards((prev) =>
      prev.map((c) => (c.code === code ? { ...c, pin_nfc: pin } : c))
    );
  };

  const updateCardWhatsApp = (code: string, noWa: string) => {
    setCards((prev) =>
      prev.map((c) => (c.code === code ? { ...c, no_wa: noWa } : c))
    );
  };

  const deleteCard = (code: string) => {
    setCards((prev) => prev.filter((c) => c.code !== code));
  };

  const addBusiness = (biz: Omit<Business, 'id' | 'dibuat'>): Business => {
    const newBiz: Business = {
      ...biz,
      id: `biz_${Date.now()}`,
      dibuat: new Date().toISOString(),
    };
    setBusinesses((prev) => [...prev, newBiz]);
    return newBiz;
  };

  const updateBusiness = (id: string, updates: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    // Unlink cards
    setCards((prev) =>
      prev.map((c) => (c.business_id === id ? { ...c, business_id: null, status: 'baru' } : c))
    );
  };

  // Simulate Scan (The core redirect logic described in markdown specs)
  /*
    GET /r/:code ?s=n (NFC) atau ?s=q (QR)
    if (!card) => 404 tidak-berlaku
    if (card.status === 'baru') => halaman aktivasi
    if (card.status !== 'aktif') => halaman tidak-berlaku
    aktif => catat scan, 302 ke Google Write Review URL
  */
  const simulateScan = (
    code: string,
    sumber: ScanSource,
    perangkat: DeviceType = 'android'
  ): SimulateScanOutcome => {
    const cleanCode = code.trim().toUpperCase();
    const card = cards.find((c) => c.code.toUpperCase() === cleanCode);
    const nowIso = new Date().toISOString();

    if (!card) {
      const deniedScan: ScanLog = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: cleanCode || 'UNKNOWN',
        business_id: null,
        waktu: nowIso,
        sumber,
        perangkat,
        hasil: 'ditolak',
        user_agent: perangkat === 'ios' ? 'Mobile Safari / iOS 19.4' : 'Chrome Mobile / Android 16',
      };
      setScans((prev) => [deniedScan, ...prev]);

      return {
        success: false,
        result: 'ditolak',
        message: 'Kode kartu tidak ditemukan dalam sistem database (404).',
      };
    }

    if (card.status === 'baru') {
      const actScan: ScanLog = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: card.code,
        business_id: null,
        waktu: nowIso,
        sumber,
        perangkat,
        hasil: 'aktivasi',
        user_agent: perangkat === 'ios' ? 'Mobile Safari / iOS 19.4' : 'Chrome Mobile / Android 16',
      };
      setScans((prev) => [actScan, ...prev]);
      setScannedNfcCode(card.code);

      return {
        success: true,
        result: 'aktivasi',
        message: 'Kartu belum aktif. Membuka formulir aktivasi ReviewTap.',
        card,
      };
    }

    if (card.status !== 'aktif') {
      const deniedScan: ScanLog = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: card.code,
        business_id: card.business_id,
        waktu: nowIso,
        sumber,
        perangkat,
        hasil: 'ditolak',
        user_agent: perangkat === 'ios' ? 'Mobile Safari / iOS 19.4' : 'Chrome Mobile / Android 16',
      };
      setScans((prev) => [deniedScan, ...prev]);

      const statusName = card.status === 'nonaktif' ? 'dinonaktifkan' : 'dilaporkan hilang';
      return {
        success: false,
        result: 'ditolak',
        message: `Kartu ini berstatus ${statusName} dan tidak dapat dialihkan ke Google.`,
        card,
      };
    }

    // Active Card: find business
    const business = businesses.find((b) => b.id === card.business_id);
    if (!business || !business.place_id) {
      return {
        success: false,
        result: 'ditolak',
        message: 'Kartu aktif tetapi Google Place ID belum dikonfigurasi.',
        card,
      };
    }

    // Success: log scan and construct Google Write Review URL
    const googleReviewUrl = business.place_id.startsWith('http://') || business.place_id.startsWith('https://')
      ? business.place_id
      : `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.place_id)}`;
    const redirectScan: ScanLog = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: card.code,
      business_id: business.id,
      waktu: nowIso,
      sumber,
      perangkat,
      hasil: 'redirect',
      user_agent: perangkat === 'ios' ? 'Mobile Safari / iOS 19.4' : 'Chrome Mobile / Android 16',
    };
    setScans((prev) => [redirectScan, ...prev]);

    return {
      success: true,
      result: 'redirect',
      message: `Berhasil diarahkan (HTTP 302) ke ulasan Google: ${business.nama}`,
      redirectUrl: googleReviewUrl,
      card,
      business,
    };
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.BUSINESSES);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.SCANS);
    setBusinesses(INITIAL_BUSINESSES);
    setCards(INITIAL_CARDS);
    setScans(generateSeedScans());
    setFilterBusinessId('all');
  };

  const exportCsv = (type: 'cards' | 'scans') => {
    if (type === 'cards') {
      const headers = ['Kode Kartu', 'Tipe', 'Status', 'Bisnis ID', 'Diaktifkan Pada', 'Dibuat', 'NDEF URL'];
      const rows = cards.map((c) => [
        c.code,
        c.tipe,
        c.status,
        c.business_id || '',
        c.diaktifkan_pada || '',
        c.dibuat,
        `https://reviewtap.id/r/${c.code}?s=${c.tipe === 'qr' ? 'q' : 'n'}`,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reviewtap_cards_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['ID', 'Kode Kartu', 'Bisnis ID', 'Waktu', 'Sumber', 'Perangkat', 'Hasil'];
      const rows = scans.map((s) => [
        s.id,
        s.code,
        s.business_id || '',
        s.waktu,
        s.sumber,
        s.perangkat,
        s.hasil,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reviewtap_scans_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Compute analytics based on selected range and business
  const statsSummary = useMemo(() => {
    const daysLimit = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date('2026-10-24T21:39:17Z');
    const cutoffDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

    // Filter scans by date and optionally by business
    const filteredScans = scans.filter((s) => {
      const scanDate = new Date(s.waktu);
      if (scanDate < cutoffDate) return false;
      if (filterBusinessId !== 'all') {
        return s.business_id === filterBusinessId;
      }
      return true;
    });

    const totalScans = filteredScans.length;
    const nfcScans = filteredScans.filter((s) => s.sumber === 'nfc').length;
    const qrScans = filteredScans.filter((s) => s.sumber === 'qr').length;
    const successfulRedirects = filteredScans.filter((s) => s.hasil === 'redirect').length;
    const successRate = totalScans > 0 ? (successfulRedirects / totalScans) * 100 : 100;

    const nfcRatio = totalScans > 0 ? (nfcScans / totalScans) * 100 : 0;
    const qrRatio = totalScans > 0 ? (qrScans / totalScans) * 100 : 0;

    // Filtered cards
    const relevantCards = filterBusinessId === 'all'
      ? cards
      : cards.filter((c) => c.business_id === filterBusinessId);

    const activeCardsCount = relevantCards.filter((c) => c.status === 'aktif').length;
    const totalCardsCount = relevantCards.length;

    // Daily breakdown for line/bar chart
    const dailyMap = new Map<string, { total: number; nfc: number; qr: number; redirects: number; activations: number; blocked: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      dailyMap.set(key, { total: 0, nfc: 0, qr: 0, redirects: 0, activations: 0, blocked: 0 });
    }

    filteredScans.forEach((s) => {
      const key = s.waktu.slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.total += 1;
        if (s.sumber === 'nfc') entry.nfc += 1;
        if (s.sumber === 'qr') entry.qr += 1;
        if (s.hasil === 'redirect') entry.redirects += 1;
        if (s.hasil === 'aktivasi') entry.activations += 1;
        if (s.hasil === 'ditolak') entry.blocked += 1;
      }
    });

    const dailyStats: DailyStat[] = Array.from(dailyMap.entries()).map(([dateStr, counts]) => {
      const [, m, d] = dateStr.split('-');
      const monthIdx = parseInt(m, 10) - 1;
      return {
        date: dateStr,
        displayDate: `${parseInt(d, 10)} ${months[monthIdx] || ''}`,
        ...counts,
      };
    });

    // Business breakdown
    const businessScanCounts = businesses.map((b) => {
      const bScans = filteredScans.filter((s) => s.business_id === b.id);
      return {
        business: b,
        scanCount: bScans.length,
        nfcCount: bScans.filter((s) => s.sumber === 'nfc').length,
        qrCount: bScans.filter((s) => s.sumber === 'qr').length,
      };
    }).sort((a, b) => b.scanCount - a.scanCount);

    // Device breakdown
    const deviceStats = {
      ios: filteredScans.filter((s) => s.perangkat === 'ios').length,
      android: filteredScans.filter((s) => s.perangkat === 'android').length,
      lain: filteredScans.filter((s) => s.perangkat === 'lain').length,
    };

    // Simulated week-over-week growth
    const growthPercent = 18.4;

    return {
      totalScans,
      nfcScans,
      qrScans,
      nfcRatio,
      qrRatio,
      activeCardsCount,
      totalCardsCount,
      successRate,
      growthPercent,
      dailyStats,
      businessScanCounts,
      deviceStats,
    };
  }, [scans, cards, businesses, timeRange, filterBusinessId]);

  return (
    <ReviewTapContext.Provider
      value={{
        businesses,
        cards,
        scans,
        activeTab,
        setActiveTab,
        isAdminMode,
        setIsAdminMode,
        filterBusinessId,
        setFilterBusinessId,
        timeRange,
        setTimeRange,

        // Admin Authentication
        isAdminAuthenticated,
        adminUser,
        isLoginModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        openLoginModal,
        closeLoginModal,
        loginAdmin,
        logoutAdmin,
        updateAdminPassword,
        navigateToAdmin,

        batchCreateCards,
        activateCard,
        updateCardStatus,
        updateCardBusiness,
        updateCardPin,
        updateCardWhatsApp,
        deleteCard,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        simulateScan,
        resetToDefaults,
        exportCsv,
        inspectCardCode,
        setInspectCardCode,
        scannedNfcCode,
        setScannedNfcCode,
        statsSummary,
      }}
    >
      {children}
    </ReviewTapContext.Provider>
  );
};

export const useReviewTap = () => {
  const context = useContext(ReviewTapContext);
  if (!context) {
    throw new Error('useReviewTap must be used within a ReviewTapProvider');
  }
  return context;
};
