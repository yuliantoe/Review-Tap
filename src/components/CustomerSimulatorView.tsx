import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { ScanSource, DeviceType, Card } from '../types';
import { getCardTargetPayload } from '../utils/cardUrlHelper';
import {
  Smartphone,
  Radio,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Star,
  ExternalLink,
  ShieldCheck,
  Building2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const CustomerSimulatorView: React.FC = () => {
  const { cards, businesses, simulateScan, activateCard, setActiveTab, setIsAdminMode, setScannedNfcCode } = useReviewTap();

  const [selectedCode, setSelectedCode] = useState<string>(cards[0]?.code || 'K9X4M2');
  const [source, setSource] = useState<ScanSource>('nfc');
  const [device, setDevice] = useState<DeviceType>('android');

  // Simulator Screen State
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'scanning' | 'redirecting' | 'destination'>('idle');
  const [lastOutcome, setLastOutcome] = useState<{
    success: boolean;
    result: 'redirect' | 'aktivasi' | 'ditolak';
    message: string;
    redirectUrl?: string;
    card?: Card;
    businessName?: string;
    businessPlaceId?: string;
    rating?: number;
  } | null>(null);

  // In-phone review simulation state
  const [stars, setStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('Pelayanan sangat cepat, rasa kopi mantap dan tempatnya nyaman sekali!');
  const [reviewSent, setReviewSent] = useState<boolean>(false);

  // In-phone activation state
  const [activationBizId, setActivationBizId] = useState<string>(businesses[0]?.id || '');
  const [activationComplete, setActivationComplete] = useState<boolean>(false);

  const currentCard = cards.find((c) => c.code.toUpperCase() === selectedCode.trim().toUpperCase());

  const runSimulation = (overrideCode?: string, overrideSource?: ScanSource) => {
    const codeToUse = overrideCode || selectedCode;
    const sourceToUse = overrideSource || source;

    setIsSimulating(true);
    setCurrentStep('scanning');
    setReviewSent(false);
    setActivationComplete(false);

    // Step 1: Scanning / Tag reading
    setTimeout(() => {
      setCurrentStep('redirecting');

      // Call context simulateScan which updates real scans list
      const outcome = simulateScan(codeToUse, sourceToUse, device);

      // Step 2: Show redirect transition
      setTimeout(() => {
        const biz = businesses.find((b) => b.id === outcome.card?.business_id);
        setLastOutcome({
          success: outcome.success,
          result: outcome.result,
          message: outcome.message,
          redirectUrl: outcome.redirectUrl,
          card: outcome.card,
          businessName: biz?.nama,
          businessPlaceId: biz?.place_id,
          rating: biz?.rating || 4.8,
        });
        setCurrentStep('destination');
        setIsSimulating(false);
      }, 750);
    }, 600);
  };

  const handleInPhoneActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastOutcome?.card || !activationBizId) return;

    activateCard(lastOutcome.card.code, activationBizId);
    setActivationComplete(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Uji Sebagai Pelanggan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi interaktif apa yang terjadi saat kartu ditempel via NFC atau QR dipindai oleh pelanggan.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const active = cards.find((c) => c.status === 'aktif');
              if (active) {
                setSelectedCode(active.code);
                runSimulation(active.code, 'nfc');
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors whitespace-nowrap"
          >
            Tes Kartu Aktif
          </button>
          <button
            onClick={() => {
              const unactivated = cards.find((c) => c.status === 'baru');
              if (unactivated) {
                setSelectedCode(unactivated.code);
                runSimulation(unactivated.code, 'nfc');
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors whitespace-nowrap"
          >
            Tes Belum Aktif
          </button>
          <button
            onClick={() => {
              const disabled = cards.find((c) => c.status === 'nonaktif' || c.status === 'hilang');
              if (disabled) {
                setSelectedCode(disabled.code);
                runSimulation(disabled.code, 'qr');
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors whitespace-nowrap"
          >
            Tes Kartu Nonaktif
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Control Panel: 5 columns */}
        <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Kontrol Perangkat & Kartu</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih kartu yang ingin diuji coba dan metode scan pelanggan.
            </p>
          </div>

          {/* Select Card */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Pilih Kartu Uji</span>
              {currentCard && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    currentCard.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-700'
                      : currentCard.status === 'baru'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Status: {currentCard.status === 'baru' ? 'Belum aktif' : currentCard.status}
                </span>
              )}
            </label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            >
              {cards.map((c) => {
                const b = businesses.find((biz) => biz.id === c.business_id);
                return (
                  <option key={c.code} value={c.code}>
                    #{c.code} ({c.status === 'baru' ? 'Belum aktif' : c.status}) {b ? `→ ${b.nama}` : '→ Belum Ada Bisnis'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Source Selector: NFC or QR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Metode Masuk Pelanggan</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSource('nfc')}
                className={`p-3 text-left border rounded-lg transition-all flex items-start gap-2.5 ${
                  source === 'nfc'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Radio className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Tempel NFC</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Parameter ?s=n</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSource('qr')}
                className={`p-3 text-left border rounded-lg transition-all flex items-start gap-2.5 ${
                  source === 'qr'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Pindai QR</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Parameter ?s=q</p>
                </div>
              </button>
            </div>
          </div>

          {/* Device Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tipe Ponsel Pelanggan</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDevice('android')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  device === 'android'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => setDevice('ios')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  device === 'ios'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Apple iPhone (Safari)
              </button>
            </div>
          </div>

          {/* Target link preview */}
          {(() => {
            const biz = businesses.find((b) => b.id === currentCard?.business_id);
            const payload = currentCard ? getCardTargetPayload(currentCard, biz, source) : null;
            return (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block font-sans">
                  {payload?.isBeforeActivation
                    ? '⚡ Link Sebelum Aktivasi (Langsung ke Web Aktivasi):'
                    : '🌐 Link Tautan Google Review:'}
                </span>
                <div className="text-slate-800 break-all select-all font-bold">
                  {payload?.url || `https://reviewtap.id/r/${selectedCode}`}
                </div>
              </div>
            );
          })()}

          {/* Action Button */}
          <button
            onClick={() => runSimulation()}
            disabled={isSimulating}
            className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#F25A24] active:scale-[0.99] rounded-full shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <span className="animate-pulse">Menghubungkan ke Server...</span>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Simulasikan Scan Sekarang</span>
              </>
            )}
          </button>

          {/* Technical Specs Callout */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Logika Pengalihan Server:</p>
            <p className="text-[11px] leading-relaxed">
              Server membaca status kode kartu. Bila berstatus <strong>aktif</strong>, scan langsung dicatat di database lalu server merespon dengan <strong className="font-mono text-slate-800">HTTP 302</strong> ke formulir ulasan Google dalam waktu &lt;1 detik.
            </p>
          </div>
        </div>

        {/* Right / Interactive Smartphone Mockup: 7 columns */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-[340px] sm:max-w-[360px] bg-slate-900 p-3 rounded-[38px] shadow-2xl border-4 border-slate-800 ring-1 ring-slate-900/50">
            {/* Phone Screen Container */}
            <div className="relative w-full h-[640px] bg-white rounded-[28px] overflow-hidden flex flex-col text-slate-900 border border-slate-700/20">
              {/* Phone Status Bar */}
              <div className="h-6 bg-slate-100 flex items-center justify-between px-6 text-[10px] font-semibold text-slate-700 shrink-0">
                <span>09:41</span>
                <div className="w-16 h-3 bg-slate-900 rounded-full mx-auto" />
                <div className="flex items-center gap-1 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Browser Address Bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
                <div className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-600 truncate flex items-center gap-1.5">
                  <span className="text-emerald-600 text-xs">🔒</span>
                  <span className="truncate">
                    {currentStep === 'idle'
                      ? 'reviewtap.id'
                      : currentStep === 'scanning'
                      ? `reviewtap.id/r/${selectedCode}`
                      : currentStep === 'redirecting'
                      ? 'search.google.com/local/writereview...'
                      : lastOutcome?.result === 'redirect'
                      ? 'search.google.com'
                      : 'reviewtap.id'}
                  </span>
                </div>
                <button
                  onClick={() => runSimulation()}
                  title="Refresh / Muat Ulang"
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Phone Screen Body Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {currentStep === 'idle' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      {source === 'nfc' ? <Radio className="w-7 h-7" /> : <QrCode className="w-7 h-7" />}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Menunggu Tempelan Kartu</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Tekan tombol <strong>“Simulasikan Scan”</strong> di sebelah kiri untuk menguji alur tap NFC atau scan QR pelanggan.
                    </p>
                    <div className="mt-4 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] text-slate-600 font-mono">
                      Target: #{selectedCode}
                    </div>
                  </div>
                )}

                {currentStep === 'scanning' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-ping absolute inset-0 opacity-40" />
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center relative shadow-lg">
                        <Radio className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-5">Tag NFC Terdeteksi</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Membaca /r/{selectedCode}?s={source}
                    </p>
                  </div>
                )}

                {currentStep === 'redirecting' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mb-3" />
                    <h3 className="text-sm font-bold text-slate-900">HTTP 302 Redirect</h3>
                    <p className="text-xs text-slate-500 mt-1">Mengalihkan ke formulir ulasan Google...</p>
                  </div>
                )}

                {currentStep === 'destination' && lastOutcome && (
                  <>
                    {/* CASE 1: KARTU AKTIF -> GOOGLE REVIEW WRITE FORM */}
                    {lastOutcome.result === 'redirect' && (
                      <div className="flex-1 flex flex-col space-y-3 animate-in fade-in duration-300">
                        {/* Google Review Header */}
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                          <div className="w-6 h-6 flex items-center justify-center font-bold text-blue-600 text-sm">
                            G
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {lastOutcome.businessName}
                            </h4>
                            <p className="text-[10px] text-slate-500">Google Business Profile</p>
                          </div>
                        </div>

                        {/* Customer Auth Profile Card */}
                        <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2 border border-slate-200/60">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            U
                          </div>
                          <div className="text-[11px] min-w-0">
                            <p className="font-semibold text-slate-800 leading-tight">Pengguna Google</p>
                            <p className="text-[10px] text-slate-500 truncate">idmonggo@gmail.com</p>
                          </div>
                        </div>

                        {!reviewSent ? (
                          <div className="space-y-3">
                            {/* Star Selector */}
                            <div className="text-center py-2 bg-amber-50/50 rounded-lg border border-amber-100">
                              <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                                Beri Bintang Ulasan:
                              </p>
                              <div className="flex items-center justify-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((starIndex) => (
                                  <button
                                    key={starIndex}
                                    type="button"
                                    onClick={() => setStars(starIndex)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        starIndex <= stars
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Comment Textarea */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Bagikan Pengalaman Anda:
                              </label>
                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={3}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
                                placeholder="Tulis komentar ulasan Anda..."
                              />
                            </div>

                            <button
                              onClick={() => setReviewSent(true)}
                              className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>Kirim Ulasan Google</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <p className="text-[10px] text-slate-400 text-center">
                              Ulasan dipublikasikan secara publik di Google Maps & Google Penelusuran.
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-3 animate-in zoom-in-95">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">Ulasan Terkirim ke Google!</h5>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Terima kasih telah memberikan {stars} bintang untuk {lastOutcome.businessName}.
                              </p>
                            </div>
                            <button
                              onClick={() => setReviewSent(false)}
                              className="text-[11px] text-blue-600 font-medium underline"
                            >
                              Uji kirim lagi
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 2: KARTU BARU / BELUM AKTIF -> REVIEWAP ACTIVATION PORTAL */}
                    {lastOutcome.result === 'aktivasi' && (
                      <div className="flex-1 flex flex-col space-y-3 animate-in fade-in">
                        <div className="p-3 bg-blue-600 text-white rounded-xl">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-200" />
                            <h4 className="text-xs font-bold">Aktivasi Kartu ReviewTap</h4>
                          </div>
                          <p className="text-[11px] text-blue-100 mt-0.5">
                            Kartu #{lastOutcome.card?.code} belum dihubungkan ke bisnis.
                          </p>
                        </div>

                        {!activationComplete ? (
                          <form onSubmit={handleInPhoneActivation} className="space-y-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Pilih Bisnis Anda:
                              </label>
                              <select
                                value={activationBizId}
                                onChange={(e) => setActivationBizId(e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                              >
                                {businesses.map((biz) => (
                                  <option key={biz.id} value={biz.id}>
                                    {biz.nama}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Aktifkan Kartu Sekarang</span>
                            </button>

                            <p className="text-[10px] text-center text-slate-500 pt-1">
                              Atau buka{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  if (lastOutcome?.card?.code) {
                                    setScannedNfcCode(lastOutcome.card.code);
                                  }
                                  setIsAdminMode(false);
                                  setActiveTab('activation');
                                }}
                                className="text-blue-600 underline font-semibold cursor-pointer"
                              >
                                Halaman Aktivasi Utama
                              </button>{' '}
                              untuk salin link ulasan Google manual.
                            </p>
                          </form>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">Aktivasi Selesai!</h5>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Kartu siap digunakan pelanggan. Scan berikutnya akan langsung membuka form Google Review.
                              </p>
                            </div>
                            <button
                              onClick={() => runSimulation(lastOutcome.card?.code)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              Uji Scan Sekarang
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 3: KARTU DITOLAK / NONAKTIF / HILANG */}
                    {lastOutcome.result === 'ditolak' && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3 animate-in fade-in">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Kartu Tidak Berlaku</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {lastOutcome.message}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Hubungi pengelola bisnis atau administrator ReviewTap jika kartu ini seharusnya masih aktif.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Phone Home Bar */}
              <div className="h-4 bg-slate-100 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
