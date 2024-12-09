export type Transaction = {
  id: number;
  bar: string;
  prod_name: string;
  price: number;
  name: string;
  lat: number;
  lng: number;
}

export type Product = {
  id: string;
  bar: string;
  name: string;
  category: string;
}

export type Store = {
  id: string;
  toko_id: string,
  name: string;
  alamat: string;
  lat: number;
  lng: number;
}