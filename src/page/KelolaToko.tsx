import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Store } from "../types/types";

const DEFAULT_CENTER = JSON.parse(import.meta.env.VITE_CENTER);

interface Transaction {
  id: string;
  toko_id: string;
}


const KelolaToko: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);

  // untuk tambah dan edit
  const [lastTokoId, setLastTokoId] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  // untuk delete
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [newStore, setNewStore] = useState<Store>({} as Store);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState(false);

  // Fungsi untuk mengambil data toko dari Firestore
  const fetchStores = async () => {
    try {
      const q = query(
        collection(db, "toko"),
        orderBy("toko_id", "desc"), // Urutkan berdasarkan createdAt
      );

      const querySnapshot = await getDocs(q);
      const storesData: Store[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        storesData.push({
          id: doc.id,
          toko_id: data.toko_id,
          name: data.name,
          alamat: data.alamat,
          lat: data.lat,
          lng: data.lng,
        });
      });
      const lastId = storesData.length > 0 ? storesData[0].toko_id + 1 : "";
      setStores(storesData);
      setLastTokoId(lastId);
    } catch (error) {
      console.log("Error fetching stores:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "transaksi"));
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          toko_id: data.toko_id,
        });
      });
      setTransactions(transactionsData);
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchTransactions();
  }, []);

  // Fungsi untuk menambah toko baru
  const addStore = async () => {
    try {
      await addDoc(collection(db, "toko"), {
        toko_id: lastTokoId,
        name: newStore.name,
        alamat: newStore.alamat,
        lat: newStore.lat,
        lng: newStore.lng,
      });
      alert("Toko berhasil ditambahkan.");
      setShowModal(false);
      fetchStores();
    } catch (error) {
      console.log("Error adding store:", error);
    }
  };

  // Fungsi untuk memperbarui toko
  const updateStore = async () => {
    const storeRef = doc(db, "toko", newStore.id);
    try {
      await updateDoc(storeRef, {
        name: newStore.name,
        alamat: newStore.alamat,
        lat: newStore.lat,
        lng: newStore.lng,
      });
      alert("Toko berhasil diperbarui.");
      setShowModal(false);
      fetchStores();
    } catch (error) {
      console.log("Error updating store:", error);
    }
  };

  // Fungsi untuk menghapus toko
  const deleteStore = async () => {
    if (selectedStoreId) {
      try {
        const storeRef = doc(db, "toko", selectedStoreId);
        await deleteDoc(storeRef);
        alert("Toko berhasil dihapus.");
        setShowConfirmModal(false);
        fetchStores();
      } catch (error) {
        console.log("Error deleting store:", error);
      }
    }
  };

  const handleDeleteClick = (storeId: string, storeTokoId: string) => {
    setSelectedStoreId(storeId);

    // Hitung jumlah transaksi yang terhubung dengan toko
    console.log(transactions);
    console.log("StoreID: ", storeId);
    console.log("StoreTokoID: ", storeTokoId);

    const count = transactions.filter((t) => t.toko_id === storeTokoId).length;
    setTransactionCount(count);

    setShowConfirmModal(true);
  };


  // Fungsi untuk menangani klik marker di peta
  const handleMapClick = (e: import("@vis.gl/react-google-maps").MapMouseEvent) => {
    if (e.detail.latLng) {
      const { lat, lng } = e.detail.latLng;
      setNewStore({ ...newStore, lat, lng });
      setOpenPopup(true);
    }
  };

  // Fungsi untuk menangani input form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewStore({ ...newStore, [name]: value });
  };

  // cek validasi
  useEffect(() => {
    // console.log("newScanned: ", scannedValue);
    console.log(newStore);
    if (newStore.name && newStore.alamat && newStore.lat) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [newStore]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Kelola Toko</h1>

      {/* Tombol Tambah Toko */}
      <div className="mb-4 text-right">
        <button
          onClick={() => {
            setNewStore({} as Store);
            setShowModal(true);
            setIsEdit(false);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Tambah Toko
        </button>
      </div>

      {/* Tabel Toko */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-left text-gray-700">Nama</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Alamat</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Latitude</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Longitude</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{store.name}</td>
                <td className="py-2 px-4 border-b">{store.alamat}</td>
                <td className="py-2 px-4 border-b">{store.lat}</td>
                <td className="py-2 px-4 border-b">{store.lng}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => {
                      setNewStore(store);
                      setShowModal(true);
                      setIsEdit(true);
                    }}
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(store.id, store.toko_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit Toko */}
      {showModal && (
        <div className="fixed top-0 py-52 h-screen w-full overflow-y-auto left-0 right-0 flex justify-center items-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-2 md:p-6 rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEdit ? "Edit Toko" : "Tambah Toko"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
              {/* Form */}
              <div>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700">
                    Nama Toko
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={newStore.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg mt-2"
                    placeholder="Masukkan nama toko"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="alamat" className="block text-gray-700">
                    Alamat
                  </label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    value={newStore.alamat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg mt-2"
                    placeholder="Masukkan alamat toko"
                  ></textarea>
                </div>

                <input
                  className="hidden"
                  name="lat"
                  type="number"
                  onChange={handleInputChange}
                  value={newStore.lat}
                />

                <input
                  className="hidden"
                  name="lng"
                  type="number"
                  onChange={handleInputChange}
                  value={newStore.lng}
                />
              </div>

              {/* Peta */}
              <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden my-0">
                <label htmlFor="map" className="block text-gray-700 my-0 py-0">Pilih Lokasi</label>
                <APIProvider apiKey={import.meta.env.VITE_GMAPS_API}>
                  <Map
                    mapId={import.meta.env.VITE_GMAPS_ID}
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={13}
                    onClick={(event: import("@vis.gl/react-google-maps").MapMouseEvent) => handleMapClick(event)}
                  >
                    {stores.map((store) => (
                      <Marker key={store.id} position={{ lat: store.lat, lng: store.lng }} />
                    ))}
                    {openPopup && (
                      <InfoWindow
                        position={newStore}
                        headerDisabled>
                        <div>
                          <p>
                            <strong>Lat:</strong> {newStore.lat}
                          </p>
                          <p>
                            <strong>Lng:</strong> {newStore.lng}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
              {showButton && (
                <button
                  onClick={isEdit ? updateStore : addStore}
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
              Toko ini terhubung dengan <strong>{transactionCount}</strong>{" "}
              transaksi.
            </p>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus toko ini? Tindakan ini tidak dapat
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
                onClick={deleteStore}
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

export default KelolaToko;
