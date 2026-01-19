import React, { useState } from 'react';
import { Type, Image, MousePointer, Columns, Minus, ArrowUpDown, List, ListOrdered, CheckSquare, Search, Video, Link2 } from 'lucide-react';

const BLOCK_TYPES = [
  { id: 'header', name: 'Heading', description: 'Add a title or section heading', icon: 'H' },
  { id: 'paragraph', name: 'Text', description: 'Add paragraph text', icon: Type },
  { id: 'list', name: 'Unordered List', description: 'Add a bullet list', icon: List },
  { id: 'orderedList', name: 'Ordered List', description: 'Add a numbered list', icon: ListOrdered },
  { id: 'checklist', name: 'Checklist', description: 'Add a checklist', icon: CheckSquare },
  { id: 'imageUrl', name: 'Image', description: 'Add an image', icon: Image },
  { id: 'video', name: 'Video', description: 'Add a video', icon: Video },
  { id: 'linkTool', name: 'Link', description: 'Add a link', icon: Link2 },
  { id: 'button', name: 'Button', description: 'Add a CTA button', icon: MousePointer },
  { id: 'divider', name: 'Divider', description: 'Add a horizontal line', icon: Minus },
  { id: 'spacer', name: 'Spacer', description: 'Add vertical spacing', icon: ArrowUpDown },
  { id: 'columns', name: 'Columns', description: 'Add a 2-column layout', icon: Columns },
];

function BlockPalette() {
  const [filter, setFilter] = useState('');

  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData('application/x-block-type', blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredBlocks = BLOCK_TYPES.filter(block =>
    block.name.toLowerCase().includes(filter.toLowerCase()) ||
    block.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="block-palette">
      {/* Filter Input */}
      <div className="filter-wrapper">
        <Search size={16} className="filter-icon" />
        <input
          type="text"
          className="filter-input"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Block List */}
      <div className="block-list">
        {filteredBlocks.map((block) => {
          const isTextIcon = typeof block.icon === 'string';
          const IconComponent = isTextIcon ? null : block.icon;

          return (
            <div
              key={block.id}
              className="palette-item"
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
            >
              <div className="palette-icon">
                {isTextIcon ? (
                  <span className="text-icon">{block.icon}</span>
                ) : (
                  <IconComponent size={18} strokeWidth={1.5} />
                )}
              </div>
              <span className="palette-name">{block.name}</span>
            </div>
          );
        })}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="no-results">No blocks found</div>
      )}

      <style>{`
        .block-palette {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .filter-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .filter-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          pointer-events: none;
        }
        
        .filter-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          background: #ffffff;
          transition: all 0.15s ease;
        }
        
        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .filter-input::placeholder {
          color: #9ca3af;
        }
        
        .block-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .palette-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: grab;
          transition: all 0.15s ease;
          user-select: none;
        }
        
        .palette-item:hover {
          background: #f8fafc;
          border-color: #e5e7eb;
        }
        
        .palette-item:active {
          cursor: grabbing;
        }
        
        .palette-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 6px;
          color: #6366f1;
          flex-shrink: 0;
        }
        
        .palette-icon .text-icon {
          font-size: 16px;
          font-weight: 600;
          color: #6366f1;
        }
        
        .palette-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .no-results {
          text-align: center;
          padding: 20px;
          color: #9ca3af;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default BlockPalette;
