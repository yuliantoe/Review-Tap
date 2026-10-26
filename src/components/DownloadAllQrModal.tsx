import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

import { getCardTargetPayload } from '../utils/cardUrlHelper';

interface DownloadAllQrModalProps {
  cards: Card[];
  businesses: Business[];
  onClose: () => void;
  initialFilter?: 'all' | 'baru' | 'aktif' | string[];
}

/**
 * Generates a clean high-resolution PNG sticker (QR + Card Code only, no extra labels)
 */
const generateStickerPng = async (cardCode: string, qrDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 700;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle border / cut guideline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw QR Code centered (480 x 480)
      ctx.drawImage(img, 60, 50, 480, 480);

      // Draw Card Code (#CODE) only
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px monospace, "Courier New", Courier';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${cardCode}`, width / 2, 600);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(qrDataUrl);
    };
    img.src = qrDataUrl;
  });
};

export const DownloadAllQrModal: React.FC<DownloadAllQrModalProps> = ({
  cards,
  businesses,
  onClose,
  initialFilter = 'all',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'baru' | 'aktif' | 'batch'>(
    Array.isArray(initialFilter) ? 'batch' : initialFilter
  );
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
          const biz = businesses.find((b) => b.id === card.business_id);
          // Sebelum diaktivasi: Link langsung ke Web Aktivasi!
          const payload = getCardTargetPayload(card, biz, 'qr');
          const targetUrl = payload.url;

          const dataUrl = await QRCode.toDataURL(targetUrl, {
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
  }, [cards, businesses, filterType]);

  // Handle ZIP download of all sticker PNG files
  const handleDownloadZip = async () => {
    if (filteredCards.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);
    setDownloadSuccess(null);

    try {
      const zip = new JSZip();
      const folder = zip.folder('stiker_qr_reviewtap');

      // Add README info
      folder?.file(
        'INFORMASI_STIKER.txt',
        `STIKER QR CODE REVIEWTAP
================================================
Jumlah Stiker: ${filteredCards.length}
Format File: PNG Resolusi Tinggi (600x700 px, Siap Cetak Stiker Mini)
Konten Desain: QR Code + Kode Kartu Unik

ALUR LINK QR CODE & NFC:
- Sebelum diaktivasi: Scan QR / tap NFC langsung mengarah ke Web Aktivasi ReviewTap.
  Formulir aktivasi akan otomatis terisi kode kartu bersangkutan.
- Setelah diaktivasi: Link otomatis mengarah ke halaman ulasan Google bisnis terkait.
- Link ulasan Google tujuan dapat diganti sewaktu-waktu di dashboard admin tanpa cetak ulang.
`
      );

      // Add each sticker PNG to ZIP
      let count = 0;
      for (const card of filteredCards) {
        let baseQr = qrImages[card.code];
        if (!baseQr) {
          const biz = businesses.find((b) => b.id === card.business_id);
          const payload = getCardTargetPayload(card, biz, 'qr');
          baseQr = await QRCode.toDataURL(payload.url, {
            width: 480,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
        }

        // Generate full sticker PNG (QR + #code)
        const stickerDataUrl = await generateStickerPng(card.code, baseQr);
        const base64Data = stickerDataUrl.replace(/^data:image\/png;base64,/, '');
        const fileName = `Stiker_QR_${card.code}.png`;

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
      link.download = `stiker_qr_${filteredCards.length}_kartu.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsZipping(false);
      setDownloadSuccess(`Berhasil mengunduh ZIP berisi ${filteredCards.length} file PNG stiker ringkas!`);
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

  // Download single sticker PNG image
  const handleDownloadSingle = async (code: string) => {
    const rawQr = qrImages[code];
    if (!rawQr) return;

    const stickerPng = await generateStickerPng(code, rawQr);
    const link = document.createElement('a');
    link.href = stickerPng;
    link.download = `Stiker_QR_${code}.png`;
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
            margin: 6mm;
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
                  <span>Unduh & Cetak Stiker QR Ringkas</span>
                  <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {filteredCards.length} Kartu
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Desain stiker ringkas grid mini (hanya QR code dan kode kartu) dalam format PNG siap cetak.
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
                <span>{isZipping ? `Mengemas ZIP (${zipProgress}%)...` : 'Unduh Semua PNG (.ZIP)'}</span>
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

          {/* Preview Container: Mini Grid of Compact Stickers */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70">
            {filteredCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCards.map((card) => {
                  const qrDataUrl = qrImages[card.code];

                  return (
                    <div
                      key={card.code}
                      className="bg-white rounded-xl border border-slate-300 p-3 shadow-2xs flex flex-col items-center text-center justify-between group hover:border-blue-500 hover:shadow-md transition-all space-y-2"
                    >
                      {/* QR Image */}
                      <div className="p-1 bg-white rounded-lg">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR ${card.code}`}
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 flex items-center justify-center text-slate-400 text-[10px]">
                            Memuat...
                          </div>
                        )}
                      </div>

                      {/* Card Code Only */}
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 tracking-wider block">
                          #{card.code}
                        </span>
                      </div>

                      {/* Action Button: Unduh PNG */}
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(card.code)}
                        className="w-full mt-1 py-1.5 px-2 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Unduh PNG</span>
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
              💡 <strong>Format PNG:</strong> Stiker ringkas resolusi tinggi berisi QR code dan kode kartu, siap cetak stiker mini.
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

      {/* Hidden container specifically styled for direct Print / Save as PDF: Mini Grid of compact stickers */}
      <div id="print-sheet-area" className="hidden">
        <div className="p-2 space-y-3">
          <div className="border-b pb-2 mb-2 flex items-center justify-between text-xs">
            <div>
              <h1 className="text-sm font-bold text-slate-900">ReviewTap - Lembar Cetak Stiker QR Mini</h1>
            </div>
            <div className="text-right text-[11px] text-slate-600 font-mono">
              Total: {filteredCards.length} Stiker
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {filteredCards.map((card) => {
              const qrDataUrl = qrImages[card.code];

              return (
                <div
                  key={card.code}
                  className="border border-dashed border-slate-400 p-2 rounded-lg text-center flex flex-col justify-between items-center bg-white space-y-1.5 break-inside-avoid"
                  style={{ minHeight: '140px' }}
                >
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={card.code}
                      className="w-24 h-24 object-contain"
                    />
                  )}

                  <div className="font-mono font-bold text-xs text-slate-900 tracking-wider">
                    #{card.code}
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
