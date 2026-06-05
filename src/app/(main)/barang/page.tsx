'use client';

import React, { useState } from 'react';
import { useStore, Barang } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterBarang() {
  const { barang, genId, addBarang, deleteBarang } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Semen & Bahan Dasar');
  const [satuan, setSatuan] = useState('Sak');
  const [hbeli, setHbeli] = useState('');
  const [hjual, setHjual] = useState('');
  const [stok, setStok] = useState('');
  const [minstok, setMinstok] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

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
      kategori,
      satuan,
      hbeli: Number(hbeli) || 0,
      hjual: Number(hjual) || 0,
      stok: Number(stok) || 0,
      minstok: Number(minstok) || 0
    };

    addBarang(newBarang);
    
    // Reset form
    setNama(''); setHbeli(''); setHjual(''); setStok(''); setMinstok('');
    setIsModalOpen(false);
    toast('✓ Barang berhasil ditambahkan');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Barang ini?')) {
      deleteBarang(id);
      toast('✓ Barang berhasil dihapus');
    }
  };

  const stokBadge = (b: Barang) => {
    if (b.stok === 0) return <span className="badge badge-red">Habis</span>;
    if (b.stok <= b.minstok) return <span className="badge badge-amber">Menipis</span>;
    return <span className="badge badge-green">Normal</span>;
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
              <th>Satuan</th>
              <th>Harga Beli</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th>Min. Stok</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredBarang.length > 0 ? (
              filteredBarang.map(b => (
                <tr key={b.id}>
                  <td className="mono">{b.id}</td>
                  <td>
                    <strong>{b.nama}</strong><br/>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{b.kategori}</span>
                  </td>
                  <td>{b.satuan}</td>
                  <td>{fmt(b.hbeli)}</td>
                  <td>{fmt(b.hjual)}</td>
                  <td><strong>{b.stok}</strong></td>
                  <td style={{ color: 'var(--text3)' }}>{b.minstok}</td>
                  <td>{stokBadge(b)}</td>
                  <td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Barang">
        <div className="form-group">
          <label className="form-label">Nama Barang <span style={{ color: 'red' }}>*</span></label>
          <input className="input" placeholder="Contoh: Semen Portland 50kg" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="input" value={kategori} onChange={e => setKategori(e.target.value)}>
              <option>Semen & Bahan Dasar</option>
              <option>Besi & Baja</option>
              <option>Cat & Pelapis</option>
              <option>Keramik & Granit</option>
              <option>Pipa & Sanitasi</option>
              <option>Kayu & Triplek</option>
              <option>Lain-lain</option>
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
            <label className="form-label">Harga Beli (Rp)</label>
            <input className="input" type="number" placeholder="50000" min="0" value={hbeli} onChange={e => setHbeli(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Harga Jual (Rp)</label>
            <input className="input" type="number" placeholder="65000" min="0" value={hjual} onChange={e => setHjual(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stok Awal</label>
            <input className="input" type="number" placeholder="0" min="0" value={stok} onChange={e => setStok(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Stok Alert</label>
            <input className="input" type="number" placeholder="10" min="0" value={minstok} onChange={e => setMinstok(e.target.value)} />
            <div className="form-info">Notifikasi jika stok di bawah angka ini</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
