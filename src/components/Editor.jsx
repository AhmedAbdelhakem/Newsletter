import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist';
import ColorPlugin from 'editorjs-text-color-plugin';

// ...


import ImageUrlBlock from '../blocks/ImageUrlBlock';
import VideoBlock from '../blocks/VideoBlock';
import ButtonBlock from '../blocks/ButtonBlock';
import DividerBlock from '../blocks/DividerBlock';
import SpacerBlock from '../blocks/SpacerBlock';
import ColumnsBlock from '../blocks/ColumnsBlock';
import LinkToolBlock from '../blocks/LinkToolBlock';
import AlignmentTune from '../tunes/AlignmentTune';
import TypographyTune from '../tunes/TypographyTune';

function Editor({ onChange }) {
    const editorRef = useRef(null);
    const holderRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const manualSaveRef = useRef(() => { }); // Ref to hold the save function
    const debounceTimerRef = useRef(null); // Debounce timer for smoother updates

    useEffect(() => {
        if (editorRef.current) return;

        const savedData = JSON.parse(localStorage.getItem('newsletterDraft') || '{"blocks":[]}');

        const editor = new EditorJS({
            holder: holderRef.current,
            autofocus: true,
            data: savedData,
            placeholder: 'Drag blocks here or click + to add...',
            tools: {
                // ... (other tools)
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
                    tunes: ['alignmentTune', 'typographyTune'],
                },
                header: {
                    class: Header,
                    inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
                    config: { levels: [2, 3, 4], defaultLevel: 3 },
                    tunes: ['alignmentTune', 'typographyTune'],
                },
                list: {
                    class: List,
                    inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
                    tunes: ['alignmentTune', 'typographyTune'],
                },
                checklist: {
                    class: Checklist,
                    inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
                    tunes: ['alignmentTune', 'typographyTune'],
                },
                textColor: {
                    class: ColorPlugin,
                    config: {
                        colorCollections: ['#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
                        defaultColor: '#FF1300',
                        type: 'text',
                        customPicker: true
                    }
                },
                imageUrl: { class: ImageUrlBlock },
                video: { class: VideoBlock },
                button: { class: ButtonBlock },
                divider: { class: DividerBlock },
                spacer: { class: SpacerBlock },
                columns: {
                    class: ColumnsBlock,
                    toolbox: {
                        title: 'Columns',
                        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
                    }
                },
                row: {
                    class: ColumnsBlock,
                    toolbox: {
                        title: 'Row',
                        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'
                    }
                },
                linkTool: {
                    class: LinkToolBlock,
                },
                alignmentTune: {
                    class: AlignmentTune,
                    config: {
                        default: 'left',
                        blocks: {
                            header: 'center',
                            list: 'left',
                        },
                    },
                },
                typographyTune: {
                    class: TypographyTune,
                    config: {
                        onTuneChange: () => manualSaveRef.current()
                    }
                },
            },
            onChange: async () => {
                // Debounce the save to prevent excessive updates
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }
                debounceTimerRef.current = setTimeout(async () => {
                    try {
                        const data = await editor.save();
                        onChange(data);
                    } catch (e) {
                        console.warn('Save skipped:', e);
                    }
                }, 150); // 150ms debounce for smooth updates
            },
        });

        // Set the manual save function with debounce
        manualSaveRef.current = async () => {
            if (!editor || !editor.save) return;
            // Clear existing timer and set new one
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(async () => {
                try {
                    const data = await editor.save();
                    onChange(data);
                } catch (e) {
                    console.warn('Manual save skipped:', e);
                }
            }, 100); // Slightly faster for manual triggers
        };


        editorRef.current = editor;

        editor.isReady.then(() => {
            onChange(savedData);
        });

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [onChange]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const blockType = e.dataTransfer.getData('application/x-block-type');
        if (!blockType || !editorRef.current) return;

        const editor = editorRef.current;

        // Get default data for each block type
        const blockData = getDefaultBlockData(blockType);

        // Insert the block at the end
        await editor.blocks.insert(blockType, blockData);

        // Trigger save
        const data = await editor.save();
        onChange(data);
    };

    const getDefaultBlockData = (type) => {
        switch (type) {
            case 'paragraph':
                return { text: '' };
            case 'header':
                return { text: 'New Heading', level: 3 };
            case 'imageUrl':
                return { url: '' };
            case 'video':
                return { url: '', width: '100', autoPlay: true, muted: true, loop: true };
            case 'button':
                return { label: 'Click Me', url: 'https://', bgColor: '#6366f1', textColor: '#ffffff' };
            case 'row':
                return { columns: 1, content: [[{ type: 'text', value: 'Row Content' }]], backgroundColor: '#ffffff', paddingY: '10' };
            case 'columns':
                return { columns: 2, content: [[{ type: 'text', value: '' }], [{ type: 'text', value: '' }]] };
            case 'divider':
                return {};
            case 'spacer':
                return { height: 32 };
            case 'linkTool':
                return { link: '', meta: {} };
            default:
                return {};
        }
    };

    return (
        <div
            className={`editor-wrapper ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div ref={holderRef} className="editor-holder" />

            {isDragOver && (
                <div className="drop-indicator">
                    <div className="drop-icon">+</div>
                    <span>Drop to add block</span>
                </div>
            )}

            <style>{`
        .editor-wrapper {
          position: relative;
          min-height: 500px;
          transition: all 0.2s ease;
        }
        
        .editor-wrapper.drag-over {
          background: rgba(99, 102, 241, 0.05);
          border: 2px dashed var(--accent-primary);
          border-radius: var(--radius-lg);
        }
        
        .editor-holder {
          min-height: 500px;
          padding: 20px;
        }
        
        .editor-holder .ce-block__content {
          max-width: 100%;
        }
        
        .editor-holder .codex-editor__redactor {
          padding-bottom: 120px !important;
        }
        
        .drop-indicator {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--accent-primary);
          color: white;
          border-radius: var(--radius-lg);
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          animation: pulse 1s ease-in-out infinite;
        }
        
        .drop-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          font-weight: bold;
        }
        
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.02); }
        }

        /* Fix EditorJS Popover Item Hover Colors */
        .ce-popover-item__icon {
            color: inherit !important;
        }
        
        .ce-popover-item--confirmation {
            background-color: #fee2e2 !important;
            color: #ef4444 !important;
        }
        
        .ce-popover-item--confirmation:hover {
            background-color: #fca5a5 !important;
            color: #b91c1c !important;
        }

        /* Ensure text is visible in hover state for delete confirmation */
        .ce-popover__item--confirm {
             background-color: #fee2e2 !important;
             color: #ef4444 !important;
        }
        .ce-popover__item--confirm:hover {
             background-color: #fef2f2 !important;
             color: #dc2626 !important;
        }
        /* Default hover for other items */
        .ce-popover__item:hover:not(.ce-popover__item--confirm) {
            background-color: #f1f5f9 !important;
        }
      `}</style>
        </div>
    );
}

export default Editor;
