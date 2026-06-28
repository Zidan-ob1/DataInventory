'use client';

import React, { useState } from 'react';
import { useStore, Barang } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterBarang() {
  const { barang, genId, addBarang, deleteBarang, updateBarang } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hbeli, setHbeli] = useState(''); 
  const [hjual, setHjual] = useState(''); 

  // Form State
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Semen & Bahan Dasar'); 
  const [satuan, setSatuan] = useState('Sak');
  const [minstok, setMinstok] = useState('');
  const [keterangan, setKeterangan] = useState(''); 
  const [editId, setEditId] = useState<string | null>(null);

  const filteredBarang = barang.filter(b => 
    b.nama.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase()) || 
    b.kategori.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimpan = () => {
    if (!nama.trim()) {
      toast('Nama barang wajib diisi!', true);
      return;
    }

    if (!hjual.trim() || Number(hjual) <= 0) {
      toast('Harga jual toko wajib diisi dengan benar!', true);
      return;
    }
    
    if (editId) {
      // --- MODE EDIT / UPDATE ---
      // 🛠️ MENCARI DATA STOK SEBELUMNYA AGAR TIDAK TER-RESET JADI 0
      const barangLama = barang.find(b => b.id === editId);
      const stokSekarang = barangLama ? barangLama.stok : 0;

      const updatedBarang: Barang = {
        id: editId,
        nama,
        kategori,
        satuan,
        minstok: Number(minstok) || 0,
        keterangan,
        hbeli: Number(hbeli) || 0, // 🛠️ SINKRON: Mengambil nilai input riil
        hjual: Number(hjual) || 0, // 🛠️ SINKRON: Mengambil nilai input riil
        stok: stokSekarang         // 🛠️ SINKRON: Mempertahankan sisa stok lama di gudang
      };

      updateBarang(updatedBarang); 
      toast('✓ Barang berhasil diperbarui');
    } else {
      // --- MODE TAMBAH BARU ---
      const newBarang: Barang = {
        id: genId('B'),
        nama,
        kategori,
        satuan,
        minstok: Number(minstok) || 0,
        keterangan,
        hbeli: Number(hbeli) || 0, // 🛠️ SINKRON: Mengambil nilai input riil
        hjual: Number(hjual) || 0, // 🛠️ SINKRON: Mengambil nilai input riil
        stok: 0
      };

      addBarang(newBarang);
      toast('✓ Barang berhasil ditambahkan');
    }
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleEditClick = (b: Barang) => {
    setEditId(b.id); 
    setNama(b.nama);
    setKategori(b.kategori);
    setSatuan(b.satuan);
    setMinstok(b.minstok ? String(b.minstok) : '');
    setKeterangan(b.keterangan || '');
    // 🛠️ PERBAIKAN: Isi form dengan harga lama saat tombol edit diklik
    setHbeli(b.hbeli ? String(b.hbeli) : '');
    setHjual(b.hjual ? String(b.hjual) : '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Barang ini?')) {
      deleteBarang(id);
      toast('✓ Barang berhasil dihapus');
    }
  };

  const resetForm = () => {
    setNama('');
    setKategori('Semen & Bahan Dasar');
    setSatuan('Sak');
    setMinstok('');
    setKeterangan('');
    setHbeli('');
    setHjual('');
    setEditId(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Daftar Barang (Master)</span>
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
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setIsModalOpen(true); }}>
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
                  {/* 🛠️ TAMBAHAN VISUAL: Menampilkan nilai harga di tabel master agar mudah dipantau */}
                 
                  
                  <td><span style={{ fontSize: '11px', color: 'var(--text2)' }}>{b.keterangan || '-'}</span></td> 
                  <td>
                    <button className="btn btn-icon btn-primary" onClick={() => handleEditClick(b)} title="Edit">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(b.id)} title="Hapus">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}> 
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { resetForm(); setIsModalOpen(false); }} 
        title={editId ? "Edit Barang" : "Tambah Barang"}
      >
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

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Harga Beli Standar (Rp)</label>
            <input 
              className="input" 
              type="number" 
              placeholder="Contoh: 50000" 
              min="0" 
              value={hbeli} 
              onChange={e => setHbeli(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Harga Jual Toko <span style={{ color: 'red' }}>*</span></label>
            <input 
              className="input" 
              type="number" 
              placeholder="Contoh: 65000" 
              min="0" 
              value={hjual} 
              onChange={e => setHjual(e.target.value)} 
              required
            />
          </div>
        </div>

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
          <button className="btn" onClick={() => { setIsModalOpen(false); setEditId(null); }} >Batal</button>
          <button className="btn btn-primary" onClick={handleSimpan}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}