'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

export default function LaporanSupplier() {
  const { supplier, pembelian } = useStore();

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Laporan Pembelian per Supplier</span>
        <button className="btn btn-sm" onClick={handlePrint}>
          <i className="fa-solid fa-print"></i> Cetak
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Kontak</th>
              <th>Jml Transaksi</th>
              <th>Total Pembelian</th>
              <th>Item Terbanyak</th>
            </tr>
          </thead>
          <tbody>
            {supplier.length > 0 ? (
              supplier.map(s => {
                const sPurchases = pembelian.filter(p => p.supplierId === s.id);
                const total = sPurchases.reduce((a, p) => a + p.qty * p.harga, 0);
                const jmlTrans = sPurchases.length;
                
                // Item terbanyak dibeli
                const itemCounts: Record<string, number> = {};
                sPurchases.forEach(p => {
                  itemCounts[p.barang] = (itemCounts[p.barang] || 0) + p.qty;
                });
                let topItem = '-';
                let maxQty = 0;
                Object.entries(itemCounts).forEach(([b, q]) => {
                  if (q > maxQty) {
                    maxQty = q;
                    topItem = b;
                  }
                });

                return (
                  <tr key={s.id}>
                    <td className="mono">{s.id}</td>
                    <td><strong>{s.nama}</strong></td>
                    <td>{s.telp || '-'}</td>
                    <td>{jmlTrans}</td>
                    <td><strong>{fmt(total)}</strong></td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{topItem}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty">
                    <i className="fa-solid fa-file-invoice"></i>
                    <p>Belum ada data laporan supplier</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
