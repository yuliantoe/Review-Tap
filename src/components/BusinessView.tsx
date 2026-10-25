import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import { Business } from '../types';
import { parseGoogleReviewInput } from '../utils/googleReviewHelper';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Star,
  MapPin,
  Mail,
  CreditCard,
  Trash2,
  Edit2,
  Check,
  X,
  Compass,
} from 'lucide-react';

export const BusinessView: React.FC = () => {
  const { businesses, cards, addBusiness, updateBusiness, deleteBusiness, setActiveTab } = useReviewTap();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New business form state
  const [nama, setNama] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [pemilikEmail, setPemilikEmail] = useState('');
  const [kategori, setKategori] = useState('Kafe & Resto');
  const [kota, setKota] = useState('Jakarta Selatan');
  const [alamat, setAlamat] = useState('');
  const [rating, setRating] = useState(4.8);
  const [totalUlasan, setTotalUlasan] = useState(120);

  // Sample Place IDs for quick fill
  const samplePresets = [
    {
      nama: 'Kopi Kenangan Senopati',
      place_id: 'ChIJ5cK_b_b0aS4RM_12y2PZ6e0',
      kategori: 'Kafe & Minuman',
      kota: 'Jakarta Selatan',
      alamat: 'Jl. Senopati No. 42, Kebayoran Baru',
    },
    {
      nama: 'Resto Padang Sederhana Thamrin',
      place_id: 'ChIJ9Tf37Uf1aS4RzU4Lkq_Y0_g',
      kategori: 'Restoran Keluarga',
      kota: 'Jakarta Pusat',
      alamat: 'Jl. M.H. Thamrin No. 8',
    },
    {
      nama: 'Bumi Artisan Bakery Menteng',
      place_id: 'ChIJX99d42v1aS4RsK6n3dY_6cM',
      kategori: 'Bakery & Pastry',
      kota: 'Jakarta Pusat',
      alamat: 'Jl. Cikini Raya No. 18',
    },
    {
      nama: 'Klinik Gigi Harmoni Kemang',
      place_id: 'ChIJg_G49Hj1aS4RVY4L2aO9t5g',
      kategori: 'Klinik Kesehatan',
      kota: 'Jakarta Selatan',
      alamat: 'Jl. Kemang Raya No. 25B',
    },
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setNama(preset.nama);
    setPlaceId(preset.place_id);
    setKategori(preset.kategori);
    setKota(preset.kota);
    setAlamat(preset.alamat);
    setPemilikEmail(`admin@${preset.nama.toLowerCase().replace(/[^a-z]/g, '')}.id`);
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !placeId.trim()) return;

    addBusiness({
      nama: nama.trim(),
      place_id: placeId.trim(),
      pemilik_email: pemilikEmail.trim() || 'pemilik@bisnis.id',
      kategori,
      kota,
      alamat: alamat.trim() || `${kota}, Indonesia`,
      rating: Number(rating) || 4.5,
      total_ulasan_google: Number(totalUlasan) || 50,
    });

    // Reset
    setNama('');
    setPlaceId('');
    setPemilikEmail('');
    setAlamat('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Profil Bisnis & Google Place ID
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar bisnis terdaftar beserta Place ID resmi untuk formulir ulasan Google.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isAdding ? 'Tutup Formulir' : 'Tambah Bisnis Baru'}</span>
        </button>
      </div>

      {/* Place ID Helper Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Cara Mendapatkan Google Place ID</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Place ID adalah pengidentifikasi unik Google Places (format diawali dengan <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-800 font-mono text-[11px]">ChIJ...</code>). Place ID digunakan untuk membangun URL resmi pembuka form ulasan:{' '}
            <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded text-blue-600 font-mono text-[11px]">
              search.google.com/local/writereview?placeid=[PLACE_ID]
            </code>
          </p>
        </div>

        <a
          href="https://developers.google.com/maps/documentation/places/web-service/place-id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <span>Google Place ID Finder</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Add New Business Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md space-y-5 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulir Tambah Bisnis</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan Place ID Finder atau pilih contoh instan di bawah ini.
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              Isi Otomatis dari Bisnis Contoh:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.place_id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 transition-colors"
                >
                  + {preset.nama}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bisnis (Sesuai Google Maps) *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="misal: Kafe Kopi Kenangan Senopati"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Google Place ID atau Link Review *
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium">Bisa salin link Google Review</span>
                </div>
                <input
                  type="text"
                  required
                  value={placeId}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = parseGoogleReviewInput(raw);
                    setPlaceId(parsed.placeId || raw);
                  }}
                  placeholder="misal: https://search.google.com/local/writereview?placeid=ChIJ... atau ChIJ..."
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tempel link ulasan atau Place ID resmi (ChIJ...). Sistem akan mengekstrak otomatis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Pemilik Bisnis
                </label>
                <input
                  type="email"
                  value={pemilikEmail}
                  onChange={(e) => setPemilikEmail(e.target.value)}
                  placeholder="owner@bisnis.id"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Usaha
                </label>
                <input
                  type="text"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  placeholder="misal: Restoran, Klinik, Barbershop"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Wilayah
                </label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  placeholder="misal: Jakarta Selatan"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Senopati Raya No. 42"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Simpan Bisnis
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map((biz) => {
          const bizCards = cards.filter((c) => c.business_id === biz.id);
          const activeBizCards = bizCards.filter((c) => c.status === 'aktif');
          const googleUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(biz.place_id)}`;

          return (
            <div
              key={biz.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus bisnis "${biz.nama}"? Kartu yang terhubung akan dilepas.`)) {
                          deleteBusiness(biz.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Hapus bisnis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{biz.nama}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{biz.kategori}</span>
                    <span aria-hidden="true">·</span>
                    <span>{biz.kota}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight text-slate-600">{biz.alamat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-mono text-slate-600">{biz.pemilik_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-slate-600">
                      Google Rating: <strong>{biz.rating}</strong> ({biz.total_ulasan_google} ulasan)
                    </span>
                  </div>
                </div>

                {/* Place ID Badge */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <span>Google Place ID</span>
                    <span className="text-emerald-700 lowercase font-normal">terverifikasi</span>
                  </div>
                  <p className="font-mono text-xs text-slate-800 break-all select-all font-medium">
                    {biz.place_id}
                  </p>
                </div>
              </div>

              {/* Bottom Card Summary & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('cards')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>{activeBizCards.length} Kartu Aktif</span>
                </button>

                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>Tes Form Review</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
