import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

const originalWarn = console.warn;

const hideMessageWarn = [
  "google.maps.Marker is deprecated",
];

console.warn = (...args) => {
  const warningMessage = args[0] || "";
  for (const message of hideMessageWarn) {
    if (warningMessage.includes(message)) {
      return;
    }
  }
  // Otherwise, forward to the original console.warn
  originalWarn(...args);
};


// chrome://flags -> Enable reporting of usage hints in the console = false (untuk menutup pesan [Violation]) 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
