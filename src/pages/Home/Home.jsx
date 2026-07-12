import { Link } from 'react-router-dom';
import { Activity, Network, ShieldAlert, Navigation, ArrowRight } from 'lucide-react';
import './Home.css';

const features = [
  {
    title: "Emergency Route Finder",
    description: "Find the fastest route from any zone to the nearest hospital or fire station.",
    icon: <Activity className="feature-icon text-cyan" />,
    algorithm: "Dijkstra's Algorithm — O(E log V)",
    path: "/emergency",
    colorClass: "card-cyan"
  },
  {
    title: "Coverage Analysis",
    description: "Analyze the entire city network to find the optimal location for a new facility.",
    icon: <Network className="feature-icon text-purple" />,
    algorithm: "Floyd-Warshall Algorithm — O(V³)",
    path: "/coverage",
    colorClass: "card-purple"
  },
  {
    title: "Traffic Rerouting",
    description: "Handle dynamic road closures, traffic penalties, and detect negative traffic cycles.",
    icon: <ShieldAlert className="feature-icon text-orange" />,
    algorithm: "Bellman-Ford Algorithm — O(VE)",
    path: "/traffic",
    colorClass: "card-orange"
  },
  {
    title: "Infrastructure Planner",
    description: "Calculate the minimum cost to connect all city zones with pipes or roads.",
    icon: <Navigation className="feature-icon text-green" />,
    algorithm: "Kruskal's MST + DSU — O(E log E)",
    path: "/infrastructure",
    colorClass: "card-green"
  }
];

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <h1 className="hero-title">Smart City Emergency & <br/>Logistics Planner</h1>
        <p className="hero-subtitle">
          Graph algorithms solving real urban problems. Interactive, step-by-step visualizations for routing, coverage, and infrastructure.
        </p>
        <div className="hero-actions">
          <Link to="/emergency" className="btn btn-primary hero-btn">
            Try Demo City <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </header>
      
      <section className="features-grid">
        {features.map((feature, idx) => (
          <Link to={feature.path} key={idx} className={`feature-card ${feature.colorClass}`}>
            <div className="feature-header">
              {feature.icon}
              <h3 className="feature-title">{feature.title}</h3>
            </div>
            <p className="feature-description">{feature.description}</p>
            <div className="feature-algorithm">
              <span>{feature.algorithm}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;
