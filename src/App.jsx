import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OpeningPage from './pages/OpeningPage';
import DashboardPage from './pages/DashboardPage';
import CSuitePage from './pages/CSuitePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-espresso-100 text-espresso-900 font-sans">
        <nav className="bg-espresso-900 text-espresso-100 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wider">ENZI COFFEE OPS</h1>
            <div className="space-x-4">
              <Link to="/" className="hover:text-white transition">Opening</Link>
              <Link to="/dashboard" className="hover:text-white transition">Barista</Link>
              <Link to="/c-suite" className="hover:text-white transition">C-Suite</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 max-w-lg md:max-w-4xl">
          <Routes>
            <Route path="/" element={<OpeningPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/c-suite" element={<CSuitePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
