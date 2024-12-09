export const formatToCustomDate = (input: string): string => {
  // Parsing string ke Date
  const date = new Date(input.replace(" ", "T")); // Ganti spasi dengan 'T' agar kompatibel dengan Date

  // Ambil bagian tanggal dan waktu
  const day = date.getDate();
  const month = date.toLocaleString("id-ID", { month: "short" }); // Des untuk Indonesia
  const year = String(date.getFullYear()).slice(-2); // Ambil dua digit terakhir
  // const hours = String(date.getHours()).padStart(2, "0");
  // const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month}, ${year}`;
};

export const calculateDistance = (
  pointA: google.maps.LatLngLiteral,
  pointB: google.maps.LatLngLiteral
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pointA.lat * Math.PI) / 180;
  const φ2 = (pointB.lat * Math.PI) / 180;
  const Δφ = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const Δλ = ((pointB.lng - pointA.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};