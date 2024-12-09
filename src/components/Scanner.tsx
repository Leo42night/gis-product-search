import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { useEffect } from "react";
import { useMyContext } from '../context/MyContext'; // Import the context

const Scanner = () => {
  const { updateScannedValue } = useMyContext();  // Get the function from context

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner("html5qr-code-full-region", {
      fps: 10,
      qrbox: 250,
      disableFlip: false,
      aspectRatio: 1.5,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, true);

    html5QrcodeScanner.render((decodedText: string) => {
      updateScannedValue(decodedText);  // Update the global state with the decoded text
    }, () => {});

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [updateScannedValue]);

  return (
    <div className="max-w-96">
      <div id="html5qr-code-full-region" />
    </div>
  );
}

export default Scanner

