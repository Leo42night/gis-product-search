import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../libs/firebase-config";
import { useMyContext } from "../context/MyContext";
import { Product } from "../types/types";
import { fetchProducts } from "../libs/firestore";
import { useAuth } from "../context/AuthContext";

interface Transaction {
  id: string;
  prod_id: string;
}

const KelolaProduk: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);

  // tambah dan edit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Product>({} as Product);
  const [showButton, setShowButton] = useState<boolean>(false);

  // tambah produk dari home
  const { scannedValue, updateScannedValue } = useMyContext();

  // untuk delete
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState<boolean>(false); // Menandakan apakah modal digunakan untuk edit atau tambah

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "transaksi"));
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          prod_id: data.prod_id,
        });
      });
      // console.log("Transactions: ", transactionsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  // Mengambil produk saat komponen dimuat
  useEffect(() => {
    if (scannedValue !== null) {
      setNewProduct((prev) => ({ ...prev, bar: scannedValue }));
      setShowModal(true);
      setIsEdit(false);
    }
  }, [scannedValue]);

  useEffect(() => {
    fetchProducts(setProducts);
    fetchTransactions();
  }, []);

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
      fetchProducts(setProducts);  // Ambil produk terbaru dari Firestore
    } catch (error) {
      console.log("Error adding product:", error);
    }
  };

  // Fungsi untuk menghapus produk
  const deleteProduct = async () => {
    if (selectedProductId) {
      try {
        const productRef = doc(db, "produk", selectedProductId);
        await deleteDoc(productRef);
        fetchProducts(setProducts); // Ambil produk terbaru setelah dihapus
        setSelectedProductId(null);
        setShowConfirmModal(false);
        alert("Produk berhasil dihapus.");
      } catch (error) {
        console.log("Error deleting product:", error);
      }
    }
  };

  const handleDeleteClick = (productId: string, bar: string) => {

    setSelectedProductId(productId);
    // Hitung jumlah transaksi yang terhubung dengan toko
    const count = transactions.filter((t) => t.prod_id === bar).length;
    // console.log("ProductID: ", productId);
    // console.log("Count: ", count);
    setTransactionCount(count);

    setShowConfirmModal(true);
  };

  // Fungsi untuk mengedit produk
  const editProduct = (product: Product) => {
    setNewProduct(product); // Set data produk yang ingin diedit
    setIsEdit(true); // Menandakan bahwa modal digunakan untuk edit
    setShowModal(true); // Tampilkan modal
  };

  // Fungsi untuk memperbarui produk
  const updateProduct = async () => {
    // cek bar apakah sudah ada di produk
    const productRef = doc(db, "produk", newProduct.id);
    try {
      await updateDoc(productRef, {
        bar: newProduct.bar,
        name: newProduct.name,
        category: newProduct.category,
      });
      setShowModal(false); // Tutup modal setelah produk berhasil diupdate
      fetchProducts(setProducts); // Ambil produk terbaru dari Firestore
      alert("Produk berhasil diupdate");
    } catch (error) {
      console.log("Error updating product:", error);
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
              setIsEdit(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tambah Produk
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-left text-gray-700">Code</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Nama</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Kategori</th>
                {isAuthenticated &&
                  <th className="py-2 px-4 border-b text-left text-gray-700">Aksi</th>
                }
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{product.bar}</td>
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b">{product.category}</td>
                  {isAuthenticated &&
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => editProduct(product)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.bar)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Hapus
                      </button>
                    </td>
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Modal untuk Tambah/Edit Produk */}
        {showModal && (
          <div className="fixed h-screen w-screen top-0 left-0 flex justify-center items-center bg-gray-900 bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {isEdit ? "Edit Produk" : "Tambah Produk"}
              </h2>
  
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
                  className={`w-full px-4 py-2 border rounded-lg mt-2 ${isEdit ? "bg-gray-200 cursor-not-allowed text-gray-500" : "bg-white cursor-text"
                    }`}
                  placeholder="Code Angka produk"
                  readOnly={isEdit} // Read-only saat edit
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
                    onClick={isEdit ? updateProduct : addProduct}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {isEdit ? "Update" : "Simpan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/* Modal Konfirmasi Hapus */}
        {showConfirmModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Konfirmasi Hapus
              </h2>
              <p className="text-gray-600 mb-2">
                Produk ini terhubung dengan <strong>{transactionCount}</strong>{" "}
                transaksi.
              </p>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus Produk ini? Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default KelolaProduk;
