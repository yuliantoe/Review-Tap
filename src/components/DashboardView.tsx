import React, { useState } from 'react';
import { useReviewTap } from '../context/ReviewTapContext';
import {
  Radio,
  QrCode,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Filter,
  Download,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    businesses,
    cards,
    scans,
    filterBusinessId,
    setFilterBusinessId,
    timeRange,
    setTimeRange,
    statsSummary,
    exportCsv,
    setActiveTab,
    setInspectCardCode,
  } = useReviewTap();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const selectedBusiness = businesses.find((b) => b.id === filterBusinessId);

  // Maximum value for chart scaling
  const maxDailyScan = Math.max(...statsSummary.dailyStats.map((d) => d.total), 10);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ringkasan & Analitik Scan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data scan kartu NFC & QR 14 hari terakhir melewati link pendek pengalihan.
          </p>
        </div>

        {/* Interactive Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Business Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterBusinessId}
              onChange={(e) => setFilterBusinessId(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua Bisnis ({businesses.length})</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === '14d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Hari
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Hari
            </button>
          </div>

          {/* Export button */}
          <button
            onClick={() => exportCsv('scans')}
            title="Download CSV log scan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Scans */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Scan {timeRange === '7d' ? '7 Hari' : timeRange === '14d' ? '14 Hari' : '30 Hari'} Terakhir</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {statsSummary.totalScans.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              +{statsSummary.growthPercent}% tren
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Jumlah orang yang menempelkan kartu NFC atau memindai QR.
          </p>
        </div>

        {/* Metric 2: Rasio NFC vs QR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rasio Sumber Masuk</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {statsSummary.nfcRatio.toFixed(0)}% NFC
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              · {statsSummary.qrRatio.toFixed(0)}% QR
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${statsSummary.nfcRatio}%` }}
              title={`NFC: ${statsSummary.nfcScans}`}
            />
            <div
              className="bg-indigo-400 h-full transition-all duration-300"
              style={{ width: `${statsSummary.qrRatio}%` }}
              title={`QR: ${statsSummary.qrScans}`}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {statsSummary.nfcScans} tap NFC · {statsSummary.qrScans} pindai QR
          </p>
        </div>

        {/* Metric 3: Kartu Aktif */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Kartu Aktif Terpasang</span>
            <CreditCard className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {statsSummary.activeCardsCount}
            </span>
            <span className="text-xs text-slate-500">
              dari {statsSummary.totalCardsCount} kartu tercetak
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {cards.filter((c) => c.status === 'baru').length} kartu berstatus baru/siap aktivasi
          </p>
        </div>

        {/* Metric 4: Keberhasilan Pengalihan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tingkat Pengalihan (302)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {statsSummary.successRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">&lt;0.8s latency</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Pengalihan otomatis ke Google Place ID Write Review.
          </p>
        </div>
      </div>

      {/* Main Chart Section: Scan 14 Hari Terakhir */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Aktivitas Scan {timeRange === '7d' ? '7 Hari' : timeRange === '14d' ? '14 Hari' : '30 Hari'} Terakhir
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi harian tap NFC vs pemindaian QR di meja dan konter bisnis.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-sm" />
              <span>NFC Tap ({statsSummary.nfcScans})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-300 rounded-sm" />
              <span>QR Code ({statsSummary.qrScans})</span>
            </div>
          </div>
        </div>

        {/* Interactive Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-64 flex items-end gap-1 sm:gap-2 border-b border-slate-200 pb-2">
            {statsSummary.dailyStats.map((day, idx) => {
              const totalHeightPercent = (day.total / maxDailyScan) * 100;
              const nfcPortionPercent = day.total > 0 ? (day.nfc / day.total) * 100 : 0;
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
                      <p className="font-semibold">{day.displayDate}</p>
                      <p className="font-mono tabular-nums text-slate-300">
                        Total: {day.total} (NFC: {day.nfc}, QR: {day.qr})
                      </p>
                    </div>
                  )}

                  {/* Number above bar */}
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 group-hover:text-slate-800 mb-1">
                    {day.total}
                  </span>

                  {/* Stacked Bar Container */}
                  <div
                    className="w-full max-w-[36px] bg-slate-100 rounded-t-sm flex flex-col justify-end overflow-hidden transition-all duration-200 group-hover:brightness-95"
                    style={{ height: `${Math.max(totalHeightPercent, 4)}%` }}
                  >
                    {/* QR segment (top) */}
                    <div
                      className="w-full bg-indigo-300 transition-all duration-200"
                      style={{ height: `${100 - nfcPortionPercent}%` }}
                    />
                    {/* NFC segment (bottom) */}
                    <div
                      className="w-full bg-blue-600 transition-all duration-200"
                      style={{ height: `${nfcPortionPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date Axis Labels */}
          <div className="flex gap-1 sm:gap-2 pt-2 text-[10px] text-slate-500 font-mono">
            {statsSummary.dailyStats.map((day) => (
              <div key={day.date} className="flex-1 text-center truncate">
                {day.displayDate.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Per Bisnis Breakdown & Live Scan Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Per Bisnis Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Scan Per Bisnis</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dashboard menghitung scan yang melewati link pendek. Angka ulasan riil dibaca dari Google Business Profile.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('businesses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
            >
              <span>Kelola Bisnis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Businesses List */}
          <div className="space-y-3">
            {statsSummary.businessScanCounts.map(({ business, scanCount, nfcCount, qrCount }) => {
              const maxBizScan = statsSummary.businessScanCounts[0]?.scanCount || 1;
              const percent = (scanCount / maxBizScan) * 100;
              const bizCards = cards.filter((c) => c.business_id === business.id && c.status === 'aktif');

              return (
                <div
                  key={business.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition-colors bg-slate-50/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{business.nama}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{business.kota}</span>
                        <span aria-hidden="true">·</span>
                        <span>{bizCards.length} kartu aktif</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                          {business.place_id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                        {scanCount}
                      </span>
                      <span className="text-xs text-slate-500 block">scan</span>
                    </div>
                  </div>

                  {/* Progress Bar & Sub metrics */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>NFC: {nfcCount} · QR: {qrCount}</span>
                      <span>Google Rating: ⭐ {business.rating} ({business.total_ulasan_google} ulasan)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Scan Feed & Perangkat Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Perangkat Breakdown Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Perangkat Pelanggan</h3>
            <p className="text-xs text-slate-500">
              iPhone XS ke atas dan mayoritas Android mendukung NFC langsung tanpa aplikasi tambahan.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block font-sans">Android</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {statsSummary.deviceStats.android}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block font-sans">Apple iOS</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {statsSummary.deviceStats.ios}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block font-sans">Lainnya</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {statsSummary.deviceStats.lain}
                </span>
              </div>
            </div>
          </div>

          {/* Live Scan Activity Log Stream */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Log Scan Terakhir</h3>
                <p className="text-xs text-slate-500">Aliran data scan masuk secara langsung</p>
              </div>
              <button
                onClick={() => setActiveTab('simulator')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Uji Scan</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {scans.slice(0, 10).map((scan) => {
                const targetCard = cards.find((c) => c.code === scan.code);
                const targetBiz = businesses.find((b) => b.id === scan.business_id);
                const scanTime = new Date(scan.waktu);
                const timeFormatted = `${scanTime.getUTCDate()} Okt ${String(scanTime.getUTCHours()).padStart(2, '0')}:${String(scanTime.getUTCMinutes()).padStart(2, '0')}`;

                return (
                  <div
                    key={scan.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <button
                          onClick={() => setInspectCardCode(scan.code)}
                          className="font-mono text-blue-600 hover:underline font-semibold"
                        >
                          #{scan.code}
                        </button>
                        <span className="text-slate-400">·</span>
                        <span className="truncate">{targetBiz ? targetBiz.nama : 'Belum Terpasang'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <span>{scan.sumber.toUpperCase()}</span>
                        <span>·</span>
                        <span>{scan.perangkat}</span>
                        <span>·</span>
                        <span>{timeFormatted}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          scan.hasil === 'redirect'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : scan.hasil === 'aktivasi'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {scan.hasil === 'redirect' ? '302 Sukses' : scan.hasil === 'aktivasi' ? 'Aktivasi' : 'Ditolak'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
