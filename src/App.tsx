import { passiveSupport } from 'passive-events-support/src/utils';
passiveSupport({ debug: false });
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from './page/Home';
import KelolaProduk from './page/KelolaProduk';
import KelolaTransaksi from './page/KelolaTransaksi';
import KelolaToko from './page/KelolaToko';
import { MyProvider } from './context/MyContext';
import Logo from './images/Logo.svg';
import './globals.css';
import { useAuth } from './context/AuthContext';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, login } = useAuth();


  return (
    <MyProvider>
      <Router>
        <div className="container mx-auto md:p-2">
          {/* Navigasi antar halaman */}
          <nav className="flex items-center justify-between bg-gray-800 text-white p-4 rounded-md">
            {/* Icon Aplikasi dan Link ke Home */}
            <a
              href="/"
              className="flex items-center space-x-2 text-white font-semibold hover:text-gray-300"
            >
              <img src={Logo} alt="Logo CariBarang" className='w-10' />
              <span className='text-2xl'>CariBarang</span>
            </a>

            {/* Hamburger Menu for Mobile */}
            <div className="flex items-center space-x-2 justify-end md:hidden">
                {isAuthenticated ? (
                  <Avatar/>
                ) : <button className='border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-700' onClick={login}>Login</button>}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white bg-gray-800 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Links */}
            <ul
              className={`flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 bg-gray-800 md:bg-transparent absolute md:relative left-0 w-full md:w-auto ${isOpen ? "block top-16 z-10" : "hidden md:flex"
                }`}
            >
              <li>
                <a href="/" className="block md:inline hover:text-gray-300 px-4 py-2 md:p-0">Home</a>
              </li>
              <li>
                <a href="/produk" className="block md:inline hover:text-gray-300 px-4 py-2 md:p-0">Produk</a>
              </li>
              <li>
                <a href="/transaksi" className="block md:inline hover:text-gray-300 px-4 py-2 md:p-0">Transaksi</a>
              </li>
              <li>
                <a href="/toko" className="block md:inline hover:text-gray-300 px-4 py-2 md:p-0">Toko</a>
              </li>
            </ul>
            <ul className='hidden md:flex space-x-4 items-center'>
              <li className=''>
                {isAuthenticated ? (
                  <Avatar/>
                ) : <button className='border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-700' onClick={login}>Login</button>}
              </li>
              <li>
                <a
                  href="https://github.com/leo42night/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.536 2.29 6.562 5.439 7.624..." />
                  </svg>
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        {/* Routing */}
        <Routes>
          <Route index element={<Home />} />
          <Route path="/produk" element={<KelolaProduk />} />
          <Route path="/transaksi" element={<KelolaTransaksi />} />
          <Route path="/toko" element={<KelolaToko />} />
        </Routes>
      </Router>
    </MyProvider>
  )
}

const Avatar = () => {
  const { user, logout } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);

  // Membuat inisial dari nama lengkap
  const getInitials = (name: string | null) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts.map(part => part.charAt(0).toUpperCase()).join('');
  };

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <div className='relative border border-gray-300 rounded-full p-1'>
      {/* Avatar Bulat */}
      <div
        className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full cursor-pointer"
        onClick={togglePopup}
      >
        {user ? getInitials(user.displayName) : 'U'}
      </div>

      {/* Popup */}
      {isPopupVisible && (
        <div className="z-10 absolute top-12 right-0 bg-white shadow-lg rounded-lg p-4 min-w-min">
          <h2 className="text-lg font-semibold text-gray-800">{user?.displayName}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <button
            className="mt-2 w-full py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App
