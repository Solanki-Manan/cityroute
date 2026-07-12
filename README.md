# 🌆 CityRoute: Graph Algorithms Visualizer

CityRoute is an interactive, Cyberpunk-themed web application designed to demonstrate the real-world utility of graph algorithms in urban planning and emergency logistics. 

By modeling a city as a mathematical graph (where zones are nodes and roads are edges), this application visualizes how different algorithms solve complex routing and infrastructure problems in real-time.

## ✨ Features

- **Interactive City Map:** Drag, drop, add, and remove city zones and roads. Simulate real-world events by clicking on roads to block them (simulating traffic or construction).
- **Emergency Routing:** Uses **Dijkstra's Algorithm** to calculate the absolute fastest route between any two points in the city, ensuring emergency vehicles get where they need to go.
- **Traffic Rerouting:** Uses the **Bellman-Ford Algorithm** to dynamically recalculate paths for dispatch centers when unexpected road closures occur. It even detects negative-cycle paradoxes!
- **Coverage Analysis:** Uses the **Floyd-Warshall Algorithm** to generate a complete distance matrix for the city. It automatically flags high-risk zones that are too far from essential services (like hospitals or fire stations) and suggests where to build new ones.
- **Infrastructure Planning:** Uses **Kruskal's Algorithm** to calculate the Minimum Spanning Tree (MST). This determines the cheapest way to upgrade the city's road network so that every single zone remains connected using the absolute minimum total road weight.

## 💻 Tech Stack

- **Framework:** React + Vite
- **Styling:** Custom CSS (Cyberpunk / Neon City Theme)
- **Visualization:** D3.js (for rendering the interactive SVG graph network)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Solanki-Manan/cityroute.git
```

2. Navigate to the project directory:
```bash
cd cityroute
```

3. Install the dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:5173` to interact with the map!

## 🛠️ Graph Algorithms Used

1. **Dijkstra's Algorithm:** Single-source shortest path for graphs with non-negative edge weights.
2. **Bellman-Ford Algorithm:** Single-source shortest path that can handle negative edge weights and detect negative cycles.
3. **Floyd-Warshall Algorithm:** All-pairs shortest path algorithm used to find distances between all pairs of vertices.
4. **Kruskal's Algorithm:** Greedy algorithm used to find the Minimum Spanning Tree (MST) for a connected weighted graph. Uses a Disjoint Set Union (DSU) data structure.

## 🎨 Theme
The application features a custom-built **Neon City / Cyberpunk** aesthetic, emphasizing high-contrast neon blues, hot magentas, and electric yellows over a dark, glassmorphic UI layout.
