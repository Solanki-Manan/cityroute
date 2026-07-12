import { MousePointer2, Plus, Trash2, MapPin, Info } from 'lucide-react';
import './MapToolbar.css';

const TOOLS = [
  {
    id: 'drag',
    icon: MousePointer2,
    label: 'Pan & Move',
    hint: 'Drag zones to move them. Scroll to zoom.',
    dotColor: '#5e9bfc',          // cool blue dot
  },
  {
    id: 'add_node',
    icon: MapPin,
    label: 'Add Zone',
    hint: 'Click the map to place a new zone here.',
    dotColor: '#52d98f',          // mint green dot
  },
  {
    id: 'add_edge',
    icon: Plus,
    label: 'Add Road',
    hint: 'Click FIRST zone, then SECOND zone to connect.',
    dotColor: '#00e5c3',          // teal dot
  },
  {
    id: 'delete',
    icon: Trash2,
    label: 'Delete',
    hint: 'Click a zone or road to remove it.',
    dotColor: '#ff3d71',          // rose/danger dot
    isDanger: true,
  },
];

const MapToolbar = ({ mode, setMode, onClear, edgeStartNodeName }) => {
  const activeTool = TOOLS.find(t => t.id === mode);

  const getHint = () => {
    if (mode === 'add_edge' && edgeStartNodeName) {
      return `✓ "${edgeStartNodeName}" — now click the destination zone`;
    }
    return activeTool?.hint;
  };

  return (
    <div className="map-toolbar-wrapper">
      {/* Dot toolbar rail */}
      <div className="dot-toolbar">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = mode === tool.id;
          return (
            <button
              key={tool.id}
              className={`dot-btn ${isActive ? 'dot-active' : ''}`}
              style={{ '--dot-color': tool.dotColor }}
              onClick={() => setMode(tool.id)}
              aria-label={tool.label}
            >
              {/* The dot indicator */}
              <span className="dot-pip" />

              {/* Expanded content (only visible when active) */}
              <span className="dot-content">
                <Icon size={13} className="dot-icon" />
                <span className="dot-label">{tool.label}</span>
              </span>
            </button>
          );
        })}

        {/* Separator + clear */}
        <span className="dot-sep" />
        <button
          className="dot-btn dot-clear"
          onClick={onClear}
          style={{ '--dot-color': '#7a7060' }}
          aria-label="Clear all"
          title="Clear entire map"
        >
          <span className="dot-pip" />
          <span className="dot-content">
            <Trash2 size={12} className="dot-icon" />
            <span className="dot-label">Clear</span>
          </span>
        </button>
      </div>

      {/* Hint strip — only shows when a mode is active */}
      {activeTool && (
        <div
          className={`dot-hint ${mode === 'add_edge' && edgeStartNodeName ? 'hint-active' : ''}`}
          style={{ '--hint-color': activeTool.dotColor }}
        >
          <Info size={11} />
          <span>{getHint()}</span>
        </div>
      )}
    </div>
  );
};

export default MapToolbar;
