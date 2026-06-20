'use client';

import React, { useState } from 'react';
import { useStore, Supplier } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterSupplier() {
  const { supplier, genId, addSupplier, deleteSupplier, updateSupplier } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State (Sesuai Revisi Baru)
  const [nama, setNama] = useState('');
  const [kontakOrang, setKontakOrang] = useState('');
  const [telp, setTelp] = useState('');
  const [telpSeluler, setTelpSeluler] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const handleEditClick = (s: Supplier) => {
    setEditId(s.id);
    setNama(s.nama);
    setKontakOrang(s.kontakOrang || '');
    setTelp(s.telp);
    setTelpSeluler(s.telpSeluler || '');
    setEmail(s.email);
    setAlamat(s.alamat);
    setIsModalOpen(true);
  };

  const handleSimpan = () => {
    if (!nama.trim()) {
      toast('Nama supplier wajib diisi!', true);
      return;
    }
    
    const dataSupplier: Supplier = {
      id: editId || genId('S'),
      nama,
      kontakOrang,
      telp,
      telpSeluler,
      email,
      alamat
    };

    if (editId) {
      updateSupplier(dataSupplier);
      toast('✓ Supplier berhasil diperbarui');
    } else {
      addSupplier(dataSupplier);
      toast('✓ Supplier berhasil ditambahkan');
    }
    
    // Reset form
    setNama(''); setKontakOrang(''); setTelp(''); setTelpSeluler(''); setEmail(''); setAlamat('');
    setEditId(null);
    setIsModalOpen(false);
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
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => { setEditId(null); setIsModalOpen(true); }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Supplier
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Contact Person</th>
              <th>Telp. Kantor</th>
              <th>No. Seluler/WA</th>
              <th>Email</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {supplier.length > 0 ? (
              supplier.map(s => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td><strong>{s.nama}</strong></td>
                  <td>{s.kontakOrang || '-'}</td>
                  <td>{s.telp || '-'}</td>
                  <td>{s.telpSeluler || '-'}</td>
                  <td style={{ color: 'var(--text2)' }}>{s.email || '-'}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{s.alamat || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-icon btn-primary" 
                      onClick={() => handleEditClick(s)} 
                      title="Edit" 
                      style={{ marginRight: '6px' }}
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-icon btn-danger" 
                      onClick={() => handleDelete(s.id)} 
                      title="Hapus"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditId(null); }} 
        title={editId ? "Edit Supplier" : "Tambah Supplier"}
      >
        <div className="form-group">
          <label className="form-label">Nama Supplier <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: PT Semen Nusantara" value={nama} onChange={e => setNama(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Person (Nama Kontak)</label>
            <input className="input" placeholder="Contoh: Ahmad" value={kontakOrang} onChange={e => setKontakOrang(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. Seluler / WA</label>
            <input className="input" placeholder="Contoh: 0812xxxxxxxx" value={telpSeluler} onChange={e => setTelpSeluler(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telepon Kantor</label>
            <input className="input" placeholder="021-xxx" value={telp} onChange={e => setTelp(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="email@supplier.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Alamat Kantor / Gudang</label>
          <input className="input" placeholder="Jl. Industri No. 1, Jakarta" value={alamat} onChange={e => setAlamat(e.target.value)} />
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={() => { setIsModalOpen(false); setEditId(null); }}>Batal</button>
          <button className="btn btn-primary" onClick={handleSimpan}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}