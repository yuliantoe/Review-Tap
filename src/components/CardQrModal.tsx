import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, Business } from '../types';
import { X, Copy, Check, Download, ExternalLink, Smartphone, Radio, QrCode as QrIcon, Edit3, Sparkles } from 'lucide-react';

interface CardQrModalProps {
  card: Card;
  business?: Business;
  onClose: () => void;
  onSimulate: (code: string, source: 'nfc' | 'qr') => void;
  onEditLink?: (card: Card) => void;
}

export const CardQrModal: React.FC<CardQrModalProps> = ({
  card,
  business,
  onClose,
  onSimulate,
  onEditLink,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activePayloadType, setActivePayloadType] = useState<'nfc' | 'qr'>('nfc');

  const sourceParam = activePayloadType === 'nfc' ? 's=n' : 's=q';
  const shortUrl = `https://reviewtap.id/r/${card.code}?${sourceParam}`;
  const googleReviewUrl = business?.place_id
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.place_id)}`
    : null;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shortUrl,
        {
          width: 240,
          margin: 2, // 4-module compliant quiet zone
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [shortUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const pngUrl = canvasRef.current.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `reviewtap_qr_${card.code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span>Kartu #{card.code}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                  card.status === 'aktif'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : card.status === 'baru'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {card.status === 'aktif' ? 'Aktif' : card.status === 'baru' ? 'Belum Aktif' : card.status}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {business ? `${business.nama} (${business.kota})` : 'Kartu belum diaktifkan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Target Mode Segmented Switcher */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActivePayloadType('nfc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  activePayloadType === 'nfc'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>NFC Tag Link (?s=n)</span>
              </button>
              <button
                onClick={() => setActivePayloadType('qr')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  activePayloadType === 'qr'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrIcon className="w-3.5 h-3.5" />
                <span>QR Code Print (?s=q)</span>
              </button>
            </div>
          </div>

          {/* QR Canvas Display */}
          <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl border border-slate-200/80">
            <div className="p-3 bg-white rounded-lg shadow-xs border border-slate-200">
              <canvas ref={canvasRef} className="block w-48 h-48 mx-auto" />
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Cetak QR dengan margin minimal 4 modul (standar NDEF / ISO-18004).
            </p>
          </div>

          {/* Short URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Link Pendek NDEF / QR</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 focus:outline-hidden"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                onClick={handleDownload}
                title="Unduh QR Code (PNG)"
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic QR Info Banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 block">QR Code Bersifat Dinamis (Dapat Diganti Kapan Saja)</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Meskipun sudah dicetak di kartu atau akrilik meja, tautan Google Review kartu ini dapat diganti kapan saja tanpa perlu mencetak ulang.
              </p>
            </div>
          </div>

          {/* Destination info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Tujuan Pengalihan (HTTP 302):</span>
              <span className="font-semibold text-slate-800">
                {business ? business.nama : 'Belum Terhubung'}
              </span>
            </div>
            {business?.place_id ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Google Place ID:</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]">
                    {business.place_id}
                  </span>
                </div>
                {onEditLink && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Ingin arahkan ke tempat lain?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditLink(card);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ganti Link Google Review</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-700 text-[11px]">
                  Kartu belum aktif. Pelanggan/pemilik yang memindai akan dialihkan ke formulir aktivasi.
                </p>
                {onEditLink && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditLink(card);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Hubungkan Link Google Review Sekarang</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          {googleReviewUrl ? (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <span>Buka Review Google</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSimulate(card.code, activePayloadType);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulasikan Scan Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
