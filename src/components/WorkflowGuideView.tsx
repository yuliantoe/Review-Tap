import React from 'react';
import {
  Users,
  ShieldCheck,
  Smartphone,
  Server,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  QrCode,
  Lock,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';
import { useReviewTap } from '../context/ReviewTapContext';

export const WorkflowGuideView: React.FC = () => {
  const { setActiveTab } = useReviewTap();

  const workflowSteps = [
    {
      actor: 'Admin ReviewTap',
      role: 'Cetak & Tulis Tag',
      title: '01. Buat Batch & Tulis Hardware',
      desc: 'Dashboard membuat kode unik 6 karakter per kartu. Sebelum diaktivasi, link QR code dan NFC langsung mengarah ke Web Aktivasi (?code=KODE) agar pemilik dapat langsung mengaktifkannya saat pertama kali diterima.',
      color: 'bg-blue-600',
    },
    {
      actor: 'Admin ReviewTap',
      role: 'Distribusi Logistik',
      title: '02. Kirim Kartu ke Mitra Bisnis',
      desc: 'Kartu dikemas dan dikirim ke pemilik bisnis. Pada tahap ini admin tidak perlu tahu Google Place ID dari bisnis penerima.',
      color: 'bg-indigo-600',
    },
    {
      actor: 'Pemilik Bisnis',
      role: 'Aktivasi Perdana',
      title: '03. Aktivasi Mandiri Lewat Ponsel',
      desc: 'Pemilik menempelkan kartu NFC atau memindai QR code. Link sebelum aktivasi langsung membuka halaman Web Aktivasi ReviewTap dengan kode kartu terisi otomatis. Pemilik mengisi nama toko & link Google Review.',
      color: 'bg-emerald-600',
    },
    {
      actor: 'Sistem ReviewTap',
      role: 'Penyimpanan Database',
      title: '04. Hubungkan Kode ke Place ID',
      desc: 'Sistem menyimpan asosiasi kode kartu ke Google Place ID. Status berubah dari "Baru" menjadi "Aktif", dan timestamp aktivasi dicatat.',
      color: 'bg-slate-700',
    },
    {
      actor: 'Pelanggan',
      role: 'Penggunaan di Lokasi',
      title: '05. Pelanggan Menempelkan Ponsel',
      desc: 'Pelanggan menempelkan ponsel ke kartu NFC atau memindai QR di meja kasir. Tanpa perlu download aplikasi apapun, browser ponsel membuka link pendek.',
      color: 'bg-amber-600',
    },
    {
      actor: 'Sistem ReviewTap',
      role: 'Log & Pengalihan Instan',
      title: '06. Catat Scan & Pengalihan 302',
      desc: 'Server mencatat scan (waktu, sumber NFC/QR, jenis perangkat), lalu mengalihkan dengan HTTP 302 ke search.google.com/local/writereview?placeid=... dalam <1 detik.',
      color: 'bg-blue-700',
    },
    {
      actor: 'Pelanggan',
      role: 'Ulasan Resmi',
      title: '07. Beri Bintang & Komentar',
      desc: 'Google Maps langsung menampilkan dialog review resmi. Pelanggan memilih bintang (1-5), menulis komentar, dan mengirim dengan akun Google mereka.',
      color: 'bg-emerald-700',
    },
    {
      actor: 'Pemilik Bisnis',
      role: 'Pemantauan & Balas',
      title: '08. Pantau di Dashboard & Balas',
      desc: 'Dashboard menunjukkan metrik scan harian per kartu dan per meja. Ulasan yang masuk dapat dipantau dan dibalas langsung di Google Business Profile.',
      color: 'bg-indigo-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Alur Sistem & Panduan Hardware
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Arsitektur end-to-end dari kartu kosong, aktivasi mandiri pemilik usaha, hingga ulasan pelanggan masuk ke Google.
        </p>
      </div>

      {/* 8-Step Journey Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Dari Kartu Kosong Sampai Ulasan Masuk
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            3 Pihak: Admin · Pemilik Bisnis · Pelanggan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">{step.actor}</span>
                  <span className="font-mono text-slate-400">#{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{step.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Status Lifecycle Diagram */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Siklus Status Kartu</h2>
        <p className="text-xs text-slate-500">
          Perilaku sistem berdasarkan status kartu saat link /r/:code diakses oleh perangkat:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Status 1: Belum Aktif */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                1. Belum Aktif (Baru)
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                Pencetakan Awal
              </span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Kartu baru dicetak dan dikirim ke bisnis. Jika discan sebelum dipasang, sistem membuka <strong>halaman aktivasi mandiri</strong> bagi pemilik bisnis untuk memilih Place ID.
            </p>
          </div>

          {/* Status 2: Aktif */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                2. Aktif
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                Operasional
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Kartu sudah terikat ke Place ID. Setiap scan dicatat di database, lalu server merespon dengan <strong>HTTP 302 redirect</strong> langsung ke formulir ulasan Google dalam &lt;1 detik.
            </p>
          </div>

          {/* Status 3: Nonaktif / Hilang */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono">
                3. Nonaktif / Hilang
              </span>
              <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium">
                Diblokir
              </span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Kartu yang dilaporkan hilang atau ditarik menampilkan halaman <strong>“Kartu tidak berlaku”</strong> dan tidak dialihkan ke Google untuk menjaga integritas ulasan.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Hardware Specs & Google Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware & NFC Specification */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold">Spesifikasi Hardware NFC & QR</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <p className="font-semibold text-slate-800">1. Chip NFC: NTAG213 atau NTAG215</p>
              <p className="text-slate-600 leading-relaxed">
                Kapasitas NTAG213 (144 bytes) sudah lebih dari cukup untuk satu link pendek ReviewTap (~32 bytes). Kompatibel secara native dengan iPhone (iOS 13+ tanpa aplikasi) dan ponsel Android yang memiliki fitur NFC.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <p className="font-semibold text-slate-800">2. Format Penulisan: NDEF URI</p>
              <p className="text-slate-600 leading-relaxed">
                Tulis rekaman NDEF tipe URL: <code className="bg-white px-1 py-0.5 border border-slate-200 rounded text-blue-700 font-mono text-[11px]">https://reviewtap.id/r/[KODE]?s=n</code> menggunakan aplikasi NFC Tools atau mesin duplikator batch. Kunci tag (read-only / password lock) agar tidak bisa ditimpa pihak lain.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <p className="font-semibold text-slate-800">3. Cetak QR Code Cadangan</p>
              <p className="text-slate-600 leading-relaxed">
                Cetak kode QR dengan margin putih (quiet zone) minimal 4 modul. Pastikan kontras tinggi (hitam di atas putih/akrilik terang) dan uji keterbacaan pada jarak 15–20 cm.
              </p>
            </div>
          </div>
        </div>

        {/* Google Review Guidelines */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold">Kepatuhan Kebijakan Ulasan Google</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tanpa Review Gating (Penyaringan)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ReviewTap mengarahkan semua pelanggan langsung ke formulir ulasan resmi Google tanpa mengajukan pertanyaan awal untuk menyaring ulasan negatif. Hal ini 100% mematuhi pedoman Google Business Profile.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Dilarang Memberikan Hadiah / Insentif Ulasan</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Pemilik usaha dilarang menawarkan diskon, makanan gratis, atau undian berhadiah sebagai imbalan ulasan Google. Pelanggan harus memberikan ulasan murni berdasarkan pengalaman nyata.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Users className="w-4 h-4 shrink-0" />
                <span>Akun Google Pelanggan</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Google mewajibkan pelanggan login ke akun Google untuk menulis ulasan. Tautan langsung ReviewTap otomatis mendeteksi sesi login browser tanpa perlu mengisi ulang identitas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
