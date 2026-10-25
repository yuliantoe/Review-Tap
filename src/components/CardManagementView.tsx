import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { Card, CardStatus, CardType } from '../types';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Radio,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Building2,
  Trash2,
  ExternalLink,
  Edit2,
  Edit3,
  Link2,
  Sparkles,
  Check,
} from 'lucide-react';
import { BatchGeneratorModal } from './BatchGeneratorModal';
import { CardQrModal } from './CardQrModal';
import { ActivateCardModal } from './ActivateCardModal';
import { EditCardLinkModal } from './EditCardLinkModal';

export const CardManagementView: React.FC = () => {
  const {
    cards,
    businesses,
    updateCardStatus,
    updateCardBusiness,
    deleteCard,
    exportCsv,
    setActiveTab,
    simulateScan,
  } = useReviewTap();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CardStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CardType>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeQrModalCard, setActiveQrModalCard] = useState<Card | null>(null);
  const [activeActivateCard, setActiveActivateCard] = useState<Card | null>(null);
  const [cardToEditLink, setCardToEditLink] = useState<Card | null>(null);

  // Filtered Cards
  const filteredCards = cards.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all' && c.tipe !== typeFilter) return false;
    if (businessFilter !== 'all') {
      if (businessFilter === 'none') {
        if (c.business_id !== null) return false;
      } else if (c.business_id !== businessFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchNote = c.catatan?.toLowerCase().includes(q);
      const biz = businesses.find((b) => b.id === c.business_id);
      const matchBiz = biz?.nama.toLowerCase().includes(q);
      if (!matchCode && !matchNote && !matchBiz) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Kartu NFC & QR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kode unik 6 karakter, status aktivasi, dan pengikatan ke Google Place ID.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv('cards')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Batch Kartu</span>
          </button>
        </div>
      </div>

      {/* Info Callout: Tag NFC & QR tidak perlu dicetak ulang jika ganti link ulasan */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-950">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950 flex items-center gap-2">
            <span>QR Code & Tag NFC Dinamis (Link Review Dapat Diganti Kapan Saja)</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              Tanpa Cetak Ulang
            </span>
          </p>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Kartu fisik atau stand akrilik yang <strong>sudah dicetak QR code-nya tetap valid selamanya</strong>. Jika bisnis pindah tempat, berganti cabang, atau memiliki tautan review baru, Anda cukup mengklik tombol <strong>&ldquo;Ganti Link Review&rdquo;</strong> pada daftar kartu di bawah ini. Pengunjung yang menempelkan NFC atau memindai QR code akan otomatis diarahkan ke tautan Google Review baru secara instan!
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode (misal K9X4M2) atau label..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden flex-1 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="baru">Belum Aktif (Baru)</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="hilang">Hilang</option>
            </select>
          </div>

          {/* Tipe Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Tipe:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden flex-1 cursor-pointer"
            >
              <option value="all">Semua Tipe Hardware</option>
              <option value="nfc_qr">NFC + QR</option>
              <option value="nfc">Hanya NFC</option>
              <option value="qr">Hanya QR</option>
            </select>
          </div>

          {/* Business Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Bisnis:</span>
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden flex-1 cursor-pointer"
            >
              <option value="all">Semua Bisnis</option>
              <option value="none">Belum Terhubung</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Count Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 border-t border-slate-100">
          <span>Menampilkan <strong className="text-slate-800 font-mono">{filteredCards.length}</strong> kartu</span>
          <span aria-hidden="true">·</span>
          <span>{cards.filter((c) => c.status === 'aktif').length} Aktif</span>
          <span aria-hidden="true">·</span>
          <span>{cards.filter((c) => c.status === 'baru').length} Belum Aktif</span>
          <span aria-hidden="true">·</span>
          <span>{cards.filter((c) => c.status === 'nonaktif' || c.status === 'hilang').length} Nonaktif / Hilang</span>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Kode Kartu</th>
                <th className="py-3 px-4">Tipe Hardware</th>
                <th className="py-3 px-4">Bisnis / Link Google Review</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => {
                  const business = businesses.find((b) => b.id === card.business_id);

                  return (
                    <tr key={card.code} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                          #{card.code}
                        </span>
                      </td>

                      {/* Hardware Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          {card.tipe === 'nfc_qr' && (
                            <>
                              <Radio className="w-3.5 h-3.5 text-blue-600" />
                              <span>NFC + QR</span>
                            </>
                          )}
                          {card.tipe === 'nfc' && (
                            <>
                              <Radio className="w-3.5 h-3.5 text-blue-600" />
                              <span>Hanya NFC</span>
                            </>
                          )}
                          {card.tipe === 'qr' && (
                            <>
                              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Hanya QR</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Connected Business & Direct Link Replacement */}
                      <td className="py-3 px-4 min-w-[220px]">
                        {business ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                              {business.nama}
                            </p>
                            <p className="font-mono text-[11px] text-slate-400 truncate max-w-[220px]">
                              {business.place_id}
                            </p>
                            <button
                              type="button"
                              onClick={() => setCardToEditLink(card)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                              title="QR code yang sudah dicetak tetap berlaku. Klik untuk ganti link Google Review."
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Ganti Link Review</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Belum Dipasang</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCardToEditLink(card)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Pasang Link Review</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={card.status}
                          onChange={(e) => updateCardStatus(card.code, e.target.value as CardStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-md border cursor-pointer focus:outline-hidden ${
                            card.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : card.status === 'baru'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="baru">Belum Aktif (Baru)</option>
                          <option value="nonaktif">Nonaktif</option>
                          <option value="hilang">Hilang</option>
                        </select>
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {card.catatan || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Ganti Link Review Button */}
                          <button
                            onClick={() => setCardToEditLink(card)}
                            title="Ganti Link Google Review (QR yang sudah dicetak tetap berlaku)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Lihat / Cetak QR Code Modal */}
                          <button
                            onClick={() => setActiveQrModalCard(card)}
                            title="Lihat & Cetak QR Code / NDEF Link"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          {/* Uji Scan Simulator */}
                          <button
                            onClick={() => {
                              simulateScan(card.code, card.tipe === 'qr' ? 'qr' : 'nfc');
                              setActiveTab('simulator');
                            }}
                            title="Uji Scan sebagai Pelanggan"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                          {/* Hapus */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kartu #${card.code}?`)) {
                                deleteCard(card.code);
                              }
                            }}
                            title="Hapus Kartu"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada kartu yang cocok dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isBatchModalOpen && (
        <BatchGeneratorModal
          onClose={() => setIsBatchModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {activeQrModalCard && (
        <CardQrModal
          card={activeQrModalCard}
          business={businesses.find((b) => b.id === activeQrModalCard.business_id)}
          onClose={() => setActiveQrModalCard(null)}
          onSimulate={(code, src) => {
            simulateScan(code, src);
            setActiveTab('simulator');
          }}
          onEditLink={(card) => setCardToEditLink(card)}
        />
      )}

      {activeActivateCard && (
        <ActivateCardModal
          card={activeActivateCard}
          onClose={() => setActiveActivateCard(null)}
        />
      )}

      {cardToEditLink && (
        <EditCardLinkModal
          card={cardToEditLink}
          onClose={() => setCardToEditLink(null)}
          onSimulate={(code) => {
            simulateScan(code, cardToEditLink.tipe === 'qr' ? 'qr' : 'nfc');
            setActiveTab('simulator');
          }}
        />
      )}
    </div>
  );
};
