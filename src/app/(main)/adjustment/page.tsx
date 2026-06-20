'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Adjustment } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiAdjustment() {
  const { adjustment, barang, genId, addAdjustment } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tgl, setTgl] = useState('');
  const [barangId, setBarangId] = useState('');
  const [sistem, setSistem] = useState('');
  const [aktual, setAktual] = useState('');
  const [ket, setKet] = useState('');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!barangId && barang.length > 0) {
      setBarangId(barang[0].id);
      setSistem(barang[0].stok.toString());
      return;
    }

    const selected = barang.find(x => x.id === barangId);
    if (selected) {
      setSistem(selected.stok.toString());
    }
  }, [barang, barangId]);

  const handleBarangChange = (id: string) => {
    setBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) setSistem(b.stok.toString());
  };

  const handleTambah = () => {
    if (aktual === '') { 
      toast('Stok aktual wajib diisi!', true); 
      return; 
    }

    const akt = Number(aktual);
    const b = barang.find(x => x.id === barangId);

    if (!b) return;

    const sys = b.stok;
    const selisih = akt - sys; // Menghitung kuantitas perubahan secara dinamis

    const newAdj: Adjustment = {
      id: genId('ADJ'),
      tgl,
      barangId,
      namaBarang: b.nama,
      qty: selisih, // Masuk ke properti qty sesuai StoreContext baru
      satuan: b.satuan,
      keterangan: ket
    };

    addAdjustment(newAdj);
    
    setAktual(''); 
    setKet('');
    setIsModalOpen(false);

    const sign = selisih > 0 ? '+' : '';
    toast(`✓ Adjustment berhasil dicatat. Selisih: ${sign}${selisih}`);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Stock Adjustment (Penyesuaian Stok)</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Buat Adjustment
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. ADJ</th>
              <th>Tanggal</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Qty Perubahan (Selisih)</th>
              <th>Satuan</th>
              <th>Keterangan / Alasan</th>
            </tr>
          </thead>
          <tbody>
            {adjustment.length > 0 ? (
              adjustment.map(adj => (
                <tr key={adj.id}>
                  <td className="mono">{adj.id}</td>
                  <td>{adj.tgl}</td>
                  <td className="mono">{adj.barangId}</td>
                  <td><strong>{adj.namaBarang}</strong></td>
                  <td>
                    <span style={{ 
                      color: adj.qty > 0 ? 'var(--green)' : adj.qty < 0 ? 'var(--red)' : 'inherit', 
                      fontWeight: 'bold' 
                    }}>
                      {adj.qty > 0 ? '+' : ''}{adj.qty}
                    </span>
                  </td>
                  <td>{adj.satuan}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '13px' }}>{adj.keterangan || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-sliders"></i>
                    <p>Belum ada data riwayat adjustment</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Input Adjustment Stok">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Barang Yang Disesuaikan <span style={{ color: 'red' }}>*</span></label>
            <select className="input" value={barangId} onChange={e => handleBarangChange(e.target.value)}>
              {barang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stok Sistem (Saat Ini)</label>
            <input className="input" readOnly value={sistem} />
          </div>
          <div className="form-group">
            <label className="form-label">Stok Aktual / Fisik Nyata <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="number" placeholder="0" min="0" value={aktual} onChange={e => setAktual(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Keterangan / Alasan Koreksi</label>
          <input className="input" placeholder="Contoh: Selisih stock opname, barang pecah, dll." value={ket} onChange={e => setKet(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan Adjustment</button>
        </div>
      </Modal>
    </div>
  );
}