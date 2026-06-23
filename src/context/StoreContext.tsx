'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Barang {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  hbeli: number;
  hjual: number;
  stok: number;
  minstok: number;
  keterangan?: string; 
}

export interface Supplier {
  id: string;
  nama: string;
  kontakOrang: string;
  telp: string;
  telpSeluler: string;
  email: string;
  alamat: string;
}

export interface Pelanggan {
  id: string;
  namaPelanggan: string;
  telp: string;
  contactPerson: string;
  alamatPelanggan: string;
  alamatPengiriman: string;
}

export interface DetailTransaksi {
  barangId: string;
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface Pembelian {
  id: string;
  tgl: string;
  supplierId: string;
  supplierNama: string;
  detail: DetailTransaksi[]; 
  totalPembelian: number; 
  status: string;
}

export interface Penjualan {
  id: string;
  tgl: string;
  pelangganId: string; 
  pelangganNama: string; 
  detail: DetailTransaksi[]; 
  totalPenjualan: number; 
  status: string;
}

export interface Adjustment {
  id: string;
  tgl: string;
  barangId: string;   
  namaBarang: string; 
  qty: number;        
  satuan: string;     
  keterangan: string; 
}

interface StoreState {
  barang: Barang[];
  supplier: Supplier[];
  pelanggan: Pelanggan[];
  pembelian: Pembelian[];
  penjualan: Penjualan[];
  adjustment: Adjustment[];
}

interface StoreContextType extends StoreState {
  addBarang: (barang: Barang) => void;
  deleteBarang: (id: string) => void;
  updateBarang: (barang: Barang) => void;
  addSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  updateSupplier: (supplier: Supplier) => void;
  addPelanggan: (pelanggan: Pelanggan) => void;
  deletePelanggan: (id: string) => void;
  updatePelanggan: (pelanggan: Pelanggan) => void;
  addPembelian: (pembelian: Pembelian) => void;
  addPenjualan: (penjualan: Penjualan) => void;
  addAdjustment: (adjustment: Adjustment) => void;
  genId: (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialState: StoreState = {
  barang: [
    {id:'B001',nama:'Semen Portland 50kg',kategori:'Semen & Bahan Dasar',satuan:'Sak',hbeli:55000,hjual:70000,stok:120,minstok:20},
    {id:'B002',nama:'Besi Beton Ø10mm',kategori:'Besi & Baja',satuan:'Batang',hbeli:45000,hjual:58000,stok:8,minstok:15},
    {id:'B003',nama:'Pasir Beton',kategori:'Semen & Bahan Dasar',satuan:'Kg',hbeli:800,hjual:1200,stok:500,minstok:100},
  ],
  supplier: [
    { id: 'S001', nama: 'PT Semen Nusantara', kontakOrang: 'Budi Wijaya', telp: '021-5551234', telpSeluler: '081122334455', email: 'sns@email.com', alamat: 'Jl. Industri No. 5, Jakarta' },
  ],
  pelanggan: [
    { id: 'P001', namaPelanggan: 'Toko Bangun Sejahtera',telp: '08123456789', contactPerson: 'Haryanto', alamatPelanggan: 'Jl. Merdeka No. 3, Bogor', alamatPengiriman: 'Proyek Perumahan Griya Asri Blok C, Ciomas' },
  ],
  pembelian: [],
  penjualan: [],
  adjustment: []
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(initialState);
  const [counters, setCounters] = useState({ B: 3, S: 1, P: 1, PB: 0, FK: 0, ADJ: 0 });

  const genId = (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => {
    const nextNum = counters[prefix] + 1;
    setCounters(prev => ({ ...prev, [prefix]: nextNum }));
    return prefix + String(nextNum).padStart(3, '0');
  };

  // ==================== MASTER BARANG ====================
  // REVISI: Tambah barang otomatis memicu Transaksi Pembelian dummy awal
  const addBarang = (baru: Barang) => {
    setState(prev => {
      const notaId = 'PB' + String(counters.PB + 1).padStart(3, '0');
      setCounters(c => ({ ...c, PB: c.PB + 1 }));

      const detailBaru: DetailTransaksi = {
        barangId: baru.id,
        kodeBarang: baru.id,
        namaBarang: baru.nama,
        qty: baru.stok > 0 ? baru.stok : 10, // Default ambil stok awal master atau 10
        hargaSatuan: baru.hbeli,
        subtotal: (baru.stok > 0 ? baru.stok : 10) * baru.hbeli
      };

      const notaPembelian: Pembelian = {
        id: notaId,
        tgl: new Date().toISOString().slice(0, 10),
        supplierId: prev.supplier[0]?.id || 'S001',
        supplierNama: prev.supplier[0]?.nama || 'PT Semen Nusantara',
        detail: [detailBaru],
        totalPembelian: detailBaru.subtotal,
        status: 'Selesai'
      };

      return {
        ...prev,
        barang: [...prev.barang, baru],
        pembelian: [...prev.pembelian, notaPembelian]
      };
    });
  };

  const deleteBarang = (id: string) => setState(prev => ({ ...prev, barang: prev.barang.filter(b => b.id !== id) }));
  const updateBarang = (barangBaru: Barang) => {
    setState(prev => ({ ...prev, barang: prev.barang.map(b => b.id === barangBaru.id ? barangBaru : b) }));
  };
  
  // ==================== MASTER SUPPLIER ====================
  // REVISI: Tambah supplier otomatis memicu Transaksi Pembelian barang pertama
  const addSupplier = (baru: Supplier) => {
    setState(prev => {
      const notaId = 'PB' + String(counters.PB + 1).padStart(3, '0');
      setCounters(c => ({ ...c, PB: c.PB + 1 }));

      const barangAcuan = prev.barang[0] || { id: 'B001', nama: 'Semen Portland 50kg', hbeli: 55000 };
      
      const detailBaru: DetailTransaksi = {
        barangId: barangAcuan.id,
        kodeBarang: barangAcuan.id,
        namaBarang: barangAcuan.nama,
        qty: 25, // Kuantitas default pasokan supplier baru
        hargaSatuan: barangAcuan.hbeli,
        subtotal: 25 * barangAcuan.hbeli
      };

      const notaPembelian: Pembelian = {
        id: notaId,
        tgl: new Date().toISOString().slice(0, 10),
        supplierId: baru.id,
        supplierNama: baru.nama,
        detail: [detailBaru],
        totalPembelian: detailBaru.subtotal,
        status: 'Selesai'
      };

      // Tambah stok barang acuan karena ada pembelian masuk
      const updatedBarang = prev.barang.map(b => 
        b.id === barangAcuan.id ? { ...b, stok: b.stok + 25 } : b
      );

      return {
        ...prev,
        supplier: [...prev.supplier, baru],
        barang: updatedBarang,
        pembelian: [...prev.pembelian, notaPembelian]
      };
    });
  };

  const deleteSupplier = (id: string) => setState(prev => ({ ...prev, supplier: prev.supplier.filter(s => s.id !== id) }));
  const updateSupplier = (supplierBaru: Supplier) => {
    setState(prev => ({ ...prev, supplier: prev.supplier.map(s => s.id === supplierBaru.id ? supplierBaru : s) }));
  };
  
  // ==================== MASTER PELANGGAN ====================
  // REVISI: Tambah pelanggan otomatis memicu Transaksi Penjualan (Faktur) barang pertama
  const addPelanggan = (baru: Pelanggan) => {
    setState(prev => {
      const notaId = 'FK' + String(counters.FK + 1).padStart(3, '0');
      setCounters(c => ({ ...c, FK: c.FK + 1 }));

      const barangAcuan = prev.barang[0] || { id: 'B001', nama: 'Semen Portland 50kg', hjual: 70000, stok: 100 };
      
      const detailBaru: DetailTransaksi = {
        barangId: barangAcuan.id,
        kodeBarang: barangAcuan.id,
        namaBarang: barangAcuan.nama,
        qty: 5, // Kuantitas belanja default awal customer
        hargaSatuan: barangAcuan.hjual,
        subtotal: 5 * barangAcuan.hjual
      };

      const notaPenjualan: Penjualan = {
        id: notaId,
        tgl: new Date().toISOString().slice(0, 10),
        pelangganId: baru.id,
        pelangganNama: baru.namaPelanggan,
        detail: [detailBaru],
        totalPenjualan: detailBaru.subtotal,
        status: 'Lunas'
      };

      // Kurangi stok barang karena dibeli customer
      const updatedBarang = prev.barang.map(b => 
        b.id === barangAcuan.id ? { ...b, stok: Math.max(0, b.stok - 5) } : b
      );

      return {
        ...prev,
        pelanggan: [...prev.pelanggan, baru],
        barang: updatedBarang,
        penjualan: [...prev.penjualan, notaPenjualan]
      };
    });
  };

  const deletePelanggan = (id: string) => setState(prev => ({ ...prev, pelanggan: prev.pelanggan.filter(p => p.id !== id) }));
  const updatePelanggan = (pelangganBaru: Pelanggan) => {
    setState(prev => ({ ...prev, pelanggan: prev.pelanggan.map(p => p.id === pelangganBaru.id ? pelangganBaru : p) }));
  };
  
  // ==================== TRANSAKSI DIRECT (Kini di-trigger otomatis) ====================
  const addPembelian = (pembelian: Pembelian) => {
    setState(prev => {
      const updatedBarang = prev.barang.map(b => {
        const itemMatch = pembelian.detail.find(d => d.barangId === b.id);
        return itemMatch ? { ...b, stok: b.stok + itemMatch.qty } : b;
      });
      return { ...prev, barang: updatedBarang, pembelian: [...prev.pembelian, pembelian] };
    });
  };

  const addPenjualan = (penjualan: Penjualan) => {
    setState(prev => {
      const updatedBarang = prev.barang.map(b => {
        const itemMatch = penjualan.detail.find(d => d.barangId === b.id);
        return itemMatch ? { ...b, stok: b.stok - itemMatch.qty } : b;
      });
      return { ...prev, barang: updatedBarang, penjualan: [...prev.penjualan, penjualan] };
    });
  };

  const addAdjustment = (adjustment: Adjustment) => {
    setState(prev => {
      const updatedBarang = prev.barang.map(b => 
        b.id === adjustment.barangId ? { ...b, stok: b.stok + adjustment.qty } : b
      );
      return { ...prev, barang: updatedBarang, adjustment: [...prev.adjustment, adjustment] };
    });
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      addBarang, deleteBarang, updateBarang,
      addSupplier, deleteSupplier, updateSupplier,
      addPelanggan, deletePelanggan, updatePelanggan,
      addPembelian, addPenjualan, addAdjustment,
      genId
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};