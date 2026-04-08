import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Scoring from './pages/Scoring';
import LiveScore from './pages/LiveScore';
import NewMatch from './pages/NewMatch';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-950">
        <Routes>
          {/* LiveScore gets its own full-screen layout */}
          <Route path="/live/:matchId" element={<LiveScore />} />

          {/* Main layout with header/footer */}
          <Route path="*" element={
            <>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/new" element={<NewMatch />} />
                  <Route path="/scoring/:matchId" element={<Scoring />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}