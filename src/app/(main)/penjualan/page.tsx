'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Penjualan, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiPenjualan() {
  const { penjualan, pelanggan, barang, genId, addPenjualan } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tgl, setTgl] = useState('');
  const [pelangganId, setPelangganId] = useState('');
  
  // Temp Detail Item State
  const [selectedBarangId, setSelectedBarangId] = useState('');
  const [qty, setQty] = useState('');
  const [harga, setHarga] = useState('');
  const [stokInfo, setStokInfo] = useState('');
  const [itemsList, setItemsList] = useState<DetailTransaksi[]>([]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
    if (pelanggan.length > 0) setPelangganId(pelanggan[0].id);
    if (barang.length > 0) {
      setSelectedBarangId(barang[0].id);
      setHarga(barang[0].hjual.toString());
      setStokInfo(`Stok: ${barang[0].stok} ${barang[0].satuan}`);
    }
  }, [pelanggan, barang]);

  const handleBarangChange = (id: string) => {
    setSelectedBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) {
      setHarga(b.hjual.toString());
      setStokInfo(`Stok: ${b.stok} ${b.satuan}`);
    }
  };

  const handleTambahBaris = () => {
    const q = Number(qty);
    const h = Number(harga);
    if (!q || q < 1) { toast('Quantity minimal 1!', true); return; }
    
    const b = barang.find(x => x.id === selectedBarangId);
    if (!b) return;

    if (b.stok < q) {
      toast(`Stok kurang! Tersedia: ${b.stok}`, true);
      return;
    }

    if (itemsList.some(item => item.barangId === selectedBarangId)) {
      toast('Barang sudah dimasukkan!', true);
      return;
    }

    const newItem: DetailTransaksi = {
      barangId: b.id,
      kodeBarang: b.id,
      namaBarang: b.nama,
      qty: q,
      hargaSatuan: h,
      subtotal: q * h
    };

    setItemsList(prev => [...prev, newItem]);
    setQty('');
  };

  const handleCetakNota = (pj: Penjualan) => {
    const printWindow = window.open('', '_blank');
    if(!printWindow) return;
    
    let htmlContent = `
      <html>
      <head><title>Cetak Nota Faktur ${pj.id}</title><style>body{font-family:monospace;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border-bottom:1px solid #000;padding:5px;text-align:left;}hr{border:none;border-top:1px dashed #000;}</style></head>
      <body>
        <h3>FAKTUR PENJUALAN TOKO</h3>
        <p>No. Faktur: ${pj.id}<br/>Tanggal: ${pj.tgl}<br/>Pelanggan: ${pj.pelangganNama}</p>
        <hr/>
        <table>
          <thead><tr><th>Barang</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead>
          <tbody>
            ${pj.detail.map(d=>`<tr><td>${d.namaBarang}</td><td>${d.qty}</td><td>${d.hargaSatuan}</td><td>${d.subtotal}</td></tr>`).join('')}
          </tbody>
        </table>
        <h4 style="text-align:right;">Grand Total: Rp ${pj.totalPenjualan.toLocaleString('id-ID')}</h4>
        <p style="text-align:center;margin-top:30px;">-- Terima Kasih --</p>
        <script>window.print();window.close();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const grandTotal = itemsList.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSimpanFaktur = () => {
    if (itemsList.length === 0) {
      toast('Rincian barang kosong!', true);
      return;
    }

    const p = pelanggan.find(x => x.id === pelangganId);
    if (!p) return;

    const newPenjualan: Penjualan = {
      id: genId('FK'),
      tgl,
      pelangganId,
      pelangganNama: p.namaPelanggan,
      detail: itemsList,
      totalPenjualan: grandTotal,
      status: 'Lunas'
    };

    addPenjualan(newPenjualan);
    setItemsList([]);
    setIsModalOpen(false);
    toast(`✓ Faktur ${newPenjualan.id} berhasil dicatat.`);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Transaksi Penjualan (Kasir)</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setItemsList([]); setIsModalOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Buat Penjualan Baru
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Faktur</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Jumlah Item</th>
              <th>Total Penjualan</th>
              <th>Status</th>
              <th>Cetak</th>
            </tr>
          </thead>
          <tbody>
            {penjualan.length > 0 ? (
              penjualan.map(pj => (
                <tr key={pj.id}>
                  <td className="mono">{pj.id}</td>
                  <td>{pj.tgl}</td>
                  <td>{pj.pelangganNama}</td>
                  <td>{pj.detail.length} Item</td>
                  <td><strong>{fmt(pj.totalPenjualan)}</strong></td>
                  <td><span className="badge badge-green">{pj.status}</span></td>
                  <td>
                    <button className="btn btn-icon btn-primary btn-sm" onClick={() => handleCetakNota(pj)} title="Print Nota">
                      <i className="fa-solid fa-print"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-receipt"></i>
                    <p>Belum ada data penjualan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Faktur Penjualan">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal Transaksi</label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Pelanggan</label>
            <select className="input" value={pelangganId} onChange={e => setPelangganId(e.target.value)}>
              {pelanggan.map(p => <option key={p.id} value={p.id}>{p.namaPelanggan}</option>)}
            </select>
          </div>
        </div>

        <div style={{ border: '1px dashed var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', margin: '14px 0' }}>
          <div className="form-group">
            <select className="input" value={selectedBarangId} onChange={e => handleBarangChange(e.target.value)}>
              {barang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </div>
          <div className="form-row" style={{ marginTop: '8px' }}>
            <div className="form-group">
              <input className="input" type="number" placeholder="Qty Keluar" value={qty} onChange={e => setQty(e.target.value)} />
              <div className="form-info" style={{ color: 'orange' }}>{stokInfo}</div>
            </div>
            <div className="form-group">
              <input className="input" type="number" placeholder="Harga Jual" value={harga} onChange={e => setHarga(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="button" onClick={handleTambahBaris}>
              <i className="fa-solid fa-cart-plus"></i> Tambah
            </button>
          </div>
        </div>

        <div className="table-wrap" style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
          <table style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Barang</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, i) => (
                <tr key={i}>
                  <td>{item.namaBarang}</td>
                  <td>{item.qty}</td>
                  <td>{fmt(item.hargaSatuan)}</td>
                  <td>{fmt(item.subtotal)}</td>
                  <td>
                    <button className="btn btn-icon btn-danger btn-xs" onClick={() => setItemsList(prev => prev.filter((_, idx)=>idx!==i))}>
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Grand Total Penjualan:</span>
          <strong>{fmt(grandTotal)}</strong>
        </div>

        <div className="modal-footer">
          <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" type="button" onClick={handleSimpanFaktur}><i className="fa-solid fa-check"></i> Simpan Faktur</button>
        </div>
      </Modal>
    </div>
  );
}