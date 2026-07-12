import { NavLink } from 'react-router-dom';
import { Map, Activity, ShieldAlert, Navigation, Network } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          <Map className="icon-logo" />
          <span>CityRoute</span>
        </NavLink>
        
        <ul className="nav-links">
          <li>
            <NavLink to="/emergency" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Activity className="nav-icon" /> Emergency
            </NavLink>
          </li>
          <li>
            <NavLink to="/coverage" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Network className="nav-icon" /> Coverage
            </NavLink>
          </li>
          <li>
            <NavLink to="/traffic" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <ShieldAlert className="nav-icon" /> Traffic
            </NavLink>
          </li>
          <li>
            <NavLink to="/infrastructure" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Navigation className="nav-icon" /> Infrastructure
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
