import { useState } from 'react';
import './Modal.css';

// ── Add Zone Modal ─────────────────────────────────────────────────────────
export const AddZoneModal = ({ isOpen, clickCoords, onClose, onSubmit }) => {
  const [zoneType, setZoneType] = useState('zone');
  const [zoneName, setZoneName] = useState('');

  if (!isOpen) return null;

  const ZONE_TYPES = [
    { value: 'zone',     icon: '🏘️', label: 'Residential Zone', color: '#888888' },
    { value: 'hospital', icon: '🏥', label: 'Hospital',          color: '#f74f4f' },
    { value: 'fire',     icon: '🚒', label: 'Fire Station',      color: '#f79f07' },
    { value: 'police',   icon: '🚓', label: 'Police HQ',         color: '#4f8ef7' },
    { value: 'airport',  icon: '✈️', label: 'Airport',           color: '#9b59f7' },
  ];

  const selected = ZONE_TYPES.find(t => t.value === zoneType);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = zoneName.trim() || selected.label;
    onSubmit({ type: zoneType, label: name, x: clickCoords.x, y: clickCoords.y });
    setZoneName('');
    setZoneType('zone');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">{selected.icon}</span>
          <h3 className="modal-title">Add New Zone</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Zone type selector */}
          <div className="zone-type-grid">
            {ZONE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                className={`zone-type-btn ${zoneType === t.value ? 'active' : ''}`}
                style={{ '--zone-color': t.color }}
                onClick={() => setZoneType(t.value)}
              >
                <span className="zone-type-icon">{t.icon}</span>
                <span className="zone-type-label">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Zone name input */}
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Zone Name (optional)</label>
            <input
              type="text"
              placeholder={selected.label}
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
              autoFocus
              maxLength={30}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Zone</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Add Road Modal ─────────────────────────────────────────────────────────
export const AddRoadModal = ({ isOpen, fromNode, toNode, onClose, onSubmit }) => {
  const [distance, setDistance] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (distance > 0) {
      onSubmit(Number(distance));
      setDistance(10);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🛣️</span>
          <h3 className="modal-title">Add Road</h3>
        </div>

        {/* Show from → to */}
        <div className="road-connection">
          <div className="road-node from">
            <span className="road-node-icon">{fromNode?.icon || '📍'}</span>
            <span className="road-node-name">{fromNode?.label || '—'}</span>
          </div>
          <div className="road-arrow">→</div>
          <div className="road-node to">
            <span className="road-node-icon">{toNode?.icon || '📍'}</span>
            <span className="road-node-name">{toNode?.label || '—'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Road Distance (km)</label>
            <input
              type="number"
              min="1"
              max="999"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              autoFocus
            />
            <span className="input-hint">Enter how far apart these two locations are.</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Connect</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ───────────────────────────────────────────────────
export const DeleteConfirmModal = ({ isOpen, target, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const isNode = target?.kind === 'node';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon danger-icon">🗑️</span>
          <h3 className="modal-title">Confirm Delete</h3>
        </div>
        <p className="modal-body-text">
          {isNode
            ? <>Are you sure you want to remove <strong>{target.label}</strong>? All connected roads will also be removed.</>
            : <>Are you sure you want to remove the road between <strong>{target?.fromLabel}</strong> and <strong>{target?.toLabel}</strong>?</>
          }
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// ── Legacy default export (kept for backward compat) ───────────────────────
const Modal = ({ isOpen, title, onClose, onSubmit }) => {
  const [value, setValue] = useState(10);
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value > 0) { onSubmit(Number(value)); setValue(10); }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3 className="modal-title">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Distance (km)</label>
            <input type="number" min="1" value={value} onChange={e => setValue(e.target.value)} autoFocus />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Road</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
