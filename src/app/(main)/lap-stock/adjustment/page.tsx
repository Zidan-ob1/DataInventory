'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, Adjustment } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function AdjustmentStok() {
  const pathname = usePathname();
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
    if (aktual === '') { toast('Stok aktual wajib diisi!', true); return; }

    const akt = Number(aktual);
    const b = barang.find(x => x.id === barangId);

    if (!b) return;

    const sys = b.stok;
    const selisih = akt - sys;

    const newAdj: Adjustment = {
      id: genId('ADJ'),
      tgl,
      barangId,
      barang: b.nama,
      sistem: sys,
      aktual: akt,
      selisih,
      ket
    };

    addAdjustment(newAdj);
    
    setAktual(''); setKet('');
    setIsModalOpen(false);

    const sign = selisih > 0 ? '+' : '';
    toast(`✓ Adjustment berhasil. Selisih: ${sign}${selisih}`);
  };

  return (
    <>
      <div className="subnav">
        <Link href="/lap-stock" className={`subnav-link ${pathname === '/lap-stock' ? 'active' : ''}`}>
          Laporan Stok
        </Link>
        <Link href="/lap-stock/adjustment" className={`subnav-link ${pathname === '/lap-stock/adjustment' ? 'active' : ''}`}>
          Adjustment Stok
        </Link>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Adjustment Stok</span>
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
                <th>Barang</th>
                <th>Stok Sistem</th>
                <th>Stok Aktual</th>
                <th>Selisih</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {adjustment.length > 0 ? (
                adjustment.map(adj => (
                  <tr key={adj.id}>
                    <td className="mono">{adj.id}</td>
                    <td>{adj.tgl}</td>
                    <td>{adj.barang}</td>
                    <td>{adj.sistem}</td>
                    <td>{adj.aktual}</td>
                    <td>
                      <span style={{ color: adj.selisih > 0 ? 'var(--green)' : adj.selisih < 0 ? 'var(--red)' : 'inherit', fontWeight: 'bold' }}>
                        {adj.selisih > 0 ? '+' : ''}{adj.selisih}
                      </span>
                    </td>
                    <td>{adj.ket}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <i className="fa-solid fa-sliders"></i>
                      <p>Belum ada data adjustment</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adjustment Stok">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Barang <span style={{ color: 'red' }}>*</span></label>
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
              <label className="form-label">Stok Aktual (Fisik) <span style={{ color: 'red' }}>*</span></label>
              <input className="input" type="number" placeholder="0" min="0" value={aktual} onChange={e => setAktual(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input className="input" placeholder="Contoh: Kerusakan barang, kehilangan, dll." value={ket} onChange={e => setKet(e.target.value)} />
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan Adjustment</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
