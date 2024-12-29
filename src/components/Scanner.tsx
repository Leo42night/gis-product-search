import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { useEffect } from "react";
import { useMyContext } from '../context/MyContext'; // Import the context

const Scanner = () => {
  const { updateScannedValue } = useMyContext();  // Get the function from context

  useEffect(() => {
    // ID elemen tempat scanner akan di-render
    const scannerId = "my-scanner-gis";

    const html5QrcodeScanner = new Html5QrcodeScanner(scannerId, {
      qrbox: 250,
      fps: 10,
      aspectRatio: 1.5,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false);

    html5QrcodeScanner.render(
      (decodedText: string) => {
        updateScannedValue(decodedText); // Update the global state with the decoded text
      },
      () => { }
    );

    // Event listener untuk menangani saat halaman di-refresh atau user berpindah ke halaman lain
    const handleBeforeUnload = () => {
      html5QrcodeScanner.pause(true);
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner:", error);
      });
      // html5QrcodeScanner.getState() === "running" && html5QrcodeScanner.pause();
    };

    // Menambahkan event listener untuk 'beforeunload'
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup saat komponen di-unmount
    return () => {
      html5QrcodeScanner.pause(true);
      html5QrcodeScanner
        .clear()
        .catch((error) => {
          console.error("Failed to clear html5QrcodeScanner:", error);
        });

      // Hapus event listener saat komponen di-unmount
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-96">
      <div id="my-scanner-gis" />
    </div>
  );
}

export default Scanner

