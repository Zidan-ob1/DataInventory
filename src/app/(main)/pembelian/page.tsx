'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Pembelian, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiPembelian() {
  const { pembelian, supplier, barang, genId, addPembelian } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Master State
  const [tgl, setTgl] = useState('');
  const [supplierId, setSupplierId] = useState('');
  
  // Form Detail Item Temp State
  const [selectedBarangId, setSelectedBarangId] = useState('');
  const [qty, setQty] = useState('');
  const [harga, setHarga] = useState('');
  const [itemsList, setItemsList] = useState<DetailTransaksi[]>([]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
    if (supplier.length > 0) setSupplierId(supplier[0].id);
    if (barang.length > 0) {
      setSelectedBarangId(barang[0].id);
      setHarga(barang[0].hbeli.toString());
    }
  }, [supplier, barang]);

  const handleBarangChange = (id: string) => {
    setSelectedBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) setHarga(b.hbeli.toString());
  };

  const handleTambahBarisBarang = () => {
    const q = Number(qty);
    const h = Number(harga);
    if (!q || q < 1) { toast('Quantity minimal 1!', true); return; }
    if (!h || h < 0) { toast('Harga tidak valid!', true); return; }

    const b = barang.find(x => x.id === selectedBarangId);
    if (!b) return;

    // Cek jika item sudah ada di list keranjang temp
    if (itemsList.some(item => item.barangId === selectedBarangId)) {
      toast('Barang ini sudah masuk rincian!', true);
      return;
    }

    const newItem: DetailTransaksi = {
      barangId: b.id,
      kodeBarang: b.id,
      namaBarang: b.nama,
      qty: q,
      hargaSatuan: h,
      subtotal: q * h
    };

    setItemsList(prev => [...prev, newItem]);
    setQty('');
  };

  const handleHapusBaris = (index: number) => {
    setItemsList(prev => prev.filter((_, i) => i !== index));
  };

  const grandTotal = itemsList.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSimpanNota = () => {
    if (itemsList.length === 0) {
      toast('Rincian nota barang masih kosong!', true);
      return;
    }

    const s = supplier.find(x => x.id === supplierId);
    if (!s) return;

    const newPembelian: Pembelian = {
      id: genId('PB'),
      tgl,
      supplierId,
      supplierNama: s.nama,
      detail: itemsList,
      totalPembelian: grandTotal,
      status: 'Selesai'
    };

    addPembelian(newPembelian);
    setItemsList([]);
    setIsModalOpen(false);
    toast(`✓ Nota Pembelian ${newPembelian.id} berhasil disimpan.`);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Transaksi Pembelian (Nota Masuk)</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setItemsList([]); setIsModalOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Buat Pembelian Baru
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Nota</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th>Jumlah Item</th>
              <th>Total Pembelian</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pembelian.length > 0 ? (
              pembelian.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.tgl}</td>
                  <td>{p.supplierNama}</td>
                  <td>{p.detail.length} Macam</td>
                  <td><strong>{fmt(p.totalPembelian)}</strong></td>
                  <td><span className="badge badge-green">{p.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty">
                    <i className="fa-solid fa-cart-shopping"></i>
                    <p>Belum ada data transaksi pembelian</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Nota Transaksi Pembelian">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal Nota</label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Supplier Pengirim</label>
            <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              {supplier.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
        </div>

        <div style={{ border: '1px dashed var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', margin: '14px 0' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text1)' }}>Input Perincian Item Barang</span>
          <div className="form-group" style={{ marginTop: '8px' }}>
            <select className="input" value={selectedBarangId} onChange={e => handleBarangChange(e.target.value)}>
              {barang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </div>
          <div className="form-row" style={{ marginTop: '8px' }}>
            <div className="form-group">
              <input className="input" type="number" placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} />
            </div>
            <div className="form-group">
              <input className="input" type="number" placeholder="Harga Satuan" value={harga} onChange={e => setHarga(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="button" onClick={handleTambahBarisBarang}>
              <i className="fa-solid fa-plus"></i> Masuk Nota
            </button>
          </div>
        </div>

        <div className="table-wrap" style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
          <table style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Barang</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, index) => (
                <tr key={index}>
                  <td>{item.namaBarang}</td>
                  <td>{item.qty}</td>
                  <td>{fmt(item.hargaSatuan)}</td>
                  <td>{fmt(item.subtotal)}</td>
                  <td>
                    <button className="btn btn-icon btn-danger btn-xs" onClick={() => handleHapusBaris(index)}>
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {itemsList.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)' }}>Belum ada rincian barang</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text2)' }}>Grand Total Nota:</span>
          <strong>{fmt(grandTotal)}</strong>
        </div>

        <div className="modal-footer">
          <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" type="button" onClick={handleSimpanNota}><i className="fa-solid fa-save"></i> Simpan Faktur</button>
        </div>
      </Modal>
    </div>
  );
}