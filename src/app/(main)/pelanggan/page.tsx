'use client';

import React, { useState } from 'react';
import { useStore, Pelanggan, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';

export default function MasterPelanggan() {
  const { pelanggan, barang, createPenjualan, addPelanggan } = useStore();

  // State untuk Modal Input Pelanggan Baru (Profil saja)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ namaPelanggan: '', contactPerson: '', telp: '', alamatPelanggan: '', alamatPengiriman: '' });

  // STATE: Untuk mengontrol Pop-up Belanja/Penjualan
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
  const [txItems, setTxItems] = useState<{ barangId: string; qty: number }[]>([]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Membuka form belanja untuk customer tertentu
  const handleBukaFormBelanja = (cust: Pelanggan) => {
    setSelectedCustomer(cust);
    // 🛠️ PERBAIKAN: Pastikan state terisi dengan ID barang pertama secara eksplisit, bukan string kosong
    const defaultBarangId = barang[0]?.id || '';
    setTxItems([{ barangId: defaultBarangId, qty: 1 }]); 
    setIsTxModalOpen(true);
  };

  // Mengubah input baris barang belanjaan di dalam form
  const handleItemChange = (index: number, field: 'barangId' | 'qty', value: any) => {
    const updated = [...txItems];
    updated[index] = { ...updated[index], [field]: value };
    setTxItems(updated);
  };

  // Menambah baris barang baru di dalam nota belanja yang sama
  const handleTambahBarisBarang = () => {
    const defaultBarangId = barang[0]?.id || '';
    setTxItems([...txItems, { barangId: defaultBarangId, qty: 1 }]);
  };

  // Menyimpan transaksi belanja ke sistem
  const handleSimpanTransaksiBelanja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Memetakan item belanjaan ke format DetailTransaksi yang dimengerti StoreContext
    const detailNota: DetailTransaksi[] = txItems.map(item => {
      // 1. Cari data barang asli dari master berdasarkan ID yang terpilih
      const dataBarangMaster = barang.find(b => b.id === item.barangId);
      
      // 2. Ambil harga jual yang sudah diset di Master Barang
      const hargaJualBarang = dataBarangMaster ? Number(dataBarangMaster.hjual) : 0;

      return {
        barangId: item.barangId,
        kodeBarang: item.barangId, 
        namaBarang: dataBarangMaster ? dataBarangMaster.nama : 'Barang Tidak Diketahui',
        qty: Number(item.qty),
        hargaSatuan: hargaJualBarang, 
        subtotal: Number(item.qty) * hargaJualBarang
      };
    });

    for (const item of txItems) {
  const dataBarangMaster = barang.find(b => b.id === item.barangId);
  if (dataBarangMaster && Number(item.qty) > dataBarangMaster.stok) {
    alert(`Transaksi Gagal! Stok untuk ${dataBarangMaster.nama} tidak mencukupi (Sisa Stok: ${dataBarangMaster.stok}).`);
    return; // Membatalkan proses simpan
  }
}
    // 3. Kirim data yang sudah matang ke fungsi Context
    createPenjualan(selectedCustomer.id, selectedCustomer.namaPelanggan, detailNota);

    // 4. Reset state form dan tutup modal
    setIsTxModalOpen(false);
    setSelectedCustomer(null);
    setTxItems([]);
    
    alert(`Transaksi Berhasil! Nota penjualan untuk ${selectedCustomer.namaPelanggan} telah tercatat.`);
  };

  // Handler simpan profil pelanggan biasa
  const handleSimpanProfilPelanggan = (e: React.FormEvent) => {
    e.preventDefault();
    addPelanggan({
      id: '', 
      ...newCust
    });
    setIsCustomerModalOpen(false);
    setNewCust({ namaPelanggan: '', contactPerson: '', telp: '', alamatPelanggan: '', alamatPengiriman: '' });
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Data Master Pelanggan</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsCustomerModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Tambah Pelanggan Baru
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Pelanggan</th>
              <th>Contact Person</th>
              <th>No. Telepon</th>
              <th>Alamat</th>
              <th style={{ textAlign: 'center' }}>Aksi Toko</th>
            </tr>
          </thead>
          <tbody>
            {pelanggan.map(c => (
              <tr key={c.id}>
                <td className="mono">{c.id}</td>
                <td><strong>{c.namaPelanggan}</strong></td>
                <td>{c.contactPerson}</td>
                <td>{c.telp}</td>
                <td><span style={{ fontSize: '11px', color: 'var(--text2)' }}>{c.alamatPelanggan}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleBukaFormBelanja(c)}
                    style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-cart-plus"></i> Catat Belanja / Jual
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL 1: FORM TRANSAKSI BELANJA ==================== */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => { setIsTxModalOpen(false); setSelectedCustomer(null); }}
        title={`Form Catat Penjualan: ${selectedCustomer?.namaPelanggan}`}
      >
        <form onSubmit={handleSimpanTransaksiBelanja}>
          <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>
            Pilih item barang yang dibeli oleh pelanggan ini beserta kuantitasnya di bawah:
          </div>

          {txItems.map((item, idx) => (
            <div className="form-row" key={idx} style={{ marginBottom: '14px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Pilih Barang</label>
                <select
                  className="input"
                  value={item.barangId}
                  onChange={(e) => handleItemChange(idx, 'barangId', e.target.value)}
                  required
                >
                  {/* 🛠️ PERBAIKAN: Menambahkan baris kosong inisial jika barang belum ter-load */}
                  <option value="" disabled>-- Pilih Item Barang --</option>
                  {barang.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nama} ({fmt(b.hjual)} - Sisa: {b.stok})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Qty Belanja</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
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

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button className="btn" type="button" onClick={() => { setIsTxModalOpen(false); setSelectedCustomer(null); }}>Batal</button>
            <button className="btn btn-primary" type="submit">
              <i className="fa-solid fa-floppy-disk"></i> Simpan Transaksi Jual
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================== POP-UP MODAL 2: FORM TAMBAH PROFIL PELANGGAN ==================== */}
      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Tambah Master Pelanggan Baru">
        <form onSubmit={handleSimpanProfilPelanggan}>
          <div className="form-group">
            <label className="form-label">Nama Pelanggan <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="text" placeholder="Contoh: Toko Berkah Jaya / Budi" value={newCust.namaPelanggan} onChange={e => setNewCust({...newCust, namaPelanggan: e.target.value})} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person (CP)</label>
              <input className="input" type="text" placeholder="Contoh: Ahmad" value={newCust.contactPerson} onChange={e => setNewCust({...newCust, contactPerson: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">No. Telepon</label>
              <input className="input" type="text" placeholder="0857XXXXXXXX" value={newCust.telp} onChange={e => setNewCust({...newCust, telp: e.target.value})} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Pelanggan</label>
            <textarea 
              className="input" 
              placeholder="Masukkan alamat tinggal atau alamat kantor utama pelanggan..."
              rows={2} 
              value={newCust.alamatPelanggan} 
              onChange={e => setNewCust({...newCust, alamatPelanggan: e.target.value})} 
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Pengiriman Logistik</label>
            <textarea 
              className="input" 
              placeholder="Masukkan alamat tujuan pengiriman barang/proyek konstruksi..."
              rows={2} 
              value={newCust.alamatPengiriman} 
              onChange={e => setNewCust({...newCust, alamatPengiriman: e.target.value})} 
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
              required 
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button className="btn" type="button" onClick={() => setIsCustomerModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" type="submit">
              <i className="fa-solid fa-floppy-disk"></i> Simpan Profil Pelanggan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}