'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

interface TransaksiMapped {
  id: string;
  tgl: string;
  jenis: string;
  dokumen: string;
  pihak: string;
  barang: string;
  qty: number;
  total: number;
}

export default function LaporanTransaksi() {
  const { pembelian, penjualan } = useStore();

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const totalBeli = pembelian.reduce((a, p) => a + (p.totalPembelian || 0), 0);
  const totalJual = penjualan.reduce((a, p) => a + (p.totalPenjualan || 0), 0);
  const laba = totalJual - totalBeli;

  // 🛠️ PERBAIKAN STRUKTUR MAPPING (Memastikan tipe data terdefinisi dengan benar)
  const allTrans: TransaksiMapped[] = [
    ...pembelian.map((p) => {
      const itemPertama = p.detail?.[0];
      const sisaItem = p.detail && p.detail.length > 1 ? ` (+${p.detail.length - 1})` : '';
      const totalQty = p.detail?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

      return { 
        id: p.id, 
        tgl: p.tgl, 
        jenis: 'Pembelian', 
        dokumen: p.id, 
        pihak: p.supplierNama || '-', 
        barang: itemPertama ? `${itemPertama.namaBarang}${sisaItem}` : 'Tidak ada data barang', 
        qty: totalQty, 
        total: p.totalPembelian || 0
      };
    }),
    ...penjualan.map((p) => {
      const itemPertama = p.detail?.[0];
      const sisaItem = p.detail && p.detail.length > 1 ? ` (+${p.detail.length - 1})` : '';
      const totalQty = p.detail?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

      return { 
        id: p.id, 
        tgl: p.tgl, 
        jenis: 'Penjualan', 
        dokumen: p.id, 
        pihak: p.pelangganNama || '-', 
        barang: itemPertama ? `${itemPertama.namaBarang}${sisaItem}` : 'Tidak ada data barang', 
        qty: totalQty, 
        total: p.totalPenjualan || 0
      };
    })
  ].sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="card" style={{ marginBottom: '20px', padding: '20px', display: 'flex', gap: '20px', background: 'var(--surface)' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Pengeluaran (Beli)</span>
          <h2 style={{ margin: '4px 0 0 0', color: 'var(--blue)' }}>{fmt(totalBeli)}</h2>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Pendapatan (Jual)</span>
          <h2 style={{ margin: '4px 0 0 0', color: 'var(--green)' }}>{fmt(totalJual)}</h2>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Estimasi Keuntungan (Laba)</span>
          <h2 style={{ margin: '4px 0 0 0', color: laba >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(laba)}</h2>
        </div>
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
                allTrans.map((t) => (
                  <tr key={`${t.jenis}-${t.id}`}>
                    <td>{t.tgl}</td>
                    <td>
                      <span className={`badge ${t.jenis === 'Pembelian' ? 'badge-blue' : 'badge-green'}`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="mono">{t.dokumen}</td>
                    <td>{t.pihak}</td>
                    <td><strong>{t.barang}</strong></td>
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