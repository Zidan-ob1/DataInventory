'use client';

import React, { useState } from 'react';
import { useStore, Barang } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterBarang() {
  const { barang, genId, addBarang, deleteBarang } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State (Diperbarui: Menghapus hbeli, hjual, stok. Menambahkan keterangan)
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Semen & Bahan Dasar'); // Berfungsi sebagai "Kelompok"
  const [satuan, setSatuan] = useState('Sak');
  const [minstok, setMinstok] = useState('');
  const [keterangan, setKeterangan] = useState(''); // State Baru

  const filteredBarang = barang.filter(b => 
    b.nama.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase()) || 
    b.kategori.toLowerCase().includes(search.toLowerCase())
  );

  const handleTambah = () => {
    if (!nama.trim()) {
      toast('Nama barang wajib diisi!', true);
      return;
    }
    
    const newBarang: Barang = {
      id: genId('B'),
      nama,
      kategori, // Kelompok
      satuan,
      minstok: Number(minstok) || 0,
      // Pastikan property ini didukung oleh tipe 'Barang' di StoreContext Anda:
      keterangan, 
      // Jika StoreContext Anda wajib menerima nilai harga/stok, isi dengan nilai default (0):
      hbeli: 0,
      hjual: 0,
      stok: 0
    };

    addBarang(newBarang);
    
    // Reset form
    setNama(''); 
    setMinstok('');
    setKeterangan('');
    setIsModalOpen(false);
    toast('✓ Barang berhasil ditambahkan');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Barang ini?')) {
      deleteBarang(id);
      toast('✓ Barang berhasil dihapus');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Daftar Barang</span>
        <div className="card-actions">
          <div className="search-wrap">
            <i className="fa-solid fa-search"></i>
            <input 
              className="input" 
              placeholder="Cari barang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> Tambah Barang
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Barang</th>
              <th>Kelompok</th> 
              <th>Satuan</th>
              <th>Min. Stok</th>
              <th>Keterangan Tambahan</th> 
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredBarang.length > 0 ? (
              filteredBarang.map(b => (
                <tr key={b.id}>
                  <td className="mono">{b.id}</td>
                  <td><strong>{b.nama}</strong></td>
                  <td><span className="badge">{b.kategori}</span></td>
                  <td>{b.satuan}</td>
                  <td style={{ color: 'var(--text3)' }}>{b.minstok}</td>
                  <td>{b.keterangan || '-'}</td> {/* Menampilkan keterangan */}
                  <td>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(b.id)} title="Hapus">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}> {/* Sesuaikan colspan dari 8 menjadi 7 */}
                  <div className="empty">
                    <i className="fa-solid fa-boxes-stacked"></i>
                    <p>Belum ada data barang</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Barang">
        <div className="form-group">
          <label className="form-label">Nama Barang <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: Semen Portland 50kg" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Kelompok (Kategori)</label>
            <select className="input" value={kategori} onChange={e => setKategori(e.target.value)}>
              <option>Semen & Bahan Dasar</option>
              <option>Besi & Baja</option>
              <option>Cat & Pelapis</option>
              <option>Keramik & Granit</option>
              <option>Pipa & Sanitasi</option>
              <option>Kayu & Triplek</option>
              <option>Lain-Lain</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Satuan</label>
            <select className="input" value={satuan} onChange={e => setSatuan(e.target.value)}>
              <option>Sak</option><option>Kg</option><option>Liter</option>
              <option>Batang</option><option>Lembar</option><option>Dus</option><option>Pcs</option><option>M²</option><option>M³</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Minimum Stok Alert</label>
            <input className="input" type="number" placeholder="10" min="0" value={minstok} onChange={e => setMinstok(e.target.value)} />
          </div>
        </div>

        {/* Form Baru: Keterangan Tambahan */}
        <div className="form-group">
          <label className="form-label">Keterangan Tambahan</label>
          <textarea 
            className="input" 
            placeholder="Masukkan keterangan atau catatan tambahan mengenai barang..." 
            rows={3} 
            value={keterangan} 
            onChange={e => setKeterangan(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
          />
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}