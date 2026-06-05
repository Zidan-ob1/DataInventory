'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Pembelian } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiPembelian() {
  const { pembelian, supplier, barang, genId, addPembelian } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tgl, setTgl] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [barangId, setBarangId] = useState('');
  const [qty, setQty] = useState('');
  const [harga, setHarga] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
    if (supplier.length > 0) setSupplierId(supplier[0].id);
    if (barang.length > 0) {
      setBarangId(barang[0].id);
      setHarga(barang[0].hbeli.toString());
    }
  }, [supplier, barang]);

  const handleBarangChange = (id: string) => {
    setBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) setHarga(b.hbeli.toString());
  };

  const handleTambah = () => {
    const q = Number(qty);
    const h = Number(harga);

    if (!q || q < 1) { toast('Quantity tidak valid!', true); return; }
    if (!h) { toast('Harga wajib diisi!', true); return; }

    const s = supplier.find(x => x.id === supplierId);
    const b = barang.find(x => x.id === barangId);

    if (!s || !b) return;

    const newPembelian: Pembelian = {
      id: genId('PB'),
      tgl,
      supplierId,
      supplier: s.nama,
      barangId,
      barang: b.nama,
      qty: q,
      harga: h,
      status: 'Selesai'
    };

    addPembelian(newPembelian);
    
    setQty('');
    setIsModalOpen(false);
    toast(`✓ Pembelian ${b.nama} berhasil dicatat. Stok +${q}`);
  };

  const totalCalc = (Number(qty) || 0) * (Number(harga) || 0);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Transaksi Pembelian</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Buat Pembelian
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Nota</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th>Barang</th>
              <th>Qty</th>
              <th>Harga Satuan</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pembelian.length > 0 ? (
              pembelian.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.tgl}</td>
                  <td>{p.supplier}</td>
                  <td>{p.barang}</td>
                  <td>{p.qty}</td>
                  <td>{fmt(p.harga)}</td>
                  <td><strong>{fmt(p.qty * p.harga)}</strong></td>
                  <td><span className="badge badge-green">{p.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty">
                    <i className="fa-solid fa-cart-shopping"></i>
                    <p>Belum ada data pembelian</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Transaksi Pembelian">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Supplier <span style={{ color: 'red' }}>*</span></label>
            <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              {supplier.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Barang <span style={{ color: 'red' }}>*</span></label>
          <select className="input" value={barangId} onChange={e => handleBarangChange(e.target.value)}>
            {barang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="input" type="number" placeholder="50" min="1" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Harga Beli / Satuan (Rp)</label>
            <input className="input" type="number" min="0" value={harga} onChange={e => setHarga(e.target.value)} />
          </div>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text2)' }}>Total:</span>
          <strong style={{ marginLeft: '8px' }}>{fmt(totalCalc)}</strong>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
