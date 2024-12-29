import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Product } from "@/types/types"
import { Input } from "@/components/ui/input"
import { deleteProduct, getCountTransaksiProduk, updateProduct } from "@/libs/firestore"
import React, { useEffect } from "react"

interface Props {
  data: Product;
}

export function UpdateModal({ data } : Props) {
  const [newData, setNewData] = React.useState<Product>(data);

  const handleUpdate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!newData.name || !newData.category) {
      alert("Silahkan isi semua form.");
      return;
    }
    try {
      // console.log(newData);
      await updateProduct(newData.id, newData.name, newData.category);
      alert("Produk berhasil diupdate.");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Edit</Button>
      </DialogTrigger>
      <DialogContent  className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Produk</DialogTitle>
          <DialogDescription>
            Barcode: {newData.bar}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue={newData.name}
              onChange={(e) => setNewData({ ...newData, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              kategori
            </Label>
            <Input
              id="category"
              defaultValue={newData.category}
              onChange={(e) => setNewData({ ...newData, category: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpdate}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteModal({ data } : Props) {
  const [transProdCount, setTransProdCount] = React.useState(0);

  useEffect(() => {
    const fetchTransProdCount = async () => {
      const transProdCount = await getCountTransaksiProduk(data.bar);
      setTransProdCount(transProdCount);
    };
    fetchTransProdCount();
  });

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      await deleteProduct(data.id);
      alert("Produk berhasil dihapus.");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Produk</DialogTitle>
          <DialogDescription>
            Apakah anda yakin ingin menghapus produk ini?
            <br />
            Riwayat Transaksi Produk <strong>{transProdCount}</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" onClick={handleDelete}>Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}