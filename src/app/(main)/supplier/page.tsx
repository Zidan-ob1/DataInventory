'use client';

import React, { useState } from 'react';
import { useStore, Supplier, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';

export default function MasterSupplier() {
  const { supplier, barang, createPembelian, addSupplier } = useStore();

  // State untuk Modal Input Profil Supplier Baru
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupp, setNewSupp] = useState({ nama: '', kontakOrang: '', telp: '', telpSeluler: '', email: '', alamat: '' });

  // 🛠️ STATE BARU: Kontrol Pop-up Catat Pembelian Barang/Restock
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [txItems, setTxItems] = useState<{ barangId: string; qty: number; hargaBeli: number }[]>([
    { barangId: '', qty: 1, hargaBeli: 0 }
  ]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Membuka form restock/pembelian dari supplier terpilih
  const handleBukaFormRestock = (supp: Supplier) => {
    setSelectedSupplier(supp);
    // Set default item pertama dari master barang jika ada
    const defaultBarangId = barang[0]?.id || '';
    const defaultHargaBeli = barang[0]?.hbeli || 0;
    setTxItems([{ barangId: defaultBarangId, qty: 1, hargaBeli: defaultHargaBeli }]);
    setIsTxModalOpen(true);
  };

  // Mengubah input baris barang di dalam form restock
  const handleItemChange = (index: number, field: 'barangId' | 'qty' | 'hargaBeli', value: any) => {
    const updated = [...txItems];
    if (field === 'barangId') {
      const dataBarangMaster = barang.find(b => b.id === value);
      updated[index] = { 
        ...updated[index], 
        barangId: value, 
        hargaBeli: dataBarangMaster ? dataBarangMaster.hbeli : 0 
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTxItems(updated);
  };

  // Menambah baris item barang baru di nota restock yang sama
  const handleTambahBarisBarang = () => {
    const defaultBarangId = barang[0]?.id || '';
    const defaultHargaBeli = barang[0]?.hbeli || 0;
    setTxItems([...txItems, { barangId: defaultBarangId, qty: 1, hargaBeli: defaultHargaBeli }]);
  };

  // Menyimpan data restock barang ke sistem transaksi pembelian
  const handleSimpanTransaksiRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    // Susun array detail transaksi yang cocok dengan struktur StoreContext
    const detailNota: DetailTransaksi[] = txItems.map(item => {
      const dataBarangMaster = barang.find(b => b.id === item.barangId);
      
      return {
        barangId: item.barangId,
        kodeBarang: item.barangId,
        namaBarang: dataBarangMaster ? dataBarangMaster.nama : 'Barang Terhapus',
        qty: Number(item.qty),
        hargaSatuan: Number(item.hargaBeli),
        subtotal: Number(item.qty) * Number(item.hargaBeli)
      };
    });

    // Tembak fungsi kirim data transaksi pembelian ke StoreContext
    createPembelian(selectedSupplier.id, selectedSupplier.nama, detailNota);

    // Tutup modal dan reset state
    setIsTxModalOpen(false);
    setSelectedSupplier(null);
    alert(`Nota pembelian dari ${selectedSupplier.nama} berhasil disimpan! Stok master barang otomatis bertambah.`);
  };

  // Handler simpan profil supplier biasa
  const handleSimpanProfilSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({
      id: '', 
      ...newSupp
    });
    setIsSupplierModalOpen(false);
    setNewSupp({ nama: '', kontakOrang: '', telp: '', telpSeluler: '', email: '', alamat: '' });
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Data Master Supplier / Distributor</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsSupplierModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Tambah Supplier Baru
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Contact Person</th>
              <th>No. Telepon</th>
              <th>Email</th>
              <th>Alamat Kantor</th>
              <th style={{ textAlign: 'center' }}>Aksi Logistik</th>
            </tr>
          </thead>
          <tbody>
            {supplier.map(s => (
              <tr key={s.id}>
                <td className="mono">{s.id}</td>
                <td><strong>{s.nama}</strong></td>
                <td>{s.kontakOrang}</td>
                <td>{s.telp}</td>
                <td>{s.email || '-'}</td>
                <td><span style={{ fontSize: '11px', color: 'var(--text2)' }}>{s.alamat}</span></td>
                <td style={{ textAlign: 'center' }}>
                  {/* 🛠️ TOMBOL BARU: Memicu form restock langsung berdasarkan supplier terpilih */}
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleBukaFormRestock(s)}
                    style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-boxes-packing"></i> Catat Nota Beli (Restock)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     {/* ==================== POP-UP MODAL 1: FORM INPUT TRANSAKSI PEMBELIAN (RESTOCK) ==================== */}
<Modal
  isOpen={isTxModalOpen}
  onClose={() => { setIsTxModalOpen(false); setSelectedSupplier(null); }}
  title={`Form Restock Barang: ${selectedSupplier?.nama}`}
>
  <form onSubmit={handleSimpanTransaksiRestock}>
    <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>
      Input nota barang pasokan masuk dari distributor ini ke gudang komputer:
    </div>

    {txItems.map((item, idx) => (
      /* Menggunakan form-row milik Anda agar letak input berjajar rapi ke samping */
      <div className="form-row" key={idx} style={{ marginBottom: '14px', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Pilih Barang</label>
          <select
            className="input"
            value={item.barangId}
            onChange={(e) => handleItemChange(idx, 'barangId', e.target.value)}
            required
          >
            {barang.map(b => (
              <option key={b.id} value={b.id}>
                {b.nama} (Stok: {b.stok})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Qty Masuk</label>
          <input
            className="input"
            type="number"
            min="1"
            value={item.qty}
            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1.5 }}>
          <label className="form-label">Harga Beli Actual</label>
          <input
            className="input"
            type="number"
            min="0"
            value={item.hargaBeli}
            onChange={(e) => handleItemChange(idx, 'hargaBeli', e.target.value)}
            required
          />
        </div>
      </div>
    ))}

    <div className="form-group" style={{ marginTop: '4px' }}>
      <button 
        type="button" 
        className="btn" 
        onClick={handleTambahBarisBarang}
        style={{ fontSize: '12px', padding: '6px 12px' }}
      >
        <i className="fa-solid fa-plus"></i> Tambah Item Barang Lagi
      </button>
    </div>

    {/* Menggunakan modal-footer standard bawaan yang rapi */}
    <div className="modal-footer" style={{ marginTop: '24px' }}>
      <button className="btn" type="button" onClick={() => { setIsTxModalOpen(false); setSelectedSupplier(null); }}>Batal</button>
      <button className="btn btn-primary" type="submit">
        <i className="fa-solid fa-floppy-disk"></i> Simpan Nota Masuk
      </button>
    </div>
  </form>
</Modal>

     {/* ==================== POP-UP MODAL 2: FORM TAMBAH PROFIL SUPPLIER ==================== */}
<Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title="Tambah Master Supplier Baru">
  <form onSubmit={handleSimpanProfilSupplier}>
    <div className="form-group">
      <label className="form-label">Nama Perusahaan / Supplier <span style={{ color: 'red' }}>*</span></label>
      <input className="input" type="text" placeholder="Contoh: PT Semen Nusantara" value={newSupp.nama} onChange={e => setNewSupp({...newSupp, nama: e.target.value})} required />
    </div>

    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Nama Kontak (CP)</label>
        <input className="input" type="text" placeholder="Contoh: Budi Santoso" value={newSupp.kontakOrang} onChange={e => setNewSupp({...newSupp, kontakOrang: e.target.value})} required />
      </div>
      <div className="form-group">
        <label className="form-label">No. Telepon HP</label>
        <input className="input" type="text" placeholder="0812XXXXXXXX" value={newSupp.telpSeluler} onChange={e => setNewSupp({...newSupp, telpSeluler: e.target.value})} required />
      </div>
    </div>

    <div className="form-group">
      <label className="form-label">Alamat Kantor Pusat / Gudang</label>
      <textarea 
        className="input" 
        placeholder="Masukkan alamat lengkap kantor atau lokasi gudang distributor..."
        rows={3} 
        value={newSupp.alamat} 
        onChange={e => setNewSupp({...newSupp, alamat: e.target.value})} 
        style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
        required 
      />
    </div>

    <div className="modal-footer" style={{ marginTop: '24px' }}>
      <button className="btn" type="button" onClick={() => setIsSupplierModalOpen(false)}>Batal</button>
      <button className="btn btn-primary" type="submit">
        <i className="fa-solid fa-floppy-disk"></i> Simpan Profil Supplier
      </button>
    </div>
  </form>
</Modal>
    </div>
  );
}