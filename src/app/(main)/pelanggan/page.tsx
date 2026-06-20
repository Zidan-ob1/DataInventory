'use client';

import React, { useState } from 'react';
import { useStore, Pelanggan } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterPelanggan() {
  const { pelanggan, genId, addPelanggan, deletePelanggan, updatePelanggan } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State (Sesuai Revisi Baru)
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [telp, setTelp] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [alamatPelanggan, setAlamatPelanggan] = useState('');
  const [alamatPengiriman, setAlamatPengiriman] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const handleEditClick = (p: Pelanggan) => {
    setEditId(p.id);
    setNamaPelanggan(p.namaPelanggan);
    setTelp(p.telp);
    setContactPerson(p.contactPerson || '');
    setAlamatPelanggan(p.alamatPelanggan);
    setAlamatPengiriman(p.alamatPengiriman || '');
    setIsModalOpen(true);
  };

  const handleSimpan = () => {
    if (!namaPelanggan.trim()) {
      toast('Nama pelanggan wajib diisi!', true);
      return;
    }
    
    const dataPelanggan: Pelanggan = {
      id: editId || genId('P'),
      namaPelanggan,
      telp,
      contactPerson,
      alamatPelanggan,
      alamatPengiriman
    };

    if (editId) {
      updatePelanggan(dataPelanggan);
      toast('✓ Pelanggan berhasil diperbarui');
    } else {
      addPelanggan(dataPelanggan);
      toast('✓ Pelanggan berhasil ditambahkan');
    }
    
    // Reset form
    setNamaPelanggan(''); setTelp(''); setContactPerson(''); setAlamatPelanggan(''); setAlamatPengiriman('');
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Pelanggan ini?')) {
      deletePelanggan(id);
      toast('✓ Pelanggan berhasil dihapus');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Daftar Pelanggan</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setIsModalOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Tambah Pelanggan
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Pelanggan</th>
              <th>Contact Person</th>
              <th>Telepon</th>
              <th>Alamat Pelanggan</th>
              <th>Alamat Pengiriman</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pelanggan.length > 0 ? (
              pelanggan.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td><strong>{p.namaPelanggan}</strong></td>
                  <td>{p.contactPerson || '-'}</td>
                  <td>{p.telp || '-'}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.alamatPelanggan || '-'}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.alamatPengiriman || '-'}</td>
                  <td>
                    <button className="btn btn-icon btn-primary" onClick={() => handleEditClick(p)} title="Edit" style={{ marginRight: '6px' }}>
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(p.id)} title="Hapus">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
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

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditId(null); }} title={editId ? "Edit Pelanggan" : "Tambah Pelanggan"}>
        <div className="form-group">
          <label className="form-label">Nama Pelanggan <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: Toko Bangun Sejahtera" value={namaPelanggan} onChange={e => setNamaPelanggan(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input className="input" placeholder="Nama PIC Kontak" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Telepon / HP</label>
            <input className="input" placeholder="08xxx" value={telp} onChange={e => setTelp(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Alamat Pelanggan</label>
          <input className="input" placeholder="Alamat Terdaftar" value={alamatPelanggan} onChange={e => setAlamatPelanggan(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Alamat Pengiriman Logistik</label>
          <input className="input" placeholder="Alamat Proyek / Lokasi Kirim" value={alamatPengiriman} onChange={e => setAlamatPengiriman(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => { setIsModalOpen(false); setEditId(null); }}>Batal</button>
          <button className="btn btn-primary" onClick={handleSimpan}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}