import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/libs/firebase-config";
import { useMyContext } from "@/context/MyContext";
import { Product } from "@/types/types";
import { fetchProducts } from "@/libs/firestore";
import { useAuth } from "@/context/AuthContext";

import { columns } from "./column";
import { DataTable } from "./DataTable";

const KelolaProduk: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);

  // tambah dan edit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Product>({} as Product);
  const [showButton, setShowButton] = useState<boolean>(false);

  // tambah produk dari home
  const { scannedValue, updateScannedValue } = useMyContext();

  // Mengambil produk saat komponen dimuat
  useEffect(() => {
    if (scannedValue !== null) {
      setNewProduct((prev) => ({ ...prev, bar: scannedValue }));
      setShowModal(true);
    }
  }, [scannedValue]);

  useEffect(() => {
    fetchProducts(setProducts);
  }, []);

  useEffect(() => {
    if (products) {
      console.log("Products: ", products);
    }
  }, [products]);

  // Fungsi untuk menambah produk baru
  const addProduct = async () => {
    // Validasi ID produk
    const existingProduct = products.find((p) => p.bar === newProduct.bar);
    if (existingProduct) {
      alert("Barcode produk sudah ada dalam daftar produk.");
      return;
    }
    try {
      // console.log("New product data: ", newProduct);
      await addDoc(collection(db, "produk"), {
        bar: newProduct.bar,
        name: newProduct.name,
        category: newProduct.category,
      });
      setShowModal(false);  // Tutup modal setelah produk berhasil ditambah
      await fetchProducts(setProducts); // Ambil produk setelah ditambah
    } catch (error) {
      console.log("Error adding product:", error);
    }
  };

  // Fungsi untuk menangani perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validasi untuk "bar"
    if (name === "bar") {
      // Hapus karakter non-angka
      let sanitizedValue = value.replace(/[^0-9]/g, "");

      // Batasi panjang hingga 13 karakter
      if (sanitizedValue.length > 13) {
        sanitizedValue = sanitizedValue.substring(0, 13);
      }

      // Perbarui state
      setNewProduct({ ...newProduct, [name]: sanitizedValue });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  // cek validasi
  useEffect(() => {
    // console.log("newScanned: ", scannedValue);
    // console.log(newProduct);
    if (newProduct.bar && newProduct.name && newProduct.category) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [newProduct]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin rounded-full border-4 border-t-4 border-blue-500 w-16 h-16"></div>
      </div>
    );
  } else {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-center">Daftar Produk</h1>
        {!isAuthenticated && <p className="text-red-500 text-center mb-4">Silakan login agar dapat akses edit & hapus produk 🙏.</p>}

        {/* Tabel Produk */}
        <div className="mb-4 text-right">
          <button
            onClick={() => {
              setNewProduct({} as typeof newProduct);
              setShowModal(true);
              updateScannedValue('');
              setShowButton(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tambah Produk
          </button>
        </div>

        <div className="container mx-auto py-10 max-w-4xl">
          <DataTable columns={columns} data={products} />
        </div>

        {/* Modal untuk Tambah/Edit Produk */}
        {showModal && (
          <div className="fixed h-screen w-screen top-0 left-0 flex justify-center items-center bg-gray-900 bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Tambah Produk</h2>

              <div className="mb-4">
                <label htmlFor="productBar" className="block text-gray-700">
                  Code Produk
                </label>
                <input
                  id="productBar"
                  name="bar"
                  type="text" // Ubah menjadi "text"
                  value={newProduct.bar ?? scannedValue ?? ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg mt-2 bg-white cursor-text`}
                  placeholder="Code Angka produk"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="productName" className="block text-gray-700">
                  Nama Produk
                </label>
                <input
                  id="productName"
                  name="name"
                  type="text"
                  defaultValue={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg mt-2"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="productCategory" className="block text-gray-700">
                  Kategori
                </label>
                <input
                  id="productCategory"
                  name="category"
                  type="text"
                  defaultValue={newProduct.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg mt-2"
                  placeholder="Masukkan kategori produk"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Batal
                </button>
                {showButton && (
                  <button
                    onClick={addProduct}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default KelolaProduk;
