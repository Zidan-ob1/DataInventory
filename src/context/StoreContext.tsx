'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase'; // 🛠️ Pastikan path import mengarah ke file firebase.ts kamu
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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
  contactPerson: string;
  telp: string;
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
  createPenjualan: (pelangganId: string, pelangganNama: string, items: DetailTransaksi[]) => void;
  createPembelian: (supplierId: string, supplierNama: string, items: DetailTransaksi[]) => void;
  genId: (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // 🛠️ Menggunakan state individual untuk memudahkan sinkronisasi real-time Firestore
  const [barang, setBarang] = useState<Barang[]>([]);
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [pembelian, setPembelian] = useState<Pembelian[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [adjustment, setAdjustment] = useState<Adjustment[]>([]);

  // 🛠️ REAL-TIME FETCHING: Mengambil data langsung dari Cloud Firestore secara otomatis
  useEffect(() => {
    const unsubBarang = onSnapshot(collection(db, 'barang'), (snap) => {
      setBarang(snap.docs.map(d => d.data() as Barang));
    });
    const unsubSupplier = onSnapshot(collection(db, 'supplier'), (snap) => {
      setSupplier(snap.docs.map(d => d.data() as Supplier));
    });
    const unsubPelanggan = onSnapshot(collection(db, 'pelanggan'), (snap) => {
      setPelanggan(snap.docs.map(d => d.data() as Pelanggan));
    });
    const unsubPembelian = onSnapshot(collection(db, 'pembelian'), (snap) => {
      setPembelian(snap.docs.map(d => d.data() as Pembelian));
    });
    const unsubPenjualan = onSnapshot(collection(db, 'penjualan'), (snap) => {
      setPenjualan(snap.docs.map(d => d.data() as Penjualan));
    });
    const unsubAdjustment = onSnapshot(collection(db, 'adjustment'), (snap) => {
      setAdjustment(snap.docs.map(d => d.data() as Adjustment));
    });

    return () => {
      unsubBarang(); unsubSupplier(); unsubPelanggan();
      unsubPembelian(); unsubPenjualan(); unsubAdjustment();
    };
  }, []);

  // 🛠️ AUTO ID GENERATOR BERDASARKAN JUMLAH DATA CLOUD RIIL
  const genId = (prefix: 'B' | 'S' | 'P' | 'PB' | 'FK' | 'ADJ') => {
    let length = 0;
    if (prefix === 'B') length = barang.length;
    else if (prefix === 'S') length = supplier.length;
    else if (prefix === 'P') length = pelanggan.length;
    else if (prefix === 'PB') length = pembelian.length;
    else if (prefix === 'FK') length = penjualan.length;
    else if (prefix === 'ADJ') length = adjustment.length;

    return prefix + String(length + 1).padStart(3, '0');
  };

  // ==================== MASTER BARANG ====================
  const addBarang = async (baru: Barang) => {
    await setDoc(doc(db, 'barang', baru.id), baru);
  };

  const updateBarang = async (barangBaru: Barang) => {
    await setDoc(doc(db, 'barang', barangBaru.id), barangBaru);
  };

  const deleteBarang = async (id: string) => {
    await deleteDoc(doc(db, 'barang', id));
  };
  
  // ==================== MASTER SUPPLIER ====================
  const addSupplier = async (input: Omit<Supplier, 'id'>) => {
    const id = genId('S');
    const data: Supplier = { ...input, id };
    await setDoc(doc(db, 'supplier', id), data);
  };

  const deleteSupplier = async (id: string) => {
    await deleteDoc(doc(db, 'supplier', id));
  };

  const updateSupplier = async (supplierBaru: Supplier) => {
    await setDoc(doc(db, 'supplier', supplierBaru.id), supplierBaru);
  };
  
  // ==================== MASTER PELANGGAN ====================
  const addPelanggan = async (input: Omit<Pelanggan, 'id'>) => {
    const id = genId('P');
    const data: Pelanggan = { ...input, id };
    await setDoc(doc(db, 'pelanggan', id), data);
  };

  const deletePelanggan = async (id: string) => {
    await deleteDoc(doc(db, 'pelanggan', id));
  };

  const updatePelanggan = async (pelangganBaru: Pelanggan) => {
    await setDoc(doc(db, 'pelanggan', pelangganBaru.id), pelangganBaru);
  };

  // ==================== LOGIC TRANSAKSI BERBASIS CLOUD ====================
  
  const createPembelian = async (supplierId: string, supplierNama: string, items: DetailTransaksi[]) => {
    const notaId = genId('PB');
    const totalNota = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.hargaSatuan)), 0);

    const newPembelian: Pembelian = {
      id: notaId,
      tgl: new Date().toLocaleDateString('id-ID'),
      supplierId,
      supplierNama,
      detail: items,
      totalPembelian: totalNota,
      status: 'Selesai'
    };

    // 1. Simpan Nota Pembelian
    await setDoc(doc(db, 'pembelian', notaId), newPembelian);

    // 2. Mutasi Tambah Stok & Update Harga Beli Akhir ke Cloud
    for (const item of items) {
      const b = barang.find(x => x.id === item.barangId || x.id === item.kodeBarang);
      if (b) {
        await setDoc(doc(db, 'barang', b.id), {
          ...b,
          stok: b.stok + Number(item.qty),
          hbeli: Number(item.hargaSatuan)
        });
      }
    }
  };

  const createPenjualan = async (pelangganId: string, pelangganNama: string, items: DetailTransaksi[]) => {
    const fakturId = genId('FK');
    const totalNota = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.hargaSatuan)), 0);

    const newPenjualan: Penjualan = {
      id: fakturId,
      tgl: new Date().toLocaleDateString('id-ID'),
      pelangganId,
      pelangganNama,
      detail: items,
      totalPenjualan: totalNota,
      status: 'Selesai'
    };

    // 1. Simpan Nota Penjualan
    await setDoc(doc(db, 'penjualan', fakturId), newPenjualan);

    // 2. Mutasi Kurang Stok di Cloud
    for (const item of items) {
      const b = barang.find(x => x.id === item.barangId || x.id === item.kodeBarang);
      if (b) {
        await setDoc(doc(db, 'barang', b.id), {
          ...b,
          stok: b.stok - Number(item.qty)
        });
      }
    }
  };
  
  // ==================== ALUR COMPATIBILITY BACKGROUND DEPRECATED ====================
  const addPembelian = async (pembelian: Pembelian) => {
    await setDoc(doc(db, 'pembelian', pembelian.id), pembelian);
  };

  const addPenjualan = async (penjualan: Penjualan) => {
    await setDoc(doc(db, 'penjualan', penjualan.id), penjualan);
  };

  const addAdjustment = async (adj: Adjustment) => {
    await setDoc(doc(db, 'adjustment', adj.id), adj);
    const b = barang.find(x => x.id === adj.barangId);
    if (b) {
      await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok + adj.qty });
    }
  };

  return (
    <StoreContext.Provider value={{
      barang, supplier, pelanggan, pembelian, penjualan, adjustment,
      addBarang, deleteBarang, updateBarang,
      addSupplier, deleteSupplier, updateSupplier,
      addPelanggan, deletePelanggan, updatePelanggan,
      addPembelian, addPenjualan, addAdjustment,
      createPembelian, createPenjualan,
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