'use client';

import React from 'react';
import { useStore, Barang } from '@/context/StoreContext';

export default function LaporanStok() {
  const { barang } = useStore();

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const stokBadge = (b: Barang) => {
    if (b.stok === 0) return <span className="badge badge-red">Habis</span>;
    if (b.stok <= b.minstok) return <span className="badge badge-amber">Menipis</span>;
    return <span className="badge badge-green">Normal</span>;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Laporan Stok Barang</span>
        <button className="btn btn-sm" onClick={handlePrint}>
          <i className="fa-solid fa-print"></i> Cetak
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Barang</th>
              <th>Satuan</th>
              <th>Stok</th>
              <th>Min. Stok</th>
              <th>Harga Beli</th>
              <th>Harga Jual</th>
              <th>Nilai Stok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {barang.length > 0 ? (
              barang.map(b => (
                <tr key={b.id}>
                  <td className="mono">{b.id}</td>
                  <td><strong>{b.nama}</strong></td>
                  <td>{b.satuan}</td>
                  <td><strong>{b.stok}</strong></td>
                  <td>{b.minstok}</td>
                  <td>{fmt(b.hbeli)}</td>
                  <td>{fmt(b.hjual)}</td>
                  <td><strong>{fmt(b.stok * b.hbeli)}</strong></td>
                  <td>{stokBadge(b)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty">
                    <i className="fa-solid fa-chart-bar"></i>
                    <p>Belum ada data laporan stok</p>
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
