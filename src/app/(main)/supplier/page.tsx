'use client';

import React, { useState } from 'react';
import { useStore, Supplier } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterSupplier() {
  const { supplier, pembelian, genId, addSupplier, deleteSupplier } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handleTambah = () => {
    if (!nama.trim()) {
      toast('Nama supplier wajib diisi!', true);
      return;
    }
    
    const newSupplier: Supplier = {
      id: genId('S'),
      nama,
      telp,
      email,
      alamat
    };

    addSupplier(newSupplier);
    
    // Reset form
    setNama(''); setTelp(''); setEmail(''); setAlamat('');
    setIsModalOpen(false);
    toast('✓ Supplier berhasil ditambahkan');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Supplier ini?')) {
      deleteSupplier(id);
      toast('✓ Supplier berhasil dihapus');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Daftar Supplier</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Tambah Supplier
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Telepon</th>
              <th>Email</th>
              <th>Alamat</th>
              <th>Total Pembelian</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {supplier.length > 0 ? (
              supplier.map(s => {
                const total = pembelian.filter(p => p.supplierId === s.id).reduce((a, p) => a + p.qty * p.harga, 0);
                return (
                  <tr key={s.id}>
                    <td className="mono">{s.id}</td>
                    <td><strong>{s.nama}</strong></td>
                    <td>{s.telp || '-'}</td>
                    <td style={{ color: 'var(--text2)' }}>{s.email || '-'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{s.alamat || '-'}</td>
                    <td><strong>{fmt(total)}</strong></td>
                    <td>
                      <button className="btn btn-icon btn-danger" onClick={() => handleDelete(s.id)} title="Hapus">
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
                    <i className="fa-solid fa-truck"></i>
                    <p>Belum ada data supplier</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Supplier">
        <div className="form-group">
          <label className="form-label">Nama Supplier <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: PT Semen Nusantara" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input className="input" placeholder="021-xxx / 08xxx" value={telp} onChange={e => setTelp(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="email@supplier.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Alamat</label>
          <input className="input" placeholder="Jl. Industri No. 1, Jakarta" value={alamat} onChange={e => setAlamat(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
