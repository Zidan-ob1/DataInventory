'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

export default function LaporanStok() {
  const { barang } = useStore();

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Laporan Stok Barang (Read-Only)</span>
          <button className="btn btn-sm" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Cetak Laporan
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th>Stok Aktual</th>
                <th>Min. Stok Alert</th>
                <th>Harga Beli Akhir</th>
                <th>Harga Jual Toko</th>
              </tr>
            </thead>
            <tbody>
              {barang.length > 0 ? (
                barang.map(b => (
                  <tr key={b.id}>
                    <td className="mono">{b.id}</td>
                    <td><strong>{b.nama}</strong></td>
                    <td>{b.satuan}</td>
                    <td>
                      <span style={{ 
                        color: b.stok <= b.minstok ? 'var(--red)' : 'inherit', 
                        fontWeight: b.stok <= b.minstok ? 'bold' : 'normal' 
                      }}>
                        {b.stok} {b.stok <= b.minstok ? ' ' : ''}
                      </span>
                    </td>
                    <td>{b.minstok}</td>
                    <td>{fmt(b.hbeli)}</td>
                    <td>{fmt(b.hjual)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
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
    </>
  );
}