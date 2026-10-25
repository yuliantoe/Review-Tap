import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Card, Business } from '../types';
import {
  X,
  Download,
  Printer,
  QrCode as QrIcon,
  CheckCircle2,
  Filter,
  FileArchive,
  Layers,
  Sparkles,
  ExternalLink,
  Star,
  Radio,
} from 'lucide-react';

interface DownloadAllQrModalProps {
  cards: Card[];
  businesses: Business[];
  onClose: () => void;
  initialFilter?: 'all' | 'baru' | 'aktif' | string[];
}

export const DownloadAllQrModal: React.FC<DownloadAllQrModalProps> = ({
  cards,
  businesses,
  onClose,
  initialFilter = 'all',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'baru' | 'aktif' | 'batch'>(
    Array.isArray(initialFilter) ? 'batch' : initialFilter
  );
  const [layoutMode, setLayoutMode] = useState<'standee' | 'sticker'>('standee');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Filter cards based on selection
  const filteredCards = cards.filter((c) => {
    if (Array.isArray(initialFilter) && filterType === 'batch') {
      return initialFilter.includes(c.code);
    }
    if (filterType === 'baru') return c.status === 'baru';
    if (filterType === 'aktif') return c.status === 'aktif';
    return true;
  });

  // Generate high-resolution QR data URLs for all filtered cards
  useEffect(() => {
    let isMounted = true;
    const generateAll = async () => {
      const generated: Record<string, string> = {};
      for (const card of filteredCards) {
        try {
          const shortUrl = `https://reviewtap.id/r/${card.code}?s=q`;
          const dataUrl = await QRCode.toDataURL(shortUrl, {
            width: 480,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          generated[card.code] = dataUrl;
        } catch (err) {
          console.error('Failed to generate QR for', card.code, err);
        }
      }
      if (isMounted) {
        setQrImages(generated);
      }
    };

    generateAll();
    return () => {
      isMounted = false;
    };
  }, [cards, filterType]);

  // Handle ZIP download of all QR PNG files
  const handleDownloadZip = async () => {
    if (filteredCards.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);
    setDownloadSuccess(null);

    try {
      const zip = new JSZip();
      const folder = zip.folder('qrcode_reviewtap');

      // Add README with printing instructions
      folder?.file(
        'PANDUAN_CETAK.txt',
        `PANDUAN CETAK QR CODE & NFC REVIEWTAP
================================================
Jumlah Kartu: ${filteredCards.length}
Format File: PNG Resolusi Tinggi (480x480 px, 300 DPI Siap Cetak)
Payload URL: https://reviewtap.id/r/[KODE]?s=q

KEUNGGULAN QR CODE DINAMIS:
- QR code yang sudah dicetak berlaku selamanya.
- Jika toko berganti nama, pindah cabang, atau link ulasan berubah,
  cukup ganti link di dashboard tanpa perlu mencetak ulang fisik QR.

TIPS CETAK FISIK:
1. Stand Akrilik Meja: Ukuran rekomendasi QR 3.5 cm x 3.5 cm hingga 5 cm x 5 cm.
2. Kartu PVC / Stiker: Pastikan margin putih (quiet zone) minimal 2 mm di sekitar QR.
3. Chip NFC: Untuk NFC Tag (NTAG213/215), tulis URL: https://reviewtap.id/r/[KODE]?s=n
`
      );

      // Add each QR image to ZIP
      let count = 0;
      for (const card of filteredCards) {
        let dataUrl = qrImages[card.code];
        if (!dataUrl) {
          const shortUrl = `https://reviewtap.id/r/${card.code}?s=q`;
          dataUrl = await QRCode.toDataURL(shortUrl, {
            width: 512,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
        }

        // Base64 to blob
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const biz = businesses.find((b) => b.id === card.business_id);
        const bizNamePart = biz ? `_${biz.nama.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}` : '_siap_aktivasi';
        const fileName = `QR_${card.code}${bizNamePart}.png`;

        folder?.file(fileName, base64Data, { base64: true });
        count++;
        setZipProgress(Math.round((count / filteredCards.length) * 100));
      }

      // Generate ZIP and trigger browser download
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.round(metadata.percent));
      });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reviewtap_qrcodes_${filteredCards.length}_kartu.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsZipping(false);
      setDownloadSuccess(`Berhasil mengunduh ZIP berisi ${filteredCards.length} file QR Code!`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Error generating zip', err);
      setIsZipping(false);
      alert('Gagal membuat file ZIP. Silakan coba kembali.');
    }
  };

  // Trigger browser native print for A4 printable sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // Download single QR code image
  const handleDownloadSingle = (code: string) => {
    const dataUrl = qrImages[code];
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Print-specific style tag injected for flawless A4 printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-sheet-area, #print-sheet-area * {
            visibility: visible !important;
          }
          #print-sheet-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 no-print">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                <QrIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Unduh & Cetak QR Code Semua Kartu</span>
                  <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {filteredCards.length} Kartu
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Unduh paket ZIP file gambar QR resolusi tinggi atau cetak lembar akrilik meja siap potong.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar / Options */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter Scope */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Kartu:</span>
              </span>
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    filterType === 'all' ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({cards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('baru')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    filterType === 'baru' ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Aktif ({cards.filter((c) => c.status === 'baru').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('aktif')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    filterType === 'aktif' ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Aktif ({cards.filter((c) => c.status === 'aktif').length})
                </button>
              </div>
            </div>

            {/* Layout Mode */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Desain Cetak:</span>
              </span>
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLayoutMode('standee')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    layoutMode === 'standee' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stand Akrilik Meja (Lengkap)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('sticker')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    layoutMode === 'sticker' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stiker Ringkas (Grid Mini)
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handlePrintSheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Cetak Lembar / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isZipping || filteredCards.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FileArchive className="w-4 h-4" />
                <span>{isZipping ? `Mengemas ZIP (${zipProgress}%)...` : 'Unduh Semua (.ZIP)'}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{downloadSuccess}</span>
              </span>
              <span className="text-[11px] text-emerald-700">File siap dibuka di folder Download</span>
            </div>
          )}

          {/* Preview Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70">
            {filteredCards.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  layoutMode === 'standee'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                }`}
              >
                {filteredCards.map((card) => {
                  const business = businesses.find((b) => b.id === card.business_id);
                  const qrDataUrl = qrImages[card.code];

                  if (layoutMode === 'standee') {
                    return (
                      <div
                        key={card.code}
                        className="bg-white rounded-xl border border-slate-300/80 p-5 shadow-sm space-y-3.5 relative flex flex-col justify-between group hover:border-blue-400 transition-all"
                      >
                        {/* Top Header Card */}
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                            Beri Ulasan Google
                          </h4>
                          <p className="text-[11px] text-slate-600 font-medium truncate px-1">
                            {business ? business.nama : 'ReviewTap Smart Card'}
                          </p>
                        </div>

                        {/* QR Image Box */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt={`QR ${card.code}`}
                              className="w-36 h-36 object-contain"
                            />
                          ) : (
                            <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                              Memuat QR...
                            </div>
                          )}
                          <div className="mt-2 text-center">
                            <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                              #{card.code}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              /r/{card.code}?s=q
                            </span>
                          </div>
                        </div>

                        {/* Card Footer NFC & Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Radio className="w-3 h-3 text-blue-600" />
                            <span>Tap NFC / Scan QR</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(card.code)}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Unduh PNG</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Compact Sticker Layout
                  return (
                    <div
                      key={card.code}
                      className="bg-white rounded-lg border border-slate-300 p-3 shadow-2xs flex flex-col items-center text-center space-y-2 group hover:border-blue-400 transition-all"
                    >
                      <div className="text-[10px] font-bold text-slate-800 tracking-tight">
                        REVIEW GOOGLE
                      </div>
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`QR ${card.code}`}
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center text-slate-400 text-[10px]">
                          Memuat...
                        </div>
                      )}
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 block">
                          #{card.code}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          NFC + QR
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(card.code)}
                        className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Unduh
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Tidak ada kartu yang cocok dengan filter yang dipilih.
              </div>
            )}
          </div>

          {/* Modal Bottom Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
            <div className="text-slate-500">
              💡 <strong>Tips Cetak:</strong> File ZIP berisi gambar 300 DPI dengan nama file sesuai kode kartu fisik.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden container specifically styled for direct Print / Save as PDF */}
      <div id="print-sheet-area" className="hidden">
        <div className="p-4 space-y-4">
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">ReviewTap NFC & QR Code Print Sheet</h1>
              <p className="text-xs text-slate-500">Lembar Cetak Stand Akrilik / Kartu Fisik Ulasan Google</p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Total: {filteredCards.length} Kartu
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              layoutMode === 'standee' ? 'grid-cols-2' : 'grid-cols-4'
            }`}
          >
            {filteredCards.map((card) => {
              const business = businesses.find((b) => b.id === card.business_id);
              const qrDataUrl = qrImages[card.code];

              return (
                <div
                  key={card.code}
                  className="border-2 border-dashed border-slate-400 p-4 rounded-xl text-center flex flex-col justify-between items-center bg-white space-y-2 break-inside-avoid"
                  style={{ minHeight: layoutMode === 'standee' ? '280px' : '160px' }}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black tracking-wider text-slate-900 uppercase">
                      Beri Ulasan Google
                    </div>
                    <div className="text-xs font-bold text-blue-700 truncate max-w-[200px]">
                      {business ? business.nama : 'ReviewTap Contactless'}
                    </div>
                    <div className="text-[10px] text-amber-500 font-bold">
                      ★★★★★
                    </div>
                  </div>

                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={card.code}
                      className={layoutMode === 'standee' ? 'w-36 h-36' : 'w-24 h-24'}
                    />
                  )}

                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-xs text-slate-900 tracking-wider">
                      KODE: #{card.code}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      https://reviewtap.id/r/{card.code}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">
                      Tempel HP (NFC) atau Scan QR
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
