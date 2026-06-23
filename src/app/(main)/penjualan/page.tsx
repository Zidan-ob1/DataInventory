'use client';

import React, { useState } from 'react';
import { useStore, Penjualan } from '@/context/StoreContext';
import Modal from '@/components/Modal';

export default function TransaksiPenjualan() {
  const { penjualan } = useStore();
  
  // State untuk menangkap data baris penjualan yang diklik untuk modal rincian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Penjualan | null>(null);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Fungsi membuka pop-up modal rincian
  const handleBukaRincian = (nota: Penjualan) => {
    setSelectedNota(nota);
    setIsModalOpen(true);
  };

  // Fungsi cetak struk nota yang dipicu dari dalam pop-up modal
  const handleCetakNota = (pj: Penjualan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
      <head>
        <title>Cetak Faktur Penjualan ${pj.id}</title>
        <style>
          body { font-family: monospace; padding: 20px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #000; padding: 6px 4px; text-align: left; font-size: 13px; }
          .text-right { text-align: right; }
          hr { border: none; border-top: 1px dashed #000; margin: 15px 0; }
          .header { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h3 style="margin: 0; padding: 0;">FAKTUR PENJUALAN</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px;">InvManager System</p>
        </div>
        <p>
          <b>No. Faktur :</b> ${pj.id}<br/>
          <b>Tanggal    :</b> ${pj.tgl}<br/>
          <b>Pelanggan  :</b> ${pj.pelangganNama}
        </p>
        <hr/>
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Barang</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Harga</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${pj.detail.map(d => `
              <tr>
                <td>${d.kodeBarang}</td>
                <td>${d.namaBarang}</td>
                <td class="text-right">${d.qty}</td>
                <td class="text-right">${d.hargaSatuan.toLocaleString('id-ID')}</td>
                <td class="text-right">${d.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <hr/>
        <h3 class="text-right" style="margin-top: 10px;">Total Penjualan: Rp ${pj.totalPenjualan.toLocaleString('id-ID')}</h3>
        <p style="text-align: center; margin-top: 40px; font-size: 11px;">-- Terima Kasih Atas Kunjungan Anda --</p>
        <script>
          window.print();
          window.close();
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Riwayat Transaksi Penjualan / Faktur (Automated)</span>
        {/* 🛠️ REVISI: Tombol input kasir penjualan manual sudah ditiadakan sesuai instruksi */}
      </div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Faktur</th>
              <th>Tanggal</th>
              <th>Nama Pelanggan</th>
              <th>Jumlah Item</th>
              <th>Total Penjualan</th>
              
              <th style={{ textAlign: 'center' }}>Rincian</th>
            </tr>
          </thead>
          <tbody>
            {penjualan.length > 0 ? (
              penjualan.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.tgl}</td>
                  <td><strong>{p.pelangganNama}</strong></td>
                  <td>{p.detail.length} Item</td>
                  <td><strong>{fmt(p.totalPenjualan)}</strong></td>
                  
                  <td style={{ textAlign: 'center' }}>
                    {/* 🛠️ REVISI: Tombol "👁️ Lihat Detail" di ujung kolom kanan */}
                    <button 
                      className="btn btn-icon btn-primary btn-sm" 
                      onClick={() => handleBukaRincian(p)}
                      title="Lihat Rincian Faktur"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-receipt"></i>
                    <p>Belum ada data limpahan transaksi penjualan dari Master Pelanggan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL RINCIAN NOTA PENJUALAN ==================== */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedNota(null); }} 
        title={`Rincian Faktur Penjualan - ${selectedNota?.id}`}
      >
        {selectedNota && (
          <>
            <div style={{ marginBottom: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><span style={{ color: 'var(--text2)' }}>Tanggal Faktur:</span> <strong>{selectedNota.tgl}</strong></div>
              <div><span style={{ color: 'var(--text2)' }}>Nama Pelanggan:</span> <strong>{selectedNota.pelangganNama}</strong></div>
            </div>

            <div className="table-wrap" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              <table style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNota.detail.map((item, idx) => (
                    <tr key={idx}>
                      <td className="mono">{item.kodeBarang}</td>
                      <td><strong>{item.namaBarang}</strong></td>
                      <td style={{ textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(item.hargaSatuan)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ 
              background: 'var(--surface2)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '12px 14px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px'
            }}>
              <span style={{ color: 'var(--text2)', fontSize: '13px' }}>Grand Total Tagihan:</span>
              <strong style={{ fontSize: '16px', color: 'var(--text1)' }}>{fmt(selectedNota.totalPenjualan)}</strong>
            </div>

            <div className="modal-footer">
              <button className="btn" type="button" onClick={() => { setIsModalOpen(false); setSelectedNota(null); }}>Tutup</button>
              {/* 🛠️ REVISI: Tombol Cetak / Print Nota berada di dalam pop-up tampilan rincian */}
              <button className="btn btn-primary" type="button" onClick={() => handleCetakNota(selectedNota)}>
                <i className="fa-solid fa-print"></i> Cetak / Print Nota
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}