'use client';

import React, { useState } from 'react';
import { useStore, Pembelian } from '@/context/StoreContext';
import Modal from '@/components/Modal';

export default function TransaksiPembelian() {
  const { pembelian } = useStore();
  
  // State untuk mengontrol Pop-up Rincian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Pembelian | null>(null);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Fungsi untuk memicu kemunculan pop-up detail nota
  const handleBukaRincian = (nota: Pembelian) => {
    setSelectedNota(nota);
    setIsModalOpen(true);
  };

  // Fungsi untuk cetak nota yang ada di dalam pop-up
  const handleCetakNota = (pj: Pembelian) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
      <head>
        <title>Cetak Nota Pembelian ${pj.id}</title>
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
          <h3 style="margin: 0; padding: 0;">NOTA MASUK (PEMBELIAN)</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px;">InvManager System</p>
        </div>
        <p>
          <b>No. Nota  :</b> ${pj.id}<br/>
          <b>Tanggal   :</b> ${pj.tgl}<br/>
          <b>Supplier  :</b> ${pj.supplierNama}
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
        <h3 class="text-right" style="margin-top: 10px;">Total Pembelian: Rp ${pj.totalPembelian.toLocaleString('id-ID')}</h3>
        <p style="text-align: center; margin-top: 40px; font-size: 11px;">-- Dokumen Sah Penerimaan Barang Gudang --</p>
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
        <span className="card-title">Riwayat Transaksi Pembelian (Automated)</span>
        {/* 🛠️ REVISI: Tombol "Buat Pembelian" dihapus total sesuai instruksi client */}
      </div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Nota</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th>Jumlah Variasi</th>
              <th>Total Pembelian</th>
              
              <th style={{ textAlign: 'center' }}>Rincian</th>
            </tr>
          </thead>
          <tbody>
            {pembelian.length > 0 ? (
              pembelian.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.tgl}</td>
                  <td><strong>{p.supplierNama}</strong></td>
                  <td>{p.detail.length} Item</td>
                  <td><strong>{fmt(p.totalPembelian)}</strong></td>
                  
                  <td style={{ textAlign: 'center' }}>
                    {/* 🛠️ REVISI: Tombol "👁️ Lihat Detail" di ujung kolom */}
                    <button 
                      className="btn btn-icon btn-primary btn-sm" 
                      onClick={() => handleBukaRincian(p)}
                      title="Lihat Rincian Nota"
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
                    <i className="fa-solid fa-cart-shopping"></i>
                    <p>Belum ada data limpahan transaksi pembelian dari Master</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL RINCIAN NOTA ==================== */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedNota(null); }} 
        title={`Rincian Nota Pembelian - ${selectedNota?.id}`}
      >
        {selectedNota && (
          <>
            <div style={{ marginBottom: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><span style={{ color: 'var(--text2)' }}>Tanggal Nota:</span> <strong>{selectedNota.tgl}</strong></div>
              <div><span style={{ color: 'var(--text2)' }}>Nama Supplier:</span> <strong>{selectedNota.supplierNama}</strong></div>
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
              <span style={{ color: 'var(--text2)', fontSize: '13px' }}>Grand Total Keseluruhan:</span>
              <strong style={{ fontSize: '16px', color: 'var(--text1)' }}>{fmt(selectedNota.totalPembelian)}</strong>
            </div>

            <div className="modal-footer">
              <button className="btn" type="button" onClick={() => { setIsModalOpen(false); setSelectedNota(null); }}>Tutup</button>
              {/* 🛠️ REVISI: Pilihan cetak berada di dalam pop-up tampilan rincian */}
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