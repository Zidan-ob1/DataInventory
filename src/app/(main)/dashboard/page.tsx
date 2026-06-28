'use client';

import React from 'react';
import StatCard from '@/components/StatCard';
import { useStore } from '@/context/StoreContext';

export default function Dashboard() {
  const { barang, pembelian, penjualan } = useStore();

  const totalBarang = barang.length;

  // 🛠️ REVISI LOGIK: Menghitung total KUANTITAS (QTY) fisik barang yang dibeli dari supplier
  const totalQtyBeli = pembelian.reduce((acc, p) => {
    const qtyNota = p.detail?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) || 0;
    return acc + qtyNota;
  }, 0);

  // 🛠️ REVISI LOGIK: Menghitung total KUANTITAS (QTY) fisik barang yang terjual ke pelanggan
  const totalQtyJual = penjualan.reduce((acc, p) => {
    const qtyFaktur = p.detail?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) || 0;
    return acc + qtyFaktur;
  }, 0);

  const stokTipis = barang.filter(b => b.stok <= b.minstok);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Helper untuk mengubah string tanggal "DD/MM/YYYY" menjadi objek Date yang valid untuk sorting
  const parseDateId = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date(dateStr);
  };

  // Menggabungkan transaksi untuk histori aktivitas terbaru
  const allTransactions = [
    ...pembelian.map(p => ({ id: p.id, tgl: p.tgl, nama: p.supplierNama, total: p.totalPembelian, type: 'Beli' })),
    ...penjualan.map(p => ({ id: p.id, tgl: p.tgl, nama: p.pelangganNama, total: p.totalPenjualan, type: 'Jual' }))
  ].sort((a, b) => parseDateId(b.tgl).getTime() - parseDateId(a.tgl).getTime()).slice(0, 5);

  return (
    <>
      {/* BAGIAN ATAS: Menampilkan 3 StatCard berbasis Kuantitas Fisik Produk */}
      <div className="stats-grid">
        <StatCard 
          icon="fa-boxes-stacked" iconBg="#f0efe9" iconColor="#1a1917"
          label="Total Jenis Barang" value={totalBarang} sub="item Terdaftar"
        />
        <StatCard 
          icon="fa-truck-ramp-box" iconBg="#dce8fb" iconColor="#1a3a6b"
          label="Total Barang Masuk" value={`${totalQtyBeli.toLocaleString('id-ID')} Item`} sub="Pembelian"
        />
        <StatCard 
          icon="fa-cart-arrow-down" iconBg="#e6f4ea" iconColor="#137333"
          label="Total Barang Terjual" value={`${totalQtyJual.toLocaleString('id-ID')} Item`} sub="Penjualan"
        />
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        {/* TABEL 1: Aktivitas Transaksi Terbaru */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktivitas Transaksi Terbaru</span>
          </div>
          <div className="table-wrap">
            {allTransactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nota</th>
                    <th>Tanggal</th>
                    <th>Pihak Kedua</th>
                    <th>Tipe</th>
                    <th style={{ textAlign: 'right' }}>Total Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="mono">{tx.id}</td>
                      <td>{tx.tgl}</td>
                      <td><strong>{tx.nama}</strong></td>
                      <td>
                        <span style={{
                          background: tx.type === 'Beli' ? '#e8f0fe' : '#e6f4ea',
                          color: tx.type === 'Beli' ? '#1a73e8' : '#137333',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {tx.type === 'Beli' ? 'RESTOCK' : 'PENJUALAN'}
                        </span>
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: '600' }}>{fmt(tx.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-file-invoice"></i>
                <p>Belum ada aktivitas transaksi</p>
              </div>
            )}
          </div>
        </div>

        {/* TABEL 2: Peringatan Stok Menipis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d93025', fontSize: '13px', marginRight: '6px' }}></i> 
              Peringatan Stok Menipis
            </span>
          </div>
          <div className="table-wrap">
            {stokTipis.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Stok Aktual</th>
                    <th>Batas Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {stokTipis.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.nama}</strong></td>
                      <td style={{ color: '#d93025', fontWeight: 700 }}>{b.stok} {b.satuan}</td>
                      <td style={{ color: 'var(--text3)' }}>{b.minstok} {b.satuan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-check-circle" style={{ color: '#137333' }}></i>
                <p>Semua stok aman aman saja</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}