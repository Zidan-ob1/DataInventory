'use client';

import React, { useState } from 'react';
import { useStore, Pelanggan } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterPelanggan() {
  const { pelanggan, penjualan, genId, addPelanggan, deletePelanggan } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [tipe, setTipe] = useState('Umum');
  const [alamat, setAlamat] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handleTambah = () => {
    if (!nama.trim()) {
      toast('Nama pelanggan wajib diisi!', true);
      return;
    }
    
    const newPelanggan: Pelanggan = {
      id: genId('P'),
      nama,
      telp,
      tipe,
      alamat
    };

    addPelanggan(newPelanggan);
    
    // Reset form
    setNama(''); setTelp(''); setTipe('Umum'); setAlamat('');
    setIsModalOpen(false);
    toast('✓ Pelanggan berhasil ditambahkan');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Pelanggan ini?')) {
      deletePelanggan(id);
      toast('✓ Pelanggan berhasil dihapus');
    }
  };

  const getTipeBadge = (t: string) => {
    const badgeMap: Record<string, string> = {
      Umum: 'badge-gray',
      Kontraktor: 'badge-blue',
      Reseller: 'badge-green',
      Proyek: 'badge-amber'
    };
    return badgeMap[t] || 'badge-gray';
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Daftar Pelanggan</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Tambah Pelanggan
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Telepon</th>
              <th>Tipe</th>
              <th>Alamat</th>
              <th>Total Pembelian</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pelanggan.length > 0 ? (
              pelanggan.map(p => {
                const total = penjualan.filter(j => j.pelangganId === p.id).reduce((a, j) => a + j.qty * j.harga, 0);
                return (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td><strong>{p.nama}</strong></td>
                    <td>{p.telp || '-'}</td>
                    <td><span className={`badge ${getTipeBadge(p.tipe)}`}>{p.tipe}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.alamat || '-'}</td>
                    <td><strong>{fmt(total)}</strong></td>
                    <td>
                      <button className="btn btn-icon btn-danger" onClick={() => handleDelete(p.id)} title="Hapus">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-users"></i>
                    <p>Belum ada data pelanggan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pelanggan">
        <div className="form-group">
          <label className="form-label">Nama Pelanggan <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: Budi Santoso" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input className="input" placeholder="08xxx" value={telp} onChange={e => setTelp(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Pelanggan</label>
            <select className="input" value={tipe} onChange={e => setTipe(e.target.value)}>
              <option>Umum</option>
              <option>Kontraktor</option>
              <option>Reseller</option>
              <option>Proyek</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Alamat</label>
          <input className="input" placeholder="Jl. Raya No. 5, Jakarta" value={alamat} onChange={e => setAlamat(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
