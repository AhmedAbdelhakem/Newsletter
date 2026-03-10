import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist';
import ColorPlugin from 'editorjs-text-color-plugin';
import Undo from 'editorjs-undo';

// ...


import ImageUrlBlock from '../blocks/ImageUrlBlock';
import VideoBlock from '../blocks/VideoBlock';
import ButtonBlock from '../blocks/ButtonBlock';
import DividerBlock from '../blocks/DividerBlock';
import SpacerBlock from '../blocks/SpacerBlock';
import ColumnsBlock from '../blocks/ColumnsBlock';
import LinkToolBlock from '../blocks/LinkToolBlock';
import CustomLink from '../tools/CustomLink';
import AlignmentTune from '../tunes/AlignmentTune';
import TypographyTune from '../tunes/TypographyTune';

const Editor = forwardRef(({ onChange }, ref) => {
    const editorRef = useRef(null);
    const holderRef = useRef(null);
    const undoRef = useRef(null); // Ref for undo instance
    const [isDragOver, setIsDragOver] = useState(false);
    const manualSaveRef = useRef(() => { }); // Ref to hold the save function
    const debounceTimerRef = useRef(null); // Debounce timer for smoother updates

    useImperativeHandle(ref, () => ({
        undo: () => {
            if (undoRef.current) {
                undoRef.current.undo();
            }
        },
        redo: () => {
            if (undoRef.current) {
                undoRef.current.redo();
            }
        }
    }));

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
                    config: { defaultStyle: 'unordered' },
                    tunes: ['alignmentTune', 'typographyTune'],
                },
                orderedList: {
                    class: List,
                    inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
                    config: { defaultStyle: 'ordered' },
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
                link: {
                    class: CustomLink,
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
            onReady: () => {
                // Initialize Undo plugin
                undoRef.current = new Undo({ editor });
                undoRef.current.initialize(savedData);
            }
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
            case 'list':
                return { style: 'unordered', items: [''] };
            case 'orderedList':
                return { style: 'ordered', items: [''] };
            case 'checklist':
                return { items: [{ text: '', checked: false }] };
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
            className={`relative min-h-[500px] h-full transition-all duration-200 ease-out [&_.ce-block__content]:max-w-full [&_.codex-editor__redactor]:pb-[120px]! [&_.ce-popover-item__icon]:text-inherit! [&_.ce-popover-item--confirmation]:bg-red-600! [&_.ce-popover-item--confirmation]:text-white! [&_.ce-popover__item--confirm]:bg-red-600! [&_.ce-popover__item--confirm]:text-white! [&_.ce-popover-item--confirmation:hover]:bg-red-700! [&_.ce-popover__item--confirm:hover]:bg-red-700! [&_.ce-popover__item:not(.ce-popover__item--confirm):hover]:bg-slate-100! ${isDragOver ? 'bg-blue-50/50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div ref={holderRef} className="min-h-[500px] p-5" />

            {isDragOver && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 animate-pulse">
                    <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full font-bold">+</div>
                    <span>Drop to add block</span>
                </div>
            )}
        </div>
    );
});

export default Editor;
