import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CallbackModal from './components/CallbackModal';
import MobileMessengerWidget from './components/MobileMessengerWidget';
import AdminPage from './pages/AdminPage';

function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (route === '/admin') {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <HeroSection />
      <MobileMessengerWidget />
      <CallbackModal />
    </div>
  );
}

export default App;
