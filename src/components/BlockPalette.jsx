import React from 'react';
import { Type, Image, MousePointer, Columns, Minus, ArrowUpDown, Link, AlignJustify, CheckSquare, Video } from 'lucide-react';

const BLOCK_TYPES = [
  { id: 'paragraph', name: 'Text', icon: Type, color: '#6366f1' },
  { id: 'header', name: 'Heading', icon: Type, color: '#8b5cf6' },
  { id: 'imageUrl', name: 'Image', icon: Image, color: '#10b981' },
  { id: 'video', name: 'Video / SVG', icon: Video, color: '#ef4444' },
  { id: 'checklist', name: 'Checklist', icon: CheckSquare, color: '#fda4af' },
  { id: 'button', name: 'Button', icon: MousePointer, color: '#f59e0b' },
  { id: 'row', name: 'Row', icon: AlignJustify, color: '#ec4899' },
  { id: 'columns', name: 'Columns', icon: Columns, color: '#3b82f6' },
  { id: 'divider', name: 'Divider', icon: Minus, color: '#64748b' },
  { id: 'spacer', name: 'Spacer', icon: ArrowUpDown, color: '#94a3b8' },
];

function BlockPalette() {
  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData('application/x-block-type', blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="block-palette">
      {BLOCK_TYPES.map((block) => {
        const IconComponent = block.icon;
        return (
          <div
            key={block.id}
            className="palette-item"
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
          >
            <div className="palette-icon" style={{ background: `${block.color}15`, color: block.color }}>
              <IconComponent size={18} />
            </div>
            <span className="palette-label">{block.name}</span>
          </div>
        );
      })}

      <style>{`
        .block-palette {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .palette-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all 0.15s ease;
          user-select: none;
        }
        
        .palette-item:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
          transform: translateX(2px);
        }
        
        .palette-item:active {
          cursor: grabbing;
          transform: scale(0.98);
        }
        
        .palette-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }
        
        .palette-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default BlockPalette;
