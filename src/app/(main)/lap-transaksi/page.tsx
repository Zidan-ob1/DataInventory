'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import StatCard from '@/components/StatCard';

export default function LaporanTransaksi() {
  const { pembelian, penjualan } = useStore();

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const totalBeli = pembelian.reduce((a, p) => a + (p.qty * p.harga), 0);
  const totalJual = penjualan.reduce((a, p) => a + (p.qty * p.harga), 0);
  // Estimasi Laba = totalJual - totalBeli (sederhana)
  const laba = totalJual - totalBeli;

  const allTrans = [
    ...pembelian.map(p => ({ 
      id: p.id, tgl: p.tgl, jenis: 'Pembelian', dokumen: p.id, 
      pihak: p.supplier, barang: p.barang, qty: p.qty, total: p.qty * p.harga 
    })),
    ...penjualan.map(p => ({ 
      id: p.id, tgl: p.tgl, jenis: 'Penjualan', dokumen: p.id, 
      pihak: p.pelanggan, barang: p.barang, qty: p.qty, total: p.qty * p.harga 
    }))
  ].sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="lap-stats">
        <StatCard 
          icon="" iconBg="transparent" iconColor="transparent"
          label="Total Nilai Pembelian" value={fmt(totalBeli)} sub="seluruh periode"
        />
        <StatCard 
          icon="" iconBg="transparent" iconColor="transparent"
          label="Total Nilai Penjualan" value={fmt(totalJual)} sub="seluruh periode"
        />
        <StatCard 
          icon="" iconBg="transparent" iconColor="transparent"
          label="Estimasi Laba Kotor" value={fmt(laba)} sub="penjualan - HPP"
          valueColor="var(--green)"
        />
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Rekap Semua Transaksi</span>
          <button className="btn btn-sm" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Cetak
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>No. Dokumen</th>
                <th>Pihak</th>
                <th>Barang</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {allTrans.length > 0 ? (
                allTrans.map(t => (
                  <tr key={`${t.jenis}-${t.id}`}>
                    <td>{t.tgl}</td>
                    <td>
                      <span className={`badge ${t.jenis === 'Pembelian' ? 'badge-blue' : 'badge-green'}`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="mono">{t.dokumen}</td>
                    <td>{t.pihak}</td>
                    <td>{t.barang}</td>
                    <td>{t.qty}</td>
                    <td><strong>{fmt(t.total)}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <i className="fa-solid fa-file-lines"></i>
                      <p>Belum ada data laporan transaksi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
