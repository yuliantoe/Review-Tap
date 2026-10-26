import React, { useState, useEffect, useRef } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { parseGoogleReviewInput, formatWhatsAppNumber } from '../utils/googleReviewHelper';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  Link2,
  ClipboardPaste,
  AlertCircle,
  Radio,
  Smartphone,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ArrowUpRight,
  Star,
} from 'lucide-react';

export const CardActivationView: React.FC = () => {
  const { cards, businesses, activateCard, addBusiness, scannedNfcCode, setScannedNfcCode, setActiveTab } = useReviewTap();
  const formRef = useRef<HTMLDivElement>(null);

  // Form states:
  // 1. Kode Kartu
  // 2. Nama Bisnis (bisa diisi nama atau link Google Maps yang akan otomatis terkonversi)
  // 3. Tautan Google Review
  // 4. PIN Proteksi NFC Tag
  // 5. Nomor WhatsApp
  const [cardCode, setCardCode] = useState<string>('');
  const [manualBizName, setManualBizName] = useState<string>('');
  const [manualReviewLink, setManualReviewLink] = useState<string>('');
  const [pinNfc, setPinNfc] = useState<string>('1234');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [noWhatsApp, setNoWhatsApp] = useState<string>('');

  const [copiedSuccess, setCopiedSuccess] = useState<string | null>(null);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nfcSuccessFeedback, setNfcSuccessFeedback] = useState<string | null>(null);
  const [isNfcScanning, setIsNfcScanning] = useState<boolean>(false);
  const [nfcStatusNote, setNfcStatusNote] = useState<string | null>(null);

  // Status states
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [activatedCardData, setActivatedCardData] = useState<{
    code: string;
    bizName: string;
    placeId: string;
    directReviewUrl: string;
    pinNfc: string;
    noWa?: string;
  } | null>(null);

  const hasWebNfc = typeof window !== 'undefined' && 'NDEFReader' in window;

  // 1. Auto-read code from URL query parameters (when NFC tag or QR redirects to activation page)
  // or from Context scannedNfcCode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('c') || params.get('card');
      const srcParam = params.get('src') || params.get('s');
      if (urlCode && urlCode.trim()) {
        const clean = urlCode.trim().toUpperCase();
        setCardCode(clean);
        const sourceLabel = srcParam === 'qr' || srcParam === 'q' ? 'QR Code' : 'NFC';
        setNfcSuccessFeedback(`Kode kartu #${clean} terbaca otomatis dari link ${sourceLabel}! Silakan lengkapi formulir di bawah untuk mengaktifkan kartu.`);
        return;
      }
    }

    if (scannedNfcCode) {
      setCardCode(scannedNfcCode.toUpperCase());
      setNfcSuccessFeedback(`Kode kartu #${scannedNfcCode} terbaca otomatis! Silakan lengkapi formulir di bawah untuk mengaktifkan kartu.`);
    }
  }, [scannedNfcCode]);

  // Selected card
  const currentCard = cards.find((c) => c.code.toUpperCase() === cardCode.trim().toUpperCase());

  // Auto populate PIN & WA if card already has existing values
  useEffect(() => {
    if (currentCard) {
      if (currentCard.pin_nfc) {
        setPinNfc(currentCard.pin_nfc);
      }
      if (currentCard.no_wa) {
        setNoWhatsApp(currentCard.no_wa);
      }
    }
  }, [cardCode, cards]);

  // Handle Web NFC API scan
  const handleStartWebNfc = async () => {
    if (!hasWebNfc) {
      handleSimulateNfcTap();
      return;
    }

    try {
      setIsNfcScanning(true);
      setNfcStatusNote('Sensor NFC Aktif: Dekatkan kartu NFC ke bagian belakang ponsel Anda...');
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        try {
          let detected = '';
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const txt = textDecoder.decode(record.data);
              const m = txt.match(/([A-Za-z0-9]{6})/);
              if (m) detected = m[1].toUpperCase();
            } else if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              const url = textDecoder.decode(record.data);
              const m = url.match(/\/r\/([A-Za-z0-9]{6})/i) || url.match(/[?&]code=([A-Za-z0-9]{6})/i) || url.match(/([A-Za-z0-9]{6})/);
              if (m) detected = m[1].toUpperCase();
            }
          }

          if (detected) {
            setCardCode(detected);
            setScannedNfcCode(detected);
            setNfcSuccessFeedback(`Kartu NFC #${detected} terdeteksi dan kode terisi otomatis!`);
            setNfcStatusNote(null);
            setIsNfcScanning(false);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }
        } catch (err) {
          console.error('Error reading NFC record', err);
        }
      };

      ndef.onreadingerror = () => {
        setNfcStatusNote('Kartu tidak terbaca. Harap tempelkan kembali kartu ke sensor ponsel.');
      };
    } catch {
      setIsNfcScanning(false);
      setNfcStatusNote('Sensor NFC tidak aktif atau izin ditolak. Menggunakan simulasi baca otomatis.');
      handleSimulateNfcTap();
    }
  };

  // Simulated NFC Tap for quick demonstration & non-WebNFC devices
  const handleSimulateNfcTap = () => {
    setIsNfcScanning(true);
    setNfcStatusNote('Membaca chip NFC kartu fisik...');

    setTimeout(() => {
      const unactivatedCards = cards.filter((c) => c.status === 'baru');
      const targetCode = unactivatedCards[0]?.code || 'N3W001';

      setCardCode(targetCode);
      setScannedNfcCode(targetCode);
      setIsNfcScanning(false);
      setNfcStatusNote(null);
      setNfcSuccessFeedback(`Kartu NFC #${targetCode} berhasil dibaca otomatis melalui sensor!`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 450);
  };

  // Parse manual review input in real-time
  const parsedManualReview = parseGoogleReviewInput(manualReviewLink);
  const waFormatted = formatWhatsAppNumber(noWhatsApp);

  // Smart handler: Nama Bisnis berisi tautan link google map dan akan terkonversi menjadi google review
  const handleBizNameChange = (val: string) => {
    setFormError(null);
    const isUrl = val.includes('http://') || val.includes('https://') || val.includes('maps.google') || val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps');
    
    if (isUrl) {
      const parsed = parseGoogleReviewInput(val);
      if (parsed.extractedBizName) {
        setManualBizName(parsed.extractedBizName);
      } else {
        setManualBizName(val);
      }
      if (parsed.directReviewUrl) {
        setManualReviewLink(parsed.directReviewUrl);
        setPasteFeedback('⚡ Tautan Google Maps di Nama Bisnis berhasil dikonversi menjadi Google Review!');
        setTimeout(() => setPasteFeedback(null), 4000);
      }
    } else {
      setManualBizName(val);
    }
  };

  const handleBizNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text && (text.includes('http') || text.includes('maps') || text.includes('goo.gl'))) {
      const parsed = parseGoogleReviewInput(text.trim());
      if (parsed.extractedBizName) {
        e.preventDefault();
        setManualBizName(parsed.extractedBizName);
      }
      if (parsed.directReviewUrl) {
        setManualReviewLink(parsed.directReviewUrl);
        setPasteFeedback('⚡ Tautan Google Maps berhasil terkonversi menjadi Nama Bisnis & Google Review!');
        setTimeout(() => setPasteFeedback(null), 4000);
      }
    }
  };

  // Handle paste review link directly
  const handlePasteReviewLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmedText = text.trim();
          const parsed = parseGoogleReviewInput(trimmedText);
          setManualReviewLink(trimmedText);
          if (!manualBizName.trim() && parsed.extractedBizName) {
            setManualBizName(parsed.extractedBizName);
          }
          setPasteFeedback('Link berhasil ditempel! Tautan Google Maps terkonversi ke Google Review langsung.');
          setTimeout(() => setPasteFeedback(null), 3500);
          return;
        }
      }
    } catch {
      // clipboard read denied or unsupported
    }
    setPasteFeedback('Silakan gunakan Ctrl+V / Tempel pada kolom input.');
    setTimeout(() => setPasteFeedback(null), 3000);
  };

  // Generate random 4-digit PIN for NFC Tag
  const handleGenerateRandomPin = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    setPinNfc(randomPin);
    setPasteFeedback(`PIN NFC Tag baru digenerate: ${randomPin}`);
    setTimeout(() => setPasteFeedback(null), 2500);
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!cardCode.trim()) {
      setFormError('Harap scan kartu NFC atau masukkan kode kartu yang akan diaktifkan.');
      return;
    }
    if (!manualBizName.trim()) {
      setFormError('Harap masukkan nama bisnis atau tempel link Google Maps.');
      return;
    }
    if (!parsedManualReview.placeId) {
      setFormError('Harap masukkan tautan Google Maps / Review atau Place ID yang valid.');
      return;
    }
    if (!pinNfc.trim()) {
      setFormError('Harap masukkan PIN proteksi NFC Tag (minimal 4 digit angka).');
      return;
    }

    // Check if place_id already exists in businesses
    const existingBiz = businesses.find(
      (b) => b.place_id.toLowerCase() === parsedManualReview.placeId.toLowerCase()
    );

    let targetBizId: string;
    let finalBizName = manualBizName.trim();
    let finalPlaceId = parsedManualReview.placeId;

    const cleanWa = waFormatted.cleanNumber || noWhatsApp.trim();

    if (existingBiz) {
      targetBizId = existingBiz.id;
      finalBizName = existingBiz.nama;
      finalPlaceId = existingBiz.place_id;
    } else {
      const newBiz = addBusiness({
        nama: manualBizName.trim(),
        place_id: parsedManualReview.placeId,
        alamat: `${manualBizName.trim()}, Indonesia`,
        kota: 'Indonesia',
        kategori: 'Gerai Bisnis',
        pemilik_email: `owner@${manualBizName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bisnis'}.id`,
        rating: 5.0,
        total_ulasan_google: 1,
        no_wa: cleanWa || undefined,
      });
      targetBizId = newBiz.id;
      finalBizName = newBiz.nama;
      finalPlaceId = newBiz.place_id;
    }

    setIsActivating(true);

    setTimeout(() => {
      const ok = activateCard(cardCode.trim().toUpperCase(), targetBizId, {
        pinNfc: pinNfc.trim(),
        noWa: cleanWa || undefined,
      });
      setIsActivating(false);

      if (ok) {
        setActivationSuccess(true);
        setActivatedCardData({
          code: cardCode.trim().toUpperCase(),
          bizName: finalBizName,
          placeId: finalPlaceId,
          directReviewUrl: parsedManualReview.directReviewUrl,
          pinNfc: pinNfc.trim(),
          noWa: cleanWa || undefined,
        });
        setScannedNfcCode(null);
      }
    }, 350);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(label);
    setTimeout(() => setCopiedSuccess(null), 2500);
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO SHOWCASE SECTION (Inspired by reference image) */}
      <section className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Bold Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-stone-900 tracking-tight leading-[1.08]">
                Fueling Brands for the{' '}
                <span className="text-[#FF6B35] relative inline-block">
                  Google Review
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-[#FF6B35]"
                    height="10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,7 Q50,1 100,7"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>{' '}
                Age.
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl pt-2">
                Hubungkan kartu fisik NFC dan stiker QR ke formulir ulasan Google secara instan.
                Cukup tempelkan link Google Maps, sistem otomatis mengonversinya ke tautan ulasan bintang 5 lengkap dengan PIN chip NFC dan WhatsApp.
              </p>
            </div>

            {/* Twin Action Buttons + Starburst Deco */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="px-7 py-3 text-xs sm:text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] rounded-full shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Aktivasi Sekarang
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className="px-6 py-3 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
              >
                Simulasi Scan
              </button>

              {/* Decorative Warm Starburst matching reference image */}
              <div className="hidden sm:block ml-2 text-[#FF7A45]/40">
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                  <path d="M24 0V48M0 24H48M7 7L41 41M7 41L41 7M12 2L36 46M2 12L46 36M36 2L12 46M46 12L2 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Card with Floating Reviews Sparkline */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-amber-100 via-orange-50 to-stone-100 border border-stone-200/80 shadow-md aspect-[4/3] flex items-center justify-center p-6">
              {/* Background preview illustration */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-85 mix-blend-multiply"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent" />

              {/* Floating Overlay Card matching the reference preview */}
              <div className="relative z-10 w-full max-w-[280px] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-100/90 space-y-3 self-end mb-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Google Review</span>
                  </span>
                  <span className="text-[10px] text-stone-400">Okt – Feb ▾</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-black text-stone-900 tracking-tight">★ 15,560.00</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">+18.4% bulan ini</span>
                  </div>
                  <span className="px-2 py-0.5 bg-stone-900 text-white font-mono text-[10px] font-bold rounded-full">
                    1800
                  </span>
                </div>

                {/* Sparkline curve wave */}
                <div className="h-10 w-full pt-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                    <path
                      d="M0,32 Q25,35 50,22 T100,24 T150,8 T200,16"
                      fill="none"
                      stroke="#1C1917"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="150" cy="8" r="3.5" fill="#FF6B35" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE BENTO HIGHLIGHT CARDS (Identical to reference image composition) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento 1: Dark Espresso Gradient Card with Avatars */}
        <div className="md:col-span-5 bg-gradient-to-r from-stone-950 via-stone-900 to-[#7c2d12] rounded-3xl p-6 text-white flex flex-col justify-between shadow-sm min-h-[140px]">
          <div className="flex items-center justify-between gap-4">
            {/* Overlapping avatar faces */}
            <div className="flex -space-x-3 overflow-hidden">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-stone-900 object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Avatar 1"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-stone-900 object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Avatar 2"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-stone-900 object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="Avatar 3"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-stone-900 object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Avatar 4"
              />
            </div>

            <div>
              <span className="text-3xl font-black tracking-tight text-white block">305K+</span>
              <p className="text-[11px] text-stone-300 font-normal leading-tight mt-0.5">
                Happy clients and successful transactions
              </p>
            </div>
          </div>
        </div>

        {/* Bento 2: Soft Peach Card */}
        <div className="md:col-span-3 bg-[#FDEEE9] rounded-3xl p-6 flex flex-col justify-between shadow-xs min-h-[140px]">
          <span className="text-3xl lg:text-4xl font-black text-[#FF6B35] tracking-tight">
            600K+
          </span>
          <p className="text-xs font-semibold text-stone-800">
            Clients & Kartu Aktif
          </p>
        </div>

        {/* Bento 3: Solid Vivid Warm Orange Card with Geometric Watermark */}
        <div className="md:col-span-4 bg-[#FF6B35] rounded-3xl p-6 text-white flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="opacity-80">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="18" r="8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/90" />
          </div>

          <div>
            <span className="text-3xl lg:text-4xl font-black text-white tracking-tight block">
              50K+
            </span>
            <p className="text-[11px] text-white/90 font-medium leading-tight mt-0.5">
              350 Contributions in the last year · Ulasan Google Bintang 5
            </p>
          </div>
        </div>
      </section>

      {/* 3. ACTIVATION FORM SECTION */}
      <section ref={formRef} id="activation-form" className="pt-2 scroll-mt-6">
        <div className="bg-[#FAF8F5] p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>Formulir Aktivasi Kartu NFC & QR</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35] text-white px-2.5 py-0.5 rounded-full">
                  Instan
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Lengkapi data di bawah ini untuk mengaktifkan kartu dan menghubungkannya langsung ke formulir ulasan Google.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateRandomPin}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Acak PIN NFC</span>
            </button>
          </div>

          {!activationSuccess ? (
            <form onSubmit={handleActivateSubmit} className="space-y-6">
              {/* FIELD 1: KODE KARTU (AUTO READ VIA NFC) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Kode Kartu *</span>
                  </label>
                  {currentCard && (
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        currentCard.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : currentCard.status === 'baru'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      Status: {currentCard.status === 'baru' ? 'Siap Diaktifkan' : currentCard.status}
                    </span>
                  )}
                </div>

                {/* NFC Sensor Auto-Read Callout */}
                <div className="p-3.5 bg-[#FFF0EB] border border-[#FFD9CC] rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-stone-900">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF6B35] shadow-2xs shrink-0">
                      <Radio className={`w-4 h-4 ${isNfcScanning ? 'animate-ping' : 'animate-pulse'}`} />
                    </div>
                    <div>
                      <span className="font-semibold block text-stone-900">
                        Deteksi NFC Otomatis
                      </span>
                      <span className="text-[11px] text-stone-600">
                        {isNfcScanning
                          ? 'Mendengarkan chip NFC... Dekatkan kartu ke ponsel'
                          : 'Tempelkan kartu ke HP untuk membaca kode otomatis'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={hasWebNfc ? handleStartWebNfc : handleSimulateNfcTap}
                    className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>{hasWebNfc ? 'Mulai Scan NFC' : 'Simulasi Tap NFC'}</span>
                  </button>
                </div>

                {/* NFC Feedback alerts */}
                {nfcSuccessFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{nfcSuccessFeedback}</span>
                  </div>
                )}

                {nfcStatusNote && (
                  <p className="text-[11px] text-[#FF6B35] animate-in fade-in">
                    {nfcStatusNote}
                  </p>
                )}

                <input
                  type="text"
                  required
                  maxLength={6}
                  value={cardCode}
                  onChange={(e) => {
                    setCardCode(e.target.value.toUpperCase());
                    setNfcSuccessFeedback(null);
                  }}
                  placeholder="Kode kartu otomatis terisi saat tap NFC atau ketik manual (misal: N3W001)"
                  className="w-full text-base font-mono font-bold tracking-widest uppercase p-3 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
                />
              </div>

              {/* FIELD 2: NAMA BISNIS (DAPAT BERISI TAUTAN LINK GOOGLE MAPS DAN TERKONVERSI JADI GOOGLE REVIEW) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Nama Bisnis / Tautan Google Maps *</span>
                  </label>
                  <span className="text-[10px] font-semibold text-[#FF6B35] bg-[#FFF0EB] px-2.5 py-0.5 rounded-full border border-[#FFD9CC]">
                    ⚡ Auto-Convert Google Maps → Review
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={manualBizName}
                  onChange={(e) => handleBizNameChange(e.target.value)}
                  onPaste={handleBizNamePaste}
                  placeholder="Ketik Nama Toko ATAU Tempel Link Google Maps (misal: https://maps.app.goo.gl/...)"
                  className="w-full text-sm font-medium p-3 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 placeholder:font-normal placeholder:text-stone-400"
                />
                <p className="text-[11px] text-stone-500">
                  💡 <strong>Tips:</strong> Anda dapat langsung menempelkan link Google Maps di sini, sistem akan otomatis mengekstrak Nama Toko dan mengonversinya menjadi tautan Google Review langsung.
                </p>
              </div>

              {/* FIELD 3: TAUTAN GOOGLE REVIEW */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Tautan Google Review / Maps *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteReviewLink}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B35] hover:text-[#F25A24] cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Tempel dari Clipboard</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={manualReviewLink}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManualReviewLink(val);
                      setFormError(null);
                      if (val.trim()) {
                        const p = parseGoogleReviewInput(val.trim());
                        if (!manualBizName.trim() && p.extractedBizName) {
                          setManualBizName(p.extractedBizName);
                        }
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text && text.trim()) {
                        const parsed = parseGoogleReviewInput(text.trim());
                        if (!manualBizName.trim() && parsed.extractedBizName) {
                          setManualBizName(parsed.extractedBizName);
                        }
                        setPasteFeedback('Link Google Maps / Review ditempel! Otomatis terkonversi ke form ulasan.');
                        setTimeout(() => setPasteFeedback(null), 3000);
                      }
                    }}
                    placeholder="Tempel link Google Maps atau Review (https://search.google.com/local/writereview?placeid=... atau https://maps.app.goo.gl/...)"
                    className="w-full text-xs font-mono p-3 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 placeholder:text-stone-400"
                  />
                </div>

                {pasteFeedback && (
                  <p className="text-[11px] text-[#FF6B35] font-medium animate-in fade-in">
                    {pasteFeedback}
                  </p>
                )}

                {/* Automatic Direct Google Review Link Generation Indicator */}
                {manualReviewLink.trim() && (
                  <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-2.5 animate-in fade-in shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
                        <span>Hasil Konversi Google Review Otomatis:</span>
                      </span>
                      <span className="text-[10px] font-semibold bg-[#FFF0EB] text-[#FF6B35] border border-[#FFD9CC] px-2.5 py-0.5 rounded-full">
                        Form Ulasan Langsung (5-Bintang)
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-stone-800 font-medium truncate max-w-[340px]">
                        {parsedManualReview.directReviewUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          copyToClipboard(parsedManualReview.directReviewUrl, 'link');
                          setPasteFeedback('Tautan ulasan langsung berhasil disalin!');
                          setTimeout(() => setPasteFeedback(null), 2500);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-[10px] font-semibold shrink-0 cursor-pointer flex items-center gap-1 border border-stone-200"
                      >
                        {copiedSuccess === 'link' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100">
                      <p className="text-[11px] text-stone-600 leading-tight">
                        {parsedManualReview.label}
                      </p>
                      <a
                        href={parsedManualReview.directReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] px-3 py-1.5 rounded-full shadow-2xs transition-colors shrink-0"
                      >
                        <span>Uji Buka Form Review Google</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD 4 & 5: PIN UNTUK NFC TAG & NO WHATSAPP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                {/* FIELD 4: PIN UNTUK NFC TAG */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>PIN NFC Tag *</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPin}
                      className="text-[10px] font-semibold text-[#FF6B35] hover:text-[#F25A24] flex items-center gap-1 cursor-pointer"
                      title="Buat PIN 4-digit acak"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Acak PIN</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={pinNfc}
                      onChange={(e) => {
                        const cleanDigits = e.target.value.replace(/[^0-9]/g, '');
                        setPinNfc(cleanDigits);
                      }}
                      placeholder="misal: 1234"
                      className="w-full text-sm font-mono font-bold tracking-widest p-3 pr-10 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    PIN proteksi chip NFC (password tulis NDEF) agar tidak bisa diubah tanpa izin.
                  </p>
                </div>

                {/* FIELD 5: NO WHATSAPP */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>No WhatsApp Pemilik / Bisnis</span>
                    </label>
                    {waFormatted.isValid && (
                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      value={noWhatsApp}
                      onChange={(e) => setNoWhatsApp(e.target.value)}
                      placeholder="081234567890 atau 628..."
                      className="w-full text-xs font-medium p-3 pl-9 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 placeholder:text-stone-400"
                    />
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {waFormatted.isValid ? (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-stone-600 font-mono">{waFormatted.displayNumber}</span>
                      <a
                        href={waFormatted.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Uji Chat WA</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400">
                      Nomor WhatsApp untuk koordinasi aktivasi kartu dan customer service.
                    </p>
                  )}
                </div>
              </div>

              {/* Validation Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={
                    isActivating ||
                    !cardCode.trim() ||
                    !manualBizName.trim() ||
                    !parsedManualReview.placeId ||
                    !pinNfc.trim()
                  }
                  className="px-8 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] rounded-full shadow-md shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isActivating ? (
                    <span>Memproses Aktivasi...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Aktifkan Kartu Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success View */
            <div className="py-6 space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Kartu #{activatedCardData?.code} Berhasil Diaktifkan!
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Kartu fisik NFC dan QR telah terhubung ke <strong>{activatedCardData?.bizName}</strong>. Setiap pelanggan yang menempelkan ponsel atau memindai kode akan langsung diarahkan ke form ulasan Google.
                </p>
              </div>

              {/* Activation Summary Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 text-xs space-y-3 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Kode Kartu:</span>
                    <span className="font-mono text-sm font-bold text-stone-900">#{activatedCardData?.code}</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Nama Bisnis:</span>
                    <span className="font-semibold text-sm text-stone-900 truncate block">{activatedCardData?.bizName}</span>
                  </div>

                  {/* PIN NFC TAG */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-[#FF6B35]" />
                        <span>PIN Proteksi NFC Tag:</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-[#FF6B35] tracking-wider">
                        {activatedCardData?.pinNfc}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activatedCardData?.pinNfc || '', 'pin')}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 rounded-lg text-[10px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer border border-stone-200"
                    >
                      {copiedSuccess === 'pin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>

                  {/* NO WHATSAPP */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>No WhatsApp:</span>
                      </span>
                      <span className="font-mono text-xs font-semibold text-stone-800">
                        {activatedCardData?.noWa ? formatWhatsAppNumber(activatedCardData.noWa).displayNumber : 'Belum diisi'}
                      </span>
                    </div>
                    {activatedCardData?.noWa && (
                      <a
                        href={formatWhatsAppNumber(activatedCardData.noWa).waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span>Chat WA</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Direct Review Link */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Tautan Google Review Langsung:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-[#FF6B35] truncate max-w-[340px] font-medium">
                      {activatedCardData?.directReviewUrl}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activatedCardData?.directReviewUrl || '', 'review_url')}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 rounded-lg text-[10px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer border border-stone-200"
                      >
                        {copiedSuccess === 'review_url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                      <a
                        href={activatedCardData?.directReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#FF6B35] hover:bg-[#F25A24] text-white rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span>Buka Form</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setActivationSuccess(false);
                    setCardCode('');
                    setManualBizName('');
                    setManualReviewLink('');
                    setNoWhatsApp('');
                    setNfcSuccessFeedback(null);
                  }}
                  className="px-6 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-full transition-colors shadow-2xs cursor-pointer"
                >
                  Aktifkan Kartu Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

