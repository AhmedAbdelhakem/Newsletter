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
    <div className="flex flex-col gap-3">
      {/* Filter Input */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          className="w-full py-2.5 pl-9 pr-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Block List */}
      <div className="flex flex-col gap-1">
        {filteredBlocks.map((block) => {
          const isTextIcon = typeof block.icon === 'string';
          const IconComponent = isTextIcon ? null : block.icon;

          return (
            <div
              key={block.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-white border border-transparent rounded-lg cursor-grab select-none transition-all hover:bg-slate-50 hover:border-gray-200 active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-indigo-500 shrink-0">
                {isTextIcon ? (
                  <span className="text-base font-semibold text-indigo-500">{block.icon}</span>
                ) : (
                  <IconComponent size={18} strokeWidth={1.5} />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">{block.name}</span>
            </div>
          );
        })}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="text-center py-5 text-gray-400 text-[13px]">No blocks found</div>
      )}
    </div>
  );
}

export default BlockPalette;
