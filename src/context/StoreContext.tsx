'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  pelangganId: string; // REVISI TYPO
  pelangganNama: string; // REVISI TYPO
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

const initialState: StoreState = {
  barang: [
    {id:'B001',nama:'Semen Portland 50kg',kategori:'Semen & Bahan Dasar',satuan:'Sak',hbeli:55000,hjual:70000,stok:120,minstok:20},
    {id:'B002',nama:'Besi Beton Ø10mm',kategori:'Besi & Baja',satuan:'Batang',hbeli:45000,hjual:58000,stok:8,minstok:15},
    {id:'B003',nama:'Pasir Beton',kategori:'Semen & Bahan Dasar',satuan:'Kg',hbeli:800,hjual:1200,stok:500,minstok:100},
    {id:'B004',nama:'Cat Tembok Vinilex 5L',kategori:'Cat & Pelapis',satuan:'Kaleng',hbeli:85000,hjual:110000,stok:5,minstok:10},
    {id:'B005',nama:'Bata Merah Standar',kategori:'Semen & Bahan Dasar',satuan:'Pcs',hbeli:800,hjual:1100,stok:3000,minstok:500},
    {id:'B006',nama:'Keramik 40x40 Polos',kategori:'Keramik & Granit',satuan:'Dus',hbeli:75000,hjual:95000,stok:30,minstok:10},
  ],
  supplier: [
    { id: 'S001', nama: 'PT Semen Nusantara', kontakOrang: 'Budi Wijaya', telp: '021-5551234', telpSeluler: '081122334455', email: 'sns@email.com', alamat: 'Jl. Industri No. 5, Jakarta' },
    { id: 'S002', nama: 'CV Besi Jaya Mandiri', kontakOrang: 'Andi Hermawan', telp: '022-7778901', telpSeluler: '081234567890', email: 'besijaya@email.com', alamat: 'Jl. Besi Raya No. 12, Bandung' },
  ],
  pelanggan: [
    { id: 'P001', namaPelanggan: 'Toko Bangun Sejahtera',telp: '08123456789', contactPerson: 'Haryanto', alamatPelanggan: 'Jl. Merdeka No. 3, Bogor', alamatPengiriman: 'Proyek Perumahan Griya Asri Blok C, Ciomas' },
    { id: 'P002', namaPelanggan: 'Dewi Rahayu', telp: '08987654321',contactPerson: 'Dewi',  alamatPelanggan: 'Jl. Melati No. 7, Depok', alamatPengiriman: 'Jl. Melati No. 7, Depok' },
  ],
  pembelian: [],
  penjualan: [],
  adjustment: []
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(initialState);
  const [counters, setCounters] = useState({ B: 6, S: 2, P: 2, PB: 0, FK: 0, ADJ: 0 });

  const genId = (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => {
    const nextNum = counters[prefix] + 1;
    setCounters(prev => ({ ...prev, [prefix]: nextNum }));
    return prefix + String(nextNum).padStart(3, '0');
  };

  const addBarang = (barang: Barang) => setState(prev => ({ ...prev, barang: [...prev.barang, barang] }));
  const deleteBarang = (id: string) => setState(prev => ({ ...prev, barang: prev.barang.filter(b => b.id !== id) }));
  const updateBarang = (barangBaru: Barang) => {
    setState(prev => ({
      ...prev,
      barang: prev.barang.map(b => b.id === barangBaru.id ? barangBaru : b)
    }));
  };
  
  const addSupplier = (supplier: Supplier) => setState(prev => ({ ...prev, supplier: [...prev.supplier, supplier] }));
  const deleteSupplier = (id: string) => setState(prev => ({ ...prev, supplier: prev.supplier.filter(s => s.id !== id) }));
  const updateSupplier = (supplierBaru: Supplier) => {
    setState(prev => ({
      ...prev,
      supplier: prev.supplier.map(s => s.id === supplierBaru.id ? supplierBaru : s)
    }));
  };
  
  const addPelanggan = (pelanggan: Pelanggan) => setState(prev => ({ ...prev, pelanggan: [...prev.pelanggan, pelanggan] }));
  const deletePelanggan = (id: string) => setState(prev => ({ ...prev, pelanggan: prev.pelanggan.filter(p => p.id !== id) }));
  const updatePelanggan = (pelangganBaru: Pelanggan) => {
    setState(prev => ({
      ...prev,
      pelanggan: prev.pelanggan.map(p => p.id === pelangganBaru.id ? pelangganBaru : p)
    }));
  };
  
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