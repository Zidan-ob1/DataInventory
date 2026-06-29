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
    
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }
   const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;
    
    let htmlContent = `
    <html>
      <head>
        <title>Faktur Penjualan ${pj.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            padding: 30px; 
            color: #1a1a1a; 
            background: #fff;
            max-width: 600px;
            margin: 0 auto;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f4f4f5;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .brand-title { margin: 0; font-size: 22px; font-weight: 700; color: #18181b; letter-spacing: -0.5px; }
          .brand-sub { margin: 4px 0 0 0; font-size: 13px; color: #71717a; }
          .invoice-badge {
            background: #e1f5fe; color: #0288d1;
            padding: 6px 12px; borderRadius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
          }
          .meta-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
            font-size: 13px; margin-bottom: 30px; line-height: 1.5;
          }
          .meta-label { color: #71717a; font-weight: 500; }
          .meta-value { color: #18181b; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { 
            background: #f8f8f9; color: #71717a; font-size: 12px; 
            font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
            padding: 12px 8px; text-align: left; border-bottom: 1px solid #e4e4e7;
          }
          td { padding: 14px 8px; font-size: 13px; color: #27272a; border-bottom: 1px solid #f4f4f5; }
          .text-right { text-align: right; }
          .item-name { font-weight: 600; color: #18181b; margin-bottom: 2px; }
          .item-code { font-size: 11px; color: #a1a1aa; font-family: monospace; }
          .grand-total-container {
            margin-top: 24px; padding: 16px; background: #f8f8f9; 
            border-radius: 8px; display: flex; justify-content: space-between; align-items: center;
          }
          .total-label { font-size: 14px; font-weight: 600; color: #71717a; }
          .total-value { font-size: 18px; font-weight: 700; color: #18181b; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #a1a1aa; font-weight: 500; }
          @media print {
            body { padding: 0; margin: 0; max-width: 100%; }
            .grand-total-container { background: #f8f8f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div>
            <h2 class="brand-title">FAKTUR PENJUALAN</h2>
            <p class="brand-sub">InvManager System v1.0</p>
          </div>
          <div class="invoice-badge">INVOICE</div>
        </div>
        
        <div class="meta-grid">
          <div>
            <span class="meta-label">No. Faktur</span><br/>
            <span class="meta-value" style="font-family: monospace;">${pj.id}</span>
          </div>
          <div>
            <span class="meta-label">Tanggal Transaksi</span><br/>
            <span class="meta-value">${pj.tgl}</span>
          </div>
          <div style="grid-column: span 2;">
            <span class="meta-label">Pelanggan</span><br/>
            <span class="meta-value">${pj.pelangganNama}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Detail Barang</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Harga</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${pj.detail.map(d => `
              <tr>
                <td>
                  <div class="item-name">${d.namaBarang}</div>
                  <div class="item-code">${d.kodeBarang}</div>
                </td>
                <td class="text-right" style="font-weight: 500;">${d.qty}</td>
                <td class="text-right" style="color: #52525b;">${Math.round(d.hargaSatuan).toLocaleString('id-ID')}</td>
                <td class="text-right" style="font-weight: 600; color: #18181b;">${Math.round(d.subtotal).toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="grand-total-container">
          <span class="total-label">Grand Total Tagihan</span>
          <span class="total-value">Rp ${Math.round(pj.totalPenjualan).toLocaleString('id-ID')}</span>
        </div>

        <div class="footer">
          <p style="margin: 0; letter-spacing: 0.5px;">-- Terima Kasih Atas Kepercayaan Anda --</p>
        </div>
      </body>
      </html>
    `;
    doc.open();
    doc.write(htmlContent);
    doc.close();

   setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);

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