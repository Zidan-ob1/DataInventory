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
}

export interface Supplier {
  id: string;
  nama: string;
  telp: string;
  email: string;
  alamat: string;
}

export interface Pelanggan {
  id: string;
  nama: string;
  telp: string;
  alamat: string;
  tipe: string;
}

export interface Pembelian {
  id: string;
  tgl: string;
  supplierId: string;
  supplier: string;
  barangId: string;
  barang: string;
  qty: number;
  harga: number;
  status: string;
}

export interface Penjualan {
  id: string;
  tgl: string;
  pelangganId: string;
  pelanggan: string;
  barangId: string;
  barang: string;
  qty: number;
  harga: number;
  status: string;
}

export interface Adjustment {
  id: string;
  tgl: string;
  barangId: string;
  barang: string;
  sistem: number;
  aktual: number;
  selisih: number;
  ket: string;
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
  addSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addPelanggan: (pelanggan: Pelanggan) => void;
  deletePelanggan: (id: string) => void;
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
    {id:'S001',nama:'PT Semen Nusantara',telp:'021-5551234',email:'sns@email.com',alamat:'Jl. Industri No. 5, Jakarta'},
    {id:'S002',nama:'CV Besi Jaya Mandiri',telp:'022-7778901',email:'besijaya@email.com',alamat:'Jl. Besi Raya No. 12, Bandung'},
    {id:'S003',nama:'UD Bahan Bangunan Maju',telp:'024-4441122',email:'maju@email.com',alamat:'Jl. Raya Semarang No. 99'},
  ],
  pelanggan: [
    {id:'P001',nama:'Budi Santoso',telp:'08123456789',alamat:'Jl. Merdeka No. 3, Jakarta',tipe:'Kontraktor'},
    {id:'P002',nama:'Dewi Rahayu',telp:'08987654321',alamat:'Jl. Melati No. 7, Depok',tipe:'Umum'},
    {id:'P003',nama:'CV Karya Bangun',telp:'021-8889900',alamat:'Jl. Pembangunan No. 45, Bekasi',tipe:'Reseller'},
  ],
  pembelian: [
    {id:'PB001',tgl:'2026-06-01',supplierId:'S001',supplier:'PT Semen Nusantara',barang:'Semen Portland 50kg',barangId:'B001',qty:50,harga:55000,status:'Selesai'},
    {id:'PB002',tgl:'2026-06-03',supplierId:'S002',supplier:'CV Besi Jaya Mandiri',barang:'Besi Beton Ø10mm',barangId:'B002',qty:20,harga:45000,status:'Selesai'},
    {id:'PB003',tgl:'2026-06-04',supplierId:'S003',supplier:'UD Bahan Bangunan Maju',barang:'Keramik 40x40 Polos',barangId:'B006',qty:40,harga:75000,status:'Selesai'},
  ],
  penjualan: [
    {id:'FK001',tgl:'2026-06-02',pelangganId:'P001',pelanggan:'Budi Santoso',barang:'Semen Portland 50kg',barangId:'B001',qty:10,harga:70000,status:'Lunas'},
    {id:'FK002',tgl:'2026-06-04',pelangganId:'P002',pelanggan:'Dewi Rahayu',barang:'Cat Tembok Vinilex 5L',barangId:'B004',qty:5,harga:110000,status:'Lunas'},
    {id:'FK003',tgl:'2026-06-05',pelangganId:'P003',pelanggan:'CV Karya Bangun',barang:'Keramik 40x40 Polos',barangId:'B006',qty:15,harga:95000,status:'Lunas'},
  ],
  adjustment: []
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(initialState);
  const [counters, setCounters] = useState({ B: 6, S: 3, P: 3, PB: 3, FK: 3, ADJ: 0 });

  const genId = (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => {
    const nextNum = counters[prefix] + 1;
    setCounters(prev => ({ ...prev, [prefix]: nextNum }));
    return prefix + String(nextNum).padStart(3, '0');
  };

  const addBarang = (barang: Barang) => setState(prev => ({ ...prev, barang: [...prev.barang, barang] }));
  const deleteBarang = (id: string) => setState(prev => ({ ...prev, barang: prev.barang.filter(b => b.id !== id) }));
  
  const addSupplier = (supplier: Supplier) => setState(prev => ({ ...prev, supplier: [...prev.supplier, supplier] }));
  const deleteSupplier = (id: string) => setState(prev => ({ ...prev, supplier: prev.supplier.filter(s => s.id !== id) }));
  
  const addPelanggan = (pelanggan: Pelanggan) => setState(prev => ({ ...prev, pelanggan: [...prev.pelanggan, pelanggan] }));
  const deletePelanggan = (id: string) => setState(prev => ({ ...prev, pelanggan: prev.pelanggan.filter(p => p.id !== id) }));
  
  const addPembelian = (pembelian: Pembelian) => {
    setState(prev => {
      // Update stock
      const updatedBarang = prev.barang.map(b => 
        b.id === pembelian.barangId ? { ...b, stok: b.stok + pembelian.qty } : b
      );
      return { ...prev, barang: updatedBarang, pembelian: [...prev.pembelian, pembelian] };
    });
  };

  const addPenjualan = (penjualan: Penjualan) => {
    setState(prev => {
      // Update stock
      const updatedBarang = prev.barang.map(b => 
        b.id === penjualan.barangId ? { ...b, stok: b.stok - penjualan.qty } : b
      );
      return { ...prev, barang: updatedBarang, penjualan: [...prev.penjualan, penjualan] };
    });
  };

  const addAdjustment = (adjustment: Adjustment) => {
    setState(prev => {
      // Update stock to aktual
      const updatedBarang = prev.barang.map(b => 
        b.id === adjustment.barangId ? { ...b, stok: adjustment.aktual } : b
      );
      return { ...prev, barang: updatedBarang, adjustment: [...prev.adjustment, adjustment] };
    });
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      addBarang, deleteBarang,
      addSupplier, deleteSupplier,
      addPelanggan, deletePelanggan,
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
