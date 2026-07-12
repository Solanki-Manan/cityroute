import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import EmergencyRoute from './pages/EmergencyRoute/EmergencyRoute';
import CoverageAnalysis from './pages/CoverageAnalysis/CoverageAnalysis';
import TrafficReroute from './pages/TrafficReroute/TrafficReroute';
import Infrastructure from './pages/Infrastructure/Infrastructure';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/emergency" element={<EmergencyRoute />} />
          <Route path="/coverage" element={<CoverageAnalysis />} />
          <Route path="/traffic" element={<TrafficReroute />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
