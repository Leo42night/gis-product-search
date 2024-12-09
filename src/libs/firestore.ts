import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";
import { Product, Transaction } from "../types/types";

interface fetchDataParams {
  prodId: string;
  setProductName: React.Dispatch<React.SetStateAction<string>>;
}

export const fetchData = async ({ prodId, setProductName }: fetchDataParams): Promise<Transaction[] | number> => {
  // keadaan input kosong
  if (!prodId) {
    console.log("Produk ID tidak diinputkan");
    return 0;
  }
  // Fetch produk details
  const produkDoc = await getDocs(query(collection(db, "produk"), where("bar", "==", prodId)));
  const produkData = produkDoc.docs[0]?.data();
  
  // keadaan produk tidak ditemukan di database
  if (!produkData) {
    console.log("Produk data not found");
    return 1;
  }

  setProductName(produkData?.name);

  const q = query(collection(db, "transaksi"), where("prod_id", "==", prodId));
  const querySnapshot = await getDocs(q);
  // console.log("querySnapshot",querySnapshot);
  const fetchedTransactions: Transaction[] = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();

    // Fetch toko details
    const tokoDoc = await getDocs(query(collection(db, "toko"), where("toko_id", "==", data.toko_id)));

    const tokoData = tokoDoc.docs[0]?.data();

    if (produkData && tokoData) {
      fetchedTransactions.push({
        id: data.id,
        bar: prodId,
        prod_name: produkData.name,
        price: data.harga,
        name: tokoData.name,
        lat: tokoData.lat,
        lng: tokoData.lng,
      });
    }
  }
  return fetchedTransactions;
};

export const fetchProducts = async (setProducts: React.Dispatch<React.SetStateAction<Product[]>>) => {
  try {
    const querySnapshot = await getDocs(collection(db, "produk"));
    const productsData: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      productsData.push({
        id: doc.id,
        bar: data.bar,
        name: data.name,
        category: data.category,
      });
    });
    setProducts(productsData);
  } catch (error) {
    console.log("Error fetching products:", error);
  }
};

