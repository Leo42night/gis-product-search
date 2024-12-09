from google.cloud import firestore
# import json

# Inisialisasi Firestore
cred = './gis-product-search-firebase-adminsdk.json'
db = firestore.Client.from_service_account_json(cred)

# Data untuk dimasukkan ke Firestore
data_produk = [
    {"bar": "1111122222333", "name": "Florence ml", "category": "Parfum"},
    {"bar": "2222211111333", "name": "Tokyo ml", "category": "Minyak Wangi"},
    {"bar": "3333322222111", "name": "Lemon 100ml", "category": "Lainnya"}
]

data_toko = [
    {"toko_id": 1, "name": "Berkah Jaya", "alamat": "Jl.Ahmad Yani", "lat": -0.04183445144272559, "lng": 109.32028965224141},
    {"toko_id": 2, "name": "Pasar Idah", "alamat": "Jl.Gajah Mada", "lat": -0.04520722723041784, "lng": 109.36358881291396},
    {"toko_id": 3, "name": "Mr. Serba Ada", "alamat": "Jl.Pattimura", "lat": -0.05623711446160067, "lng": 109.3372446919995}
]

data_transaksi = [
    {"trans_id": 1, "prod_id": "1111122222333", "toko_id": 1, "harga": 3500, "tgl": "2024-10-01 10:00:00"},
    {"trans_id": 2, "prod_id": "2222211111333", "toko_id": 2, "harga": 4000, "tgl": "2024-10-02 11:30:00"},
    {"trans_id": 3, "prod_id": "3333322222111", "toko_id": 3, "harga": 2500, "tgl": "2024-10-03 14:20:00"},
    {"trans_id": 4, "prod_id": "2222211111333", "toko_id": 1, "harga": 3000, "tgl": "2024-10-04 09:00:00"},
    {"trans_id": 5, "prod_id": "1111122222333", "toko_id": 2, "harga": 3200, "tgl": "2024-10-05 12:45:00"},
    {"trans_id": 6, "prod_id": "3333322222111", "toko_id": 3, "harga": 2800, "tgl": "2024-10-06 16:00:00"},
    {"trans_id": 7, "prod_id": "2222211111333", "toko_id": 1, "harga": 3100, "tgl": "2024-10-07 08:30:00"},
    {"trans_id": 8, "prod_id": "3333322222111", "toko_id": 2, "harga": 2900, "tgl": "2024-10-08 15:45:00"},
    {"trans_id": 9, "prod_id": "1111122222333", "toko_id": 3, "harga": 3500, "tgl": "2024-10-09 11:15:00"}
]

# Fungsi untuk menghapus semua dokumen dalam koleksi
def delete_all_documents(collection_name):
    collection_ref = db.collection(collection_name)
    docs = collection_ref.stream()
    
    for doc in docs:
        doc.reference.delete()  # Menghapus setiap dokumen

    print(f"Semua dokumen di koleksi '{collection_name}' berhasil dihapus.")

# Menghapus semua dokumen di koleksi 'produk', 'toko', dan 'transaksi' sebelum memasukkan data baru
delete_all_documents('produk')
delete_all_documents('toko')
delete_all_documents('transaksi')

# Memasukkan data ke koleksi Firestore
def insert_data(collection_name, data):
    for item in data:
        db.collection(collection_name).add(item)

# Memasukkan data ke koleksi masing-masing
insert_data('produk', data_produk)
insert_data('toko', data_toko)
insert_data('transaksi', data_transaksi)

print("Data berhasil dimasukkan ke Firestore.")
