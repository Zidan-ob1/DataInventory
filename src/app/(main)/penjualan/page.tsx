'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Penjualan } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiPenjualan() {
  const { penjualan, pelanggan, barang, genId, addPenjualan } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tgl, setTgl] = useState('');
  const [pelangganId, setPelangganId] = useState('');
  const [barangId, setBarangId] = useState('');
  const [qty, setQty] = useState('');
  const [harga, setHarga] = useState('');
  const [stokInfo, setStokInfo] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
    if (pelanggan.length > 0) setPelangganId(pelanggan[0].id);
    if (barang.length > 0) {
      setBarangId(barang[0].id);
      setHarga(barang[0].hjual.toString());
      setStokInfo(`Stok tersedia: ${barang[0].stok} ${barang[0].satuan}`);
    }
  }, [pelanggan, barang]);

  const handleBarangChange = (id: string) => {
    setBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) {
      setHarga(b.hjual.toString());
      setStokInfo(`Stok tersedia: ${b.stok} ${b.satuan}`);
    }
  };

  const handleTambah = () => {
    const q = Number(qty);
    const h = Number(harga);

    if (!q || q < 1) { toast('Quantity tidak valid!', true); return; }
    if (!h) { toast('Harga wajib diisi!', true); return; }

    const p = pelanggan.find(x => x.id === pelangganId);
    const b = barang.find(x => x.id === barangId);

    if (!p || !b) return;

    if (b.stok < q) {
      toast(`Stok tidak mencukupi! Stok tersedia: ${b.stok} ${b.satuan}`, true);
      return;
    }

    const newPenjualan: Penjualan = {
      id: genId('FK'),
      tgl,
      pelangganId,
      pelanggan: p.nama,
      barangId,
      barang: b.nama,
      qty: q,
      harga: h,
      status: 'Lunas'
    };

    addPenjualan(newPenjualan);
    
    setQty('');
    setIsModalOpen(false);
    toast(`✓ Penjualan ${b.nama} berhasil dicatat. Stok -${q}`);
  };

  const totalCalc = (Number(qty) || 0) * (Number(harga) || 0);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Transaksi Penjualan</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Buat Penjualan
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Faktur</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Barang</th>
              <th>Qty</th>
              <th>Harga Satuan</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {penjualan.length > 0 ? (
              penjualan.map(pj => (
                <tr key={pj.id}>
                  <td className="mono">{pj.id}</td>
                  <td>{pj.tgl}</td>
                  <td>{pj.pelanggan}</td>
                  <td>{pj.barang}</td>
                  <td>{pj.qty}</td>
                  <td>{fmt(pj.harga)}</td>
                  <td><strong>{fmt(pj.qty * pj.harga)}</strong></td>
                  <td><span className="badge badge-green">{pj.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Transaksi Penjualan">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Pelanggan <span style={{ color: 'red' }}>*</span></label>
            <select className="input" value={pelangganId} onChange={e => setPelangganId(e.target.value)}>
              {pelanggan.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
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
            <input className="input" type="number" placeholder="10" min="1" value={qty} onChange={e => setQty(e.target.value)} />
            <div className="form-info">{stokInfo}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Harga Jual / Satuan (Rp)</label>
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
