import React from 'react';
import { Palette } from 'lucide-react';

export const THEMES = [
  { id: 'default', name: 'Obsidian Midnight', color: '#6366f1' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#f43f5e' },
  { id: 'emerald', name: 'Emerald Matrix', color: '#10b981' },
  { id: 'sunset', name: 'Sunset Flame', color: '#f97316' },
  { id: 'nordic', name: 'Nordic Frost', color: '#38bdf8' }
];

export function ThemeSelector({ currentTheme, onSelectTheme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Palette size={16} color="var(--accent-indigo)" />
      <div className="theme-selector">
        {THEMES.map((t) => (
          <span
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            title={`Theme: ${t.name}`}
            className={`theme-pill ${currentTheme === t.id ? 'active' : ''}`}
            style={{
              background: t.color,
              transform: currentTheme === t.id ? 'scale(1.25)' : 'scale(1)',
              boxShadow: currentTheme === t.id ? `0 0 10px ${t.color}` : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
}
