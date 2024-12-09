import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  APIProvider,
  Map,
  InfoWindow,
  useMap,
  Marker
} from "@vis.gl/react-google-maps";
import debounce from "lodash/debounce";
import { Transaction } from "../types/types";
import { fetchData } from "../libs/firestore";

import { useMyContext } from "../context/MyContext";
import Scanner from "../components/Scanner";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "../components/Tools";

const DEFAULT_CENTER = JSON.parse(import.meta.env.VITE_CENTER);

const Home = () => {

  const navigate = useNavigate();

  const { scannedValue, updateScannedValue } = useMyContext();

  const [productName, setProductName] = useState<string>("");
  const [productID, setProductID] = useState<string>("1111122222333");

  // center for the map
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);

  // center for position of marker and circle
  const [position, setPosition] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [pois, setPois] = useState<Transaction[]>([]);
  const [radius, setRadius] = useState<number>(8000);

  const [selectedPoi, setSelectedPoi] = useState<Transaction | null>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [locPopup, setLocPopup] = useState<google.maps.LatLngLiteral | null>(null);

  const handleMarkerClick = (e: google.maps.MapMouseEvent, poi: Transaction) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log(`Latitude: ${lat}, Longitude: ${lng}`);
      setLocPopup({ lat, lng });
      setInfoWindowShown(true);
      setSelectedPoi(poi);
    }
  };

  const onMapClick = useCallback(() => {
    setSelectedPoi(null);
    setInfoWindowShown(false);
  }, []);

  const handleInfowindowCloseClick = useCallback(
    () => setInfoWindowShown(false),
    []
  );

  // Fetch user's location and set as center
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setPosition({ lat: latitude, lng: longitude });
        },
        () => {
          setCenter(DEFAULT_CENTER);
          setPosition(DEFAULT_CENTER);
        }
      );
    } else {
      setCenter(DEFAULT_CENTER);
      setPosition(DEFAULT_CENTER);
    }
  };

  // jika ada scanned value
  useEffect(() => {
    const handleScannedValue = () => {
      if (scannedValue !== null) {
        setProductName("");
        setPois([]);
        setProductID(scannedValue);
      }
    }

    handleScannedValue();
  }, [scannedValue]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchData = useCallback(
    debounce(async (bar: string, rad: number) => {
      const data = await fetchData({ prodId: bar, setProductName });
      console.log(data);
      // 0 - produk tidak diinputkan sama sekali
      if (data === 0) {
        setPois([]);
        alert("Silahkan inputkan nomor produk");
      }

      // 1 - produk tidak ditemukan di database
      else if (data === 1) {
        // Tambahkan konfirmasi jika produk tidak ditemukan
        const confirmAddProduct = window.confirm(
          `Produk dengan Code "${bar}" tidak ditemukan. Apakah Anda ingin menambahkan produk baru?`
        );

        if (confirmAddProduct) {
          // Tambahkan ke fitur "Tambah Produk"
          updateScannedValue(bar);
          // console.log("Navigasi ke produk tambah...");
          navigate("/produk", { replace: true });
        }
        return;
      }

      // jika data transaksi ada
      if (Array.isArray(data)) {
        if (data.length === 0) {
          alert("Data transaksi tidak ditemukan di database");
          return;
        }
        setPois(data);
        const filteredData = data.filter((poi) => {
          const distance = calculateDistance(position, { lat: poi.lat, lng: poi.lng });
          return distance <= rad;
        });
        setPois(filteredData);
      }
    }, 300),
    [position]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //kosongkan poi di map dan nama produk
    setPois([]);
    setProductName("");

    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value.length > 13) return;
    setProductID(e.target.value);
  };

  const handleSubmit = () => {
    console.log("handledSubmit: ", productID);
    debouncedFetchData(productID, radius);
    setLocPopup(null);
    setProductName("");
  };

  const handleMarkerDragEnd = (newPosition: google.maps.LatLngLiteral) => {
    setPosition(newPosition);
  };

  return (
    <div className="container mx-auto px-6 flex flex-col md:flex-row gap-4">
      {/* input */}
      <div>
        <div>
          <h1 className="text-2xl font-bold mb-4">Home Page</h1>
          <Scanner />
          {scannedValue && (
            <h2 className="text-green-500 font-semibold text-lg mt-2">Scan Berhasil 😎</h2>
          )}
        </div>
        {/* Input Product ID */}
        <div className="my-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <label htmlFor="productID" className="block text-gray-700 flex-shrink-0">
            Product ID:
          </label>
          <div className="flex items-center gap-2 justify-between me-6">
            <input
              id="productID"
              type="number"
              maxLength={13}
              value={scannedValue !== null ? scannedValue : productID}
              onChange={handleInputChange}
              className={`w-full md:w-auto px-4 py-2 border rounded-lg ${scannedValue !== null ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
            />
            <span className={`${productName !== "" && "px-2.5 py-0.5"} bg-blue-100 text-blue-800 text-xs font-semibold rounded`}>
              {productName}
            </span>
          </div>
        </div>

        {/* Radius Input */}
        <div className="mb-4">
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="radius" className="block text-gray-700">
              Radius (meters):
            </label>
            <span className="text-gray-800 font-medium">{radius} meters</span>

          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              id="radius"
              type="range"
              min="500"
              max="10000"
              step="10"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 justify-end">
          <button
            onClick={fetchUserLocation}
            className="px-4 md:py-2 bg-slate-100 border-slate-900 border-2 text-slate-900 rounded-lg"
          >
            My Loc 📍
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>

      <APIProvider apiKey={import.meta.env.VITE_GMAPS_API}>
        <div className="w-full h-screen">
          <Map
            mapId={import.meta.env.VITE_GMAPS_ID}
            defaultCenter={center}
            defaultZoom={13}
            gestureHandling="greedy"
            onClick={onMapClick}
            clickableIcons={false}
            disableDefaultUI
          >
            <CenterMarker center={position} onMarkerDragEnd={handleMarkerDragEnd} />
            <MapCircle radius={radius} center={position} />
            {pois.map((poi) => {
              const zIndex = poi.id;
              return (
                <Marker
                  key={poi.id}
                  onClick={(e: google.maps.MapMouseEvent) => handleMarkerClick(e, poi)}
                  zIndex={zIndex}
                  title={poi.name}
                  position={{ lat: poi.lat, lng: poi.lng }}
                />
              );
            })}
            {infoWindowShown && locPopup && selectedPoi && (
              <InfoWindow
                position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
                pixelOffset={[0, -2]}
                maxWidth={200}
                onCloseClick={handleInfowindowCloseClick}
                headerContent={<div className="text-sm font-semibold mb-2">{selectedPoi.name}</div>}
                className="bg-white fill-transparent"
                headerDisabled
              >
                <div className="relative">
                  {/* Konten */}
                  <div className="text-sm font-semibold mb-2">{selectedPoi.name}</div>
                  <div className="text-sm text-gray-600">Rp {selectedPoi.price.toLocaleString()}</div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

const CenterMarker: React.FC<{ center: google.maps.LatLngLiteral; onMarkerDragEnd: (position: google.maps.LatLngLiteral) => void; }> = ({ center, onMarkerDragEnd }) => {
  const map = useMap();
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: center,
        map,
        draggable: true,
        icon: {
          url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi-dotless.png",
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current?.getPosition();
        if (position) {
          onMarkerDragEnd({
            lat: position.lat(),
            lng: position.lng(),
          });
        }
      });
    } else {
      markerRef.current.setPosition(center);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, center, onMarkerDragEnd]);

  return null;
};

const MapCircle: React.FC<{ radius: number; center: google.maps.LatLngLiteral }> = ({ radius, center }) => {
  const map = useMap();

  useEffect(() => {
    let circle: google.maps.Circle | undefined;

    if (map) {
      circle = new google.maps.Circle({
        strokeColor: "#AABBCC",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#CCCC77",
        fillOpacity: 0.35,
        map,
        center,
        radius,
        clickable: false,
      });
    }

    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [map, center, radius]);

  return null;
};

export default Home;
