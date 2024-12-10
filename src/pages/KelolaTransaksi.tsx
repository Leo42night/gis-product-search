import React, { useState, useEffect } from "react";
import { format } from "date-fns"; // untuk tgl transaksi
import { formatToCustomDate } from "../components/Tools";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../libs/firebase-config";
import { Product } from "../types/types";
import { fetchProducts } from "../libs/firestore";
import { useAuth } from "../context/AuthContext";

interface StoreInfo {
  id: string;
  toko_id: number;
  name: string;
  alamat: string;
}

interface Transaction {
  id: string;
  prod_id: string;
  toko_id: number | string;
  harga: number | string;
  tgl: string;
}

const templateTransaction = {
  id: "",
  prod_id: "",
  toko_id: "",
  harga: "",
  tgl: "",
}

const now = new Date();

const KelolaTransaksi: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // data tambah dan update
  const [newTransaction, setNewTransaction] = useState<Transaction>(templateTransaction);
  const [formattedHarga, setFormattedHarga] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(false);

  // untuk delete
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedTransactId, setSelectedTransactId] = useState<string | null>(null);

  // cek autentikasi
  useEffect(() => {
    // Simulasi pengecekan autentikasi
    const checkAuthStatus = async () => {
      // Tunggu sampai status autentikasi tersedia
      setTimeout(() => {
        setIsLoading(false); // Set loading selesai
      }, 500); // Loading selama 0.5 detik
    };

    checkAuthStatus();
  }, [isAuthenticated]);

  // Fungsi untuk mengambil data toko
  const fetchStores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "toko"));
      const storesData: StoreInfo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        storesData.push({
          id: doc.id,
          toko_id: data.toko_id,
          name: data.name,
          alamat: data.alamat,
        });
      });
      setStores(storesData);
    } catch (error) {
      console.log("Error fetching stores:", error);
    }
  };

  const [isEdit, setIsEdit] = useState<boolean>(false); // Menandakan apakah modal digunakan untuk edit atau tambah

  // Fungsi untuk mengambil transaksi dari Firestore
  const fetchTransactions = async () => {
    try {
      const transactionsQuery = query(
        collection(db, "transaksi"),
        orderBy("tgl", "desc") // Urutkan berdasarkan 'tgl' secara ascending
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          prod_id: data.prod_id,
          toko_id: data.toko_id,
          harga: data.harga,
          tgl: data.tgl,
        });
      });
      console.log("Transactions: ", transactionsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  // Fetch data saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchDataAllForTrans = async () => {
      await fetchProducts(setProducts);
      await fetchStores();
      await fetchTransactions();
    };
    fetchDataAllForTrans();
  }, []);

  // Fungsi untuk menambah atau memperbarui transaksi
  const addOrUpdateTransaction = async () => {
    // cek nilai kosong
    const existingTransaction = transactions.find(
      (transaction) =>
        transaction.prod_id == newTransaction.prod_id &&
        transaction.toko_id == newTransaction.toko_id
    );

    if (existingTransaction) {
      // Update transaksi jika pasangan produk dan toko sudah ada
      console.log("data diupdate: ", newTransaction);
      try {
        const transactionRef = doc(db, "transaksi", existingTransaction.id);
        await updateDoc(transactionRef, {
          harga: newTransaction.harga,
          tgl: format(now, "yyyy-MM-dd HH:mm:ss"),
        });
        alert("Transaksi berhasil diperbarui.");
      } catch (error) {
        console.log("Error updating transaction:", error);
      }
    } else {
      // Tambahkan transaksi baru jika pasangan produk dan toko belum ada
      try {
        console.log("data ditambahkan: ", newTransaction);
        await addDoc(collection(db, "transaksi"), {
          prod_id: newTransaction.prod_id,
          toko_id: Number(newTransaction.toko_id),
          harga: newTransaction.harga.toString(),
          tgl: format(now, "yyyy-MM-dd HH:mm:ss")
        });
        alert("Transaksi berhasil ditambahkan.");
      } catch (error) {
        console.log("Error adding transaction:", error);
      }
    }

    setShowModal(false);
    fetchTransactions();
  };

  // Fungsi untuk menghapus transaksi
  const deleteTransaction = async () => {
    if (selectedTransactId) {
      try {
        const transactionRef = doc(db, "transaksi", selectedTransactId);
        await deleteDoc(transactionRef);
        fetchTransactions(); // Ambil transaksi terbaru setelah dihapus
        alert("Transaksi berhasil dihapus");
        setShowConfirmModal(false);
      } catch (error) {
        console.log("Error deleting transaction:", error);
      }
    }
  };

  // Fungsi untuk mengedit transaksi
  const editTransaction = (transaction: Transaction) => {
    setNewTransaction(transaction); // Set data transaksi yang ingin diedit
    setIsEdit(true); // Menandakan bahwa modal digunakan untuk edit
    setShowModal(true); // Tampilkan modal
  };

  // Fungsi untuk memperbarui transaksi
  const updateTransaction = async () => {
    const transactionRef = doc(db, "transaksi", newTransaction.id);
    try {
      await updateDoc(transactionRef, {
        prod_id: newTransaction.prod_id,
        toko_id: newTransaction.toko_id,
        harga: newTransaction.harga,
        tgl: format(now, "yyyy-MM-dd HH:mm:ss")
      });
      setShowModal(false); // Tutup modal setelah transaksi berhasil diupdate
      fetchTransactions(); // Ambil transaksi terbaru dari Firestore
      alert("Transaksi berhasil diupdate");
    } catch (error) {
      console.log("Error updating transaction:", error);
    }
  };

  // Fungsi untuk menangani perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name == "harga") {
      const rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
      const formattedValue = new Intl.NumberFormat("id-ID").format(Number(rawValue)); // Format ribuan
      setFormattedHarga(formattedValue);
      const harga = Number(value.replace(/\./g, ""));
      setNewTransaction({ ...newTransaction, [name]: harga });
    } else {
      setNewTransaction({ ...newTransaction, [name]: value });
    }
  };

  useEffect(() => {
    console.log(newTransaction);
    if (newTransaction.prod_id && newTransaction.toko_id && newTransaction.harga) {
      setShowButton(true);
    }
  }, [newTransaction])

  const handleDeleteClick = (transId: string) => {
    setSelectedTransactId(transId);
    setShowConfirmModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin rounded-full border-4 border-t-4 border-blue-500 w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center">Daftar Transaksi</h1>
      {isAuthenticated ? (
        // Tombol Tambah Transaksi
        <div className="mb-4 text-right">
          <button
            onClick={() => {
              setNewTransaction({} as Transaction);
              setShowButton(false);
              setFormattedHarga("");
              setShowModal(true);
              setIsEdit(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tambah Transaksi
          </button>
        </div>
      ) : (
        <p className="text-red-500 text-center mb-4">
          Silakan login agar dapat akses tambah, edit & hapus transaksi 🙏.
        </p>
      )}

      {/* Tabel Transaksi */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-left text-xs sm:text-sm text-gray-700">
                Produk
              </th>
              <th className="py-2 px-4 border-b text-left text-xs sm:text-sm text-gray-700">
                Toko
              </th>
              <th className="py-2 px-4 border-b text-left text-xs sm:text-sm text-gray-700">
                Harga (Rp)
              </th>
              <th className="py-2 px-4 border-b text-left text-xs sm:text-sm text-gray-700">
                Tanggal
              </th>
              {isAuthenticated &&
                <th className="py-2 px-4 border-b text-left text-xs sm:text-sm text-gray-700">
                  Aksi
                </th>
              }
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const product = products.find((p) => p.bar === transaction.prod_id);
              const store = stores.find((s) => s.toko_id === transaction.toko_id);
              const showHarga = new Intl.NumberFormat("id-ID").format(Number(transaction.harga));
              return (
                <tr key={transaction.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b text-xs sm:text-sm">
                    {transaction.prod_id} | {product?.name}
                  </td>
                  <td className="py-2 px-4 border-b text-xs sm:text-sm">
                    {store?.name}
                  </td>
                  <td className="py-2 px-4 border-b text-xs sm:text-sm">
                    {showHarga}
                  </td>
                  <td className="py-2 px-4 border-b text-xs sm:text-sm">
                    {formatToCustomDate(transaction.tgl)}
                  </td>
                  {isAuthenticated &&
                    <td className="py-2 px-4 border-b text-xs sm:text-sm">
                      <button
                        onClick={() => editTransaction(transaction)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(transaction.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Hapus
                      </button>
                    </td>
                  }
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Transaksi */}
      {showModal && (
        <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm md:max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
            </h2>

            <div className="mb-4">
              <label htmlFor="prod_id" className="block text-gray-700">
                Pilih Produk
              </label>
              <select
                id="prod_id"
                name="prod_id"
                value={newTransaction.prod_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg mt-2 ${isEdit
                  ? "bg-gray-200 cursor-not-allowed text-gray-500"
                  : "bg-white"
                  }`}
                disabled={isEdit}
              >
                <option value="">---Pilih Produk---</option>
                {products.map((product) => (
                  <option key={product.id} value={product.bar}>
                    {product.bar} | {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="toko_id" className="block text-gray-700">
                Pilih Toko
              </label>
              <select
                id="toko_id"
                name="toko_id"
                value={newTransaction.toko_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg mt-2 ${isEdit
                  ? "bg-gray-200 cursor-not-allowed text-gray-500"
                  : "bg-white"
                  }`}
                disabled={isEdit}
              >
                <option value="">---Pilih Toko---</option>
                {stores.map((store) => (
                  <option key={store.toko_id} value={store.toko_id}>
                    {store.toko_id} | {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="harga" className="block text-gray-700">
                Harga
              </label>
              <div className="flex items-center border rounded-lg mt-2 w-full">
                <label htmlFor="harga" className="px-4 py-2 bg-gray-100 border-r text-gray-700">Rp</label>
                <input
                  id="harga"
                  name="harga"
                  type="text"
                  value={formattedHarga}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 focus:outline-none"
                  placeholder="Masukkan harga"
                />
              </div>
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
                  onClick={isEdit ? updateTransaction : addOrUpdateTransaction}
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
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat
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
                onClick={deleteTransaction}
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
};

export default KelolaTransaksi;
