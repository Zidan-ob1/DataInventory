'use client';

import React from 'react';
import StatCard from '@/components/StatCard';
import { useStore } from '@/context/StoreContext';

export default function Dashboard() {
  const { barang, pembelian, penjualan } = useStore();

  const totalBarang = barang.length;
  const totalBeliBulanIni = pembelian.length;
  const totalJualBulanIni = penjualan.length;
  const stokTipis = barang.filter(b => b.stok <= b.minstok);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const allTransactions = [
    ...pembelian.map(p => ({ ...p, type: 'Beli' })),
    ...penjualan.map(p => ({ ...p, type: 'Jual' }))
  ].sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime()).slice(0, 5);

  return (
    <>
      <div className="stats-grid">
        <StatCard 
          icon="fa-boxes-stacked" iconBg="#f0efe9" iconColor="#1a1917"
          label="Total Jenis Barang" value={totalBarang} sub="item terdaftar"
        />
        <StatCard 
          icon="fa-cart-shopping" iconBg="#dce8fb" iconColor="#1a3a6b"
          label="Pembelian Bulan Ini" value={totalBeliBulanIni} sub="transaksi"
        />
        <StatCard 
          icon="fa-receipt" iconBg="#d8f3dc" iconColor="#2d6a4f"
          label="Penjualan Bulan Ini" value={totalJualBulanIni} sub="transaksi"
        />
        <StatCard 
          icon="fa-triangle-exclamation" iconBg="#fff3cd" iconColor="#7d4e00"
          label="Stok Menipis / Habis" value={stokTipis.length} sub="item perlu restock"
          valueColor="#7d4e00"
        />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Transaksi Terbaru</span>
          </div>
          <div className="table-wrap">
            {allTransactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Barang</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map(t => {
                    // Ambil item pertama dari detail transaksi jika ada
                    const itemPertama = t.detail?.[0];
                    const sisaItem = t.detail && t.detail.length > 1 ? ` (+${t.detail.length - 1})` : '';
                    
                    // Menghitung total seluruh qty barang dalam satu nota
                    const totalQty = t.detail?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

                    return (
                      <tr key={t.id}>
                        <td>{t.tgl}</td>
                        <td>
                          <span className={`badge ${t.type === 'Beli' ? 'badge-blue' : 'badge-green'}`}>
                            {t.type}
                          </span>
                        </td>
                        {/* 🛠️ DIUBAH: Menampilkan nama barang dari array detail secara aman */}
                        <td>
                          <strong>{itemPertama ? itemPertama.namaBarang : 'Tidak ada data barang'}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>
                            {sisaItem ? `${sisaItem} item lain` : ''}
                          </span>
                        </td>
                        {/* 🛠️ DIUBAH: Menampilkan akumulasi total Qty dari seluruh item di nota */}
                        <td>{totalQty} {itemPertama?.namaBarang ? t.detail?.[0]?.kodeBarang?.startsWith('B') ? '' : '' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-file-invoice"></i>
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#7d4e00', fontSize: '13px', marginRight: '6px' }}></i> 
              Stok Menipis
            </span>
          </div>
          <div className="table-wrap">
            {stokTipis.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Stok</th>
                    <th>Min. Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {stokTipis.map(b => (
                    <tr key={b.id}>
                      <td>{b.nama}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>{b.stok} {b.satuan}</td>
                      <td>{b.minstok}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-check-circle" style={{ color: 'var(--green)' }}></i>
                <p>Semua stok aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}