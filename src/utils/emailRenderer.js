import DOMPurify from 'dompurify';
import { ALL_FONTS, WEB_SAFE_FONTS } from '../constants/googleFonts';

const BODY_STYLE = 'margin:0;padding:0;background-color:#f3f4f6;';
const TABLE_STYLE = 'width:100%;max-width:600px;margin:0 auto;border-spacing:0;border-collapse:collapse;background-color:#ffffff;';
const TD_BASE = 'padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;';

function sanitize(input = '') {
    const str = String(input || '');
    return DOMPurify.sanitize(str, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'font', 'u', 'br', 'p', 'div', 'mark', 'ul', 'li', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Expanded whitelist
        ALLOWED_ATTR: ['href', 'target', 'style', 'color', 'face', 'size', 'align', 'class'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onmouseover', 'onclick']
    });
}

/**
 * Convert SVG image URLs to PNG using weserv.nl proxy
 * Gmail and most email clients don't support SVG images
 */
function convertSvgToPng(url) {
    if (!url) return url;

    // Check if URL ends with .svg (case insensitive)
    if (url.toLowerCase().endsWith('.svg')) {
        // Use weserv.nl proxy to convert SVG to PNG
        // Remove protocol for weserv.nl format
        const cleanUrl = url.replace(/^https?:\/\//, '');
        return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=600&output=png`;
    }

    return url;
}
// ... (existing code matches)

function applyTypographyStyle(base, block) {
    const typo = getTypography(block);
    let styles = base.trim();

    // Ensure base ends with semicolon
    if (styles && !styles.endsWith(';')) {
        styles += ';';
    }

    // Apply typography overrides - these come AFTER base styles to override defaults
    if (typo.fontSize) {
        styles += `font-size:${typo.fontSize};`;
    }
    if (typo.fontFamily) {
        // Convert double quotes to single quotes for HTML style attribute compatibility
        const fontFamily = typo.fontFamily.replace(/"/g, "'");
        styles += `font-family:${fontFamily};`;
    }
    if (typo.color) {
        styles += `color:${typo.color};`;
    }

    return styles;
}

// ... (renderers)

export function renderEmailHTML({ blocks = [] }, settings = {}) {
    const rows = blocks.map(block => blockRenderers[block.type]?.(block) || '').join('');

    // Default to white if not provided
    const bgColor = settings.backgroundColor || '#ffffff';
    const contentBgColor = settings.contentBackgroundColor || '#ffffff';
    const bgImage = settings.backgroundImage || '';
    const bgVideo = settings.backgroundVideo || '';
    const darkMode = settings.darkModeSupport || false;

    // Dark Mode Style Injection
    let darkModeStyles = '';
    if (darkMode) {
        const dmPage = settings.darkModePageColor || '#1a1a1a';
        const dmContent = settings.darkModeContentColor || '#2d2d2d';
        const dmText = settings.darkModeTextColor || '#e5e5e5';

        darkModeStyles = `
        <style>
          @media (prefers-color-scheme: dark) {
            .body-bg { background-color: ${dmPage} !important; }
            .content-bg { background-color: ${dmContent} !important; }
            p, h1, h2, h3, h4, h5, h6, span, li { color: ${dmText} !important; }
            .dark-mode-text { color: ${dmText} !important; }
            a { color: #60a5fa !important; }
          }
        </style>
        `;
    }

    // Determine MAIN wrapper style
    // If video is present, the wrapper itself needs to be relative to contain the absolute video.
    // The background color applies to this wrapper.
    const bodyStyle = `margin:0;padding:0;background-color:${bgVideo ? 'transparent' : bgColor};`;

    // Global Background Video Logic
    let bgVideoHtml = '';
    if (bgVideo) {
        bgVideoHtml = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;overflow:hidden;z-index:-1;">
                <video autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;">
                    <source src="${bgVideo}" type="video/${bgVideo.split('.').pop()}">
                </video>
                ${bgImage ? `<img src="${bgImage}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;" alt="">` : ''}
            </div>
        `;
    }

    // If only image (no video), apply to body style
    let bodyAttrs = '';
    if (bgImage && !bgVideo) {
        // We apply it to a div wrapper instead of body to be safe, or just style the body
        // For simple email client support, applying to body or main table is best.
        // Let's wrap everything in a main div.
    }

    const contentBgImage = settings.contentBackgroundImage || '';
    const contentBgVideo = settings.contentBackgroundVideo || '';

    // Content Background Video Logic
    let contentVideoHtml = '';
    if (contentBgVideo) {
        contentVideoHtml = `
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;z-index:0;border-radius:0;">
                <video autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;">
                    <source src="${contentBgVideo}" type="video/${contentBgVideo.split('.').pop()}">
                </video>
                ${contentBgImage ? `<img src="${contentBgImage}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;" alt="">` : ''}
            </div>
        `;
    }

    // Determine Content Table Style
    // If content video exists, the table background must be transparent to show it.
    const effectiveContentBg = contentBgVideo ? 'transparent' : contentBgColor;

    // If content image (and NO video), apply to table
    let contentTableStyle = `${TABLE_STYLE}background-color:${effectiveContentBg};`;
    let contentTableAttrs = '';

    if (contentBgImage && !contentBgVideo) {
        contentTableStyle += `background-image:url('${contentBgImage}');background-size:cover;background-position:center;`;
        contentTableAttrs += ` background="${contentBgImage}"`;
    }

    let innerContent = `
        <!-- Main Container Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="content-bg" style="${contentTableStyle}"${contentTableAttrs}>
            ${rows}
        </table>
    `;

    // If Content Video, wrap the table in a relative div
    if (contentBgVideo) {
        innerContent = `
            <div style="position:relative;width:100%;max-width:600px;margin:0 auto;overflow:hidden;background-color:${contentBgColor};">
                ${contentVideoHtml}
                <div style="position:relative;z-index:1;">
                    ${innerContent}
                </div>
            </div>
        `;
    }

    const mainContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="body-bg" style="width:100%;background-color:${bgVideo ? 'transparent' : bgColor};${(bgImage && !bgVideo) ? `background-image:url('${bgImage}');background-size:cover;background-position:center;` : ''}">
            <tr>
                <td align="center" style="padding-top:20px;padding-bottom:40px;">
                    ${innerContent}
                </td>
            </tr>
        </table>
    `;

    // Detect used fonts to inject Google Fonts link
    const usedFonts = new Set();
    const collectFont = (block) => {
        // Check typography tune
        const tuneFont = block?.tunes?.typographyTune?.fontFamily;
        if (tuneFont) {
            // Find the font object in our list to get the NAME (e.g., 'Roboto') from the value (e.g., '"Roboto", sans-serif')
            // This is safer than regex parsing the value
            const matchedFont = ALL_FONTS.find(f => f.val === tuneFont);
            if (matchedFont) usedFonts.add(matchedFont.name);
        }

        // Check Link Tool
        if (block.type === 'linkTool' && block.data?.style?.fontFamily) {
            const matchedFont = ALL_FONTS.find(f => f.val === block.data.style.fontFamily);
            if (matchedFont) usedFonts.add(matchedFont.name);
        }

        // Check nested content (rows, columns)
        if (block.data && block.data.content && Array.isArray(block.data.content)) {
            // Grid content
            block.data.content.forEach(col => {
                if (Array.isArray(col)) {
                    col.forEach(item => {
                        if (item.fontFamily) {
                            const matchedFont = ALL_FONTS.find(f => f.val === item.fontFamily);
                            if (matchedFont) usedFonts.add(matchedFont.name);
                        }
                        // Check for linkPreview within columns/rows which stores font in style.fontFamily
                        if (item.type === 'linkPreview' && item.style?.fontFamily) {
                            const matchedFont = ALL_FONTS.find(f => f.val === item.style.fontFamily);
                            if (matchedFont) usedFonts.add(matchedFont.name);
                        }
                    });
                }
            });
        }
    };
    blocks.forEach(collectFont);

    // Filter out web-safe fonts and build URL
    const googleFontsToLoad = Array.from(usedFonts).filter(fontName => {
        return !WEB_SAFE_FONTS.some(ws => ws.name === fontName) && fontName !== 'Default';
    });

    let googleFontsLink = '';
    if (googleFontsToLoad.length > 0) {
        const families = googleFontsToLoad.map(name => `family=${name.replace(/\s+/g, '+')}:wght@400;700`).join('&');
        googleFontsLink = `<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`;
    }

    return `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${googleFontsLink}
        ${darkModeStyles}
      </head>
      <body style="${bodyStyle}">
        ${bgVideoHtml}
        ${mainContent}
      </body>
    </html>`;
}

function wrapRow(content) {
    return `<tr><td style="${TD_BASE} padding:0;">${content}</td></tr>`;
}

function getAlignment(block) {
    return block?.tunes?.alignmentTune?.alignment || 'left';
}

function applyAlignmentStyle(base, block) {
    const align = getAlignment(block);
    return `${base} text-align:${align};`;
}

function headerSize(level = 3) {
    switch (level) {
        case 2:
            return '22px';
        case 4:
            return '16px';
        default:
            return '18px';
    }
}

function renderList({ style = 'unordered', items = [], meta = {} }) {
    // Determine the list style type from 'style' or 'meta.counterType'
    let listStyleType = (meta.counterType || style || 'unordered').toLowerCase();

    // Normalize basic types
    if (listStyleType === 'ordered') listStyleType = 'decimal';
    else if (listStyleType === 'unordered') listStyleType = 'disc';

    // Check if it should be an <ol> (ordered) or <ul> (unordered)
    // Common ordered types: decimal, lower-alpha, upper-alpha, lower-roman, upper-roman
    const orderedTypes = ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'];
    const isOrdered = orderedTypes.includes(listStyleType);

    const tag = isOrdered ? 'ol' : 'ul';

    // Build attributes for ordered lists
    let attrs = '';
    if (isOrdered) {
        attrs += ' type="1"'; // Fallback attribute
        // Add start attribute if specified (for "Start with" feature)
        const startNum = meta.start || 1;
        if (startNum > 1) {
            attrs += ` start="${startNum}"`;
        }
    }

    const listItems = items.map(item => {
        let content = item;
        if (typeof item === 'object' && item !== null) {
            content = item.content || item.text || item.value || '';
        }
        return `<li style="margin-bottom:6px;list-style-type:${listStyleType};">${sanitize(content)}</li>`;
    }).join('');

    return `<${tag}${attrs} style="padding-left:20px;margin:0;list-style-type:${listStyleType};list-style-position:inside;">${listItems}</${tag}>`
}

function renderVideoHtml(data) {
    const width = data.width || '100';
    const borderRadius = data.borderRadius || '0';
    const border = data.border || 'none';
    const shadow = data.shadow || 'none';
    const alt = sanitize(data.alt || 'Video');

    // Check for video file extensions
    const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].some(ext => (data.url || '').toLowerCase().endsWith(ext));

    if (isVideo) {
        const autoplay = data.autoPlay ? 'autoplay' : '';
        const loop = data.loop ? 'loop' : '';
        const muted = data.muted ? 'muted' : '';
        const controls = 'controls'; // Always include controls as fallback

        const posterUrl = data.posterUrl || '';
        const fallbackImg = posterUrl
            ? `<img src="${posterUrl}" alt="${alt}" style="display:block;width:100%;height:auto;border-radius:${borderRadius}px;">`
            : `<span style="color:#666;font-family:Arial,sans-serif;">Video: ${alt}</span>`;

        return `<video width="${width}%" style="display:block;max-width:100%;height:auto;border-radius:${borderRadius}px;border:${border};box-shadow:${shadow};" ${autoplay} ${loop} ${muted} ${controls} poster="${posterUrl}">
            <source src="${data.url}" type="video/${data.url.split('.').pop()}">
            ${fallbackImg}
        </video>`;
    } else {
        // Check for YouTube URL
        const getYouTubeId = (url) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url?.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };
        const youtubeId = getYouTubeId(data.url);

        if (youtubeId) {
            const thumbnailUrl = data.posterUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
            return `
                <a href="${data.url}" target="_blank" style="display:block;text-decoration:none;">
                    <img src="${thumbnailUrl}" alt="${alt}" style="display:block;width:${width}%;max-width:100%;height:auto;border:${border};border-radius:${borderRadius}px;box-shadow:${shadow};">
                </a>
            `;
        } else {
            return `<img src="${data.url}" alt="${alt}" style="display:block;width:${width}%;max-width:100%;height:auto;border:${border};border-radius:${borderRadius}px;box-shadow:${shadow};">`;
        }
    }
}

function renderColumnItem(item) {
    if (typeof item === 'string') {
        return `<p style="margin:0 0 12px 0;font-family:Arial;font-size:15px;line-height:1.6;color:#1f2937;">${sanitize(item)}</p>`;
    }

    switch (item.type) {
        case 'text':
            // Build typography styles
            let textStyles = 'margin:0 0 12px 0;line-height:1.6;';
            textStyles += `font-family:${item.fontFamily ? item.fontFamily.replace(/"/g, "'") : 'Arial'};`;
            textStyles += `font-size:${item.fontSize || '15px'};`;
            textStyles += `color:${item.color || '#1f2937'};`;
            return `<p style="${textStyles}">${sanitize(item.value || '')}</p>`;

        case 'button':
            const btnBg = item.bgColor || '#6366f1';
            const btnColor = item.textColor || '#ffffff';
            const btnLabel = sanitize(item.label || 'Click me');
            const btnUrl = item.url || '#';

            const btnPadX = item.paddingX || '20';
            const btnPadY = item.paddingY || '10';
            const btnRadius = item.borderRadius || '4';
            const btnSize = item.fontSize || '14';
            const btnAlign = item.align || 'center';
            const btnFullWidth = item.fullWidth ? 'display:block;width:100%;box-sizing:border-box;' : 'display:inline-block;';
            const btnAlignStyle = item.align === 'center' ? 'text-align:center;' : item.align === 'right' ? 'text-align:right;' : 'text-align:left;';

            return `<div style="margin:0 0 12px 0;${btnAlignStyle}"><a href="${btnUrl}" style="${btnFullWidth}padding:${btnPadY}px ${btnPadX}px;border-radius:${btnRadius}px;text-decoration:none;font-weight:bold;font-size:${btnSize}px;font-family:Arial,sans-serif;background:${btnBg};color:${btnColor};text-align:center;">${btnLabel}</a></div>`;

        case 'image':
            const imgUrl = item.url || '';
            const imgAlt = sanitize(item.alt || '');
            if (!imgUrl) return '';

            const imgWidth = item.width || '100';
            const imgRadius = item.borderRadius || '4';
            const imgShadow = item.shadow === 'none' ? '' : `box-shadow:${item.shadow};`;

            return `<div style="margin:0 0 12px 0;"><img src="${convertSvgToPng(imgUrl)}" alt="${imgAlt}" style="display:block;width:${imgWidth}%;max-width:100%;height:auto;border:0;border-radius:${imgRadius}px;${imgShadow}"></div>`;

        case 'link':
            const linkText = sanitize(item.text || 'Link');
            const linkUrl = item.url || '#';
            const linkColor = item.color || '#6366f1';
            return `<div style="margin:0 0 12px 0;"><a href="${linkUrl}" style="font-family:Arial;font-size:15px;color:${linkColor};text-decoration:underline;">${linkText}</a></div>`;

        case 'heading':
            const level = item.level || 2;
            const fontSize = headerSize(level);
            const align = item.align || 'left';
            const color = item.color || '#111827';
            return `<h${level} style="margin:0 0 12px 0;font-family:Arial;font-size:${fontSize};font-weight:bold;color:${color};text-align:${align};line-height:1.3;">${sanitize(item.text)}</h${level}>`;

        case 'list':
            return `<div style="margin:0 0 12px 0;">${renderList({ style: item.style, items: item.items })}</div>`;

        case 'checklist':
            const items = item.items || [];
            if (!Array.isArray(items)) return '';
            const checklistHtml = items.map(i => {
                // Determine if it looks like {text:..., checked:...} or just string
                const checked = typeof i === 'object' ? i.checked : false;
                const text = sanitize(typeof i === 'object' ? i.text : i);
                const icon = checked
                    ? `<span style="display:inline-block;width:16px;height:16px;background:#2563eb;border:2px solid #2563eb;border-radius:4px;color:white;text-align:center;line-height:14px;font-size:12px;">✓</span>`
                    : `<span style="display:inline-block;width:16px;height:16px;background:white;border:2px solid #d1d5db;border-radius:4px;"></span>`;

                return `<div style="margin-bottom:8px;display:flex;align-items:start;">
               <div style="flex-shrink:0;margin-right:12px;padding-top:2px;">${icon}</div>
               <div style="flex-grow:1;line-height:1.6;">${text}</div>
            </div>`;
            }).join('');
            return `<div style="margin:0 0 12px 0;">${checklistHtml}</div>`;

        case 'video':
            // Reuse video rendering logic
            return `<div style="margin:0 0 12px 0;">${renderVideoHtml(item)}</div>`;

        case 'divider':
            const thick = item.thickness || 1;
            const col = item.color || '#e5e7eb';
            const my = item.paddingY || 20;
            return `<div style="padding:${my}px 0;"><hr style="border:none;border-top:${thick}px solid ${col};margin:0;"></div>`;

        case 'spacer':
            return `<div style="height:${item.height || 32}px;"></div>`;

        case 'linkPreview':
            // Re-use renderLinkPreview. It uses block for alignment but we can pass null or mimic needed props if necessary.
            // applyAlignmentStyle checks block?.tunes?.alignmentTune?.alignment
            // For column items, we don't have block tunes. applyAlignmentStyle defaults to 'left'.
            // If we want alignment on link preview inside columns, we'd need to add alignment to the item data schema and Mock the block object.
            // For now, let's just pass null.
            return `<div style="margin:0 0 12px 0;">${renderLinkPreview(item, null)}</div>`;

        case 'row':
            return renderGrid(item, true);

        default:
            return '';
    }
}

// Core grid renderer used by both main Columns block and nested Row items
function renderGrid(data, isNested = false) {
    const cols = data.columns || 2;
    const items = data.content || [];
    const bgColor = data.backgroundColor || 'transparent';
    const paddingY = data.paddingY || '0';

    // Calculate widths
    let widths = [];
    if (cols === 1) widths = ['100%'];
    else if (cols === 2) widths = ['50%', '50%'];
    else if (cols === 3) widths = ['33.33%', '33.33%', '33.33%'];
    else widths = Array(cols).fill(`${100 / cols}%`);

    const bgImage = data.backgroundImage || '';
    const bgVideo = data.backgroundVideo || '';
    const bgSize = data.backgroundSize || 'cover';
    const bgPos = data.backgroundPosition || 'center center';

    // Determine effective background color
    // If media is present, force transparent on the table so it doesn't block the video/image
    // For video: the table sits ON TOP of the video.
    // For image: we usually want to allow tint, but user requested "disappear".
    // We'll set transparent for table if video is present.
    const effectiveBgColor = bgVideo ? 'transparent' : (bgImage ? 'transparent' : bgColor); // User requested bg color disappear if media present

    // Base table style
    let tableStyle = `${isNested ? 'margin-bottom:12px;' : ''}background-color:${effectiveBgColor};`;
    const checkPadding = isNested ? '5' : '10';

    // If Background Image (and no video), apply to table
    let tableAttrs = '';
    if (bgImage && !bgVideo) {
        tableStyle += `background-image:url('${bgImage}');background-size:${bgSize};background-position:${bgPos};background-repeat:no-repeat;`;
        tableAttrs += ` background="${bgImage}"`;
    }

    let html = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${tableStyle}"${tableAttrs}><tr>`;

    for (let i = 0; i < cols; i++) {
        const colContent = items[i] || [];
        const width = widths[i];

        let colHtml = '';
        if (Array.isArray(colContent)) {
            colHtml = colContent.map(item => renderColumnItem(item)).join('');
        } else {
            colHtml = '';
        }

        const cellStyle = `padding:${paddingY}px ${checkPadding}px;vertical-align:top;`;

        html += `<td width="${width}" valign="top" style="${cellStyle}">
            ${colHtml}
        </td>`;
    }

    html += '</tr></table>';

    // If Background Video, wrap table in a relative div with absolute video
    if (bgVideo) {
        const videoHtml = `
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;z-index:0;">
                <video autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;">
                    <source src="${bgVideo}" type="video/${bgVideo.split('.').pop()}">
                </video>
                ${bgImage ? `<img src="${bgImage}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;" alt="">` : ''}
            </div>
        `;

        // Wrap table in relative div
        // The container div gets the original background color as fallback (behind video)
        return `
            <div style="position:relative;width:100%;overflow:hidden;background-color:${bgColor};">
                ${videoHtml}
                <div style="position:relative;z-index:1;">
                    ${html}
                </div>
            </div>
        `;
    }

    return html;
}

function renderColumns(data) {
    return wrapRow(renderGrid(data));
}

function renderLinkPreview(data, block) {
    const title = sanitize(data.meta?.title || data.link || 'Link');
    const description = sanitize(data.meta?.description || '');
    const href = data.link || '#';
    const imageUrl = data.meta?.image?.url;

    // Default styles if not present
    const s = data.style || {
        display: 'row',
        backgroundColor: '#ffffff',
        borderColor: '#e1e3e6',
        borderRadius: '6',
        borderWidth: '1',
        padding: '0',
        titleColor: '#111827',
        titleFontSize: '16',
        descColor: '#6b7280',
        descFontSize: '14',
        descFontSize: '14',
        imageRadius: '6',
        imageSize: '80',
        descFontSize: '14',
        imageRadius: '6',
        imageSize: '80',
        imageFit: 'cover',
        fontFamily: ''
    };

    const isColumn = s.display === 'column' || s.display === 'column-reverse';
    const isReverse = s.display === 'row-reverse' || s.display === 'column-reverse';

    // Container Table Styles
    // We put padding on the items or use a wrapper table. 
    // To ensure padding works reliably inside the border/background, we use a single cell table for container,
    // and put the content inside with padding.
    const containerStyle = `border:${s.borderWidth}px solid ${s.borderColor};border-radius:${s.borderRadius}px;background-color:${s.backgroundColor};overflow:hidden;width:100%;`;

    // Inner padding style
    const paddingStyle = `padding:${s.padding}px;`;

    let contentHtml = '';
    const imgSize = s.imageSize || (isColumn ? '100%' : '80');
    // Ensure imgSize has unit if needed, but here we assume number string means px or % logic handled below.
    // Actually s.imageSize comes as string "80".

    // Image Component
    let imgComponent = '';
    if (imageUrl) {
        // Use user defined fit or default to 'cover'
        const objFit = s.imageFit || 'cover';

        if (isColumn) {
            // Full width image
            const heightStyle = s.imageSize ? `height:${s.imageSize}px` : 'height:auto;aspect-ratio:16/9';
            imgComponent = `
                <tr>
                    <td style="width:100%;padding:0 0 12px 0;">
                         <img src="${convertSvgToPng(imageUrl)}" alt="" style="display:block;width:100%;${heightStyle};object-fit:${objFit};border-radius:${s.imageRadius}px;border:0;">
                    </td>
                </tr>
            `;
        } else {
            // Row image
            const sizeVal = imgSize; // e.g. "80"
            imgComponent = `<td style="width:${sizeVal}px;padding:0 12px 0 0;"><img src="${convertSvgToPng(imageUrl)}" alt="" style="display:block;width:${sizeVal}px;height:${sizeVal}px;object-fit:${objFit};border-radius:${s.imageRadius}px;border:0;"></td>`;

            // If reverse, padding should be on left
            if (isReverse) {
                imgComponent = `<td style="width:${sizeVal}px;padding:0 0 0 12px;"><img src="${convertSvgToPng(imageUrl)}" alt="" style="display:block;width:${sizeVal}px;height:${sizeVal}px;object-fit:${objFit};border-radius:${s.imageRadius}px;border:0;"></td>`;
            }
        }
    }

    if (isColumn) {
        // Vertical Layout (Column)
        // Image Row and Content Row
        // Image component handles its own TR.

        // Content Row
        const contentRow = `
            <tr>
                <td style="${applyAlignmentStyle(`${TD_BASE} width:100%;`, block)}">
                  <a href="${href}" style="text-decoration:none;display:block;">
                    <span style="display:block;margin:0 0 4px 0;font-family:${s.fontFamily ? s.fontFamily.replace(/"/g, "'") : 'Arial'};font-size:${s.titleFontSize}px;font-weight:bold;color:${s.titleColor};line-height:1.4;">${title}</span>
                    ${description ? `<span style="display:block;margin:0;font-family:${s.fontFamily ? s.fontFamily.replace(/"/g, "'") : 'Arial'};font-size:${s.descFontSize}px;color:${s.descColor};line-height:1.4;">${description}</span>` : ''}
                  </a>
                </td>
            </tr>
        `;

        const innerTable = isReverse
            ? contentRow + imgComponent
            : imgComponent + contentRow;

        contentHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${innerTable}</table>`;

    } else {
        // Horizontal Layout (Row)
        const contentCell = `<td style="${applyAlignmentStyle(`${TD_BASE} vertical-align:middle;`, block)}">
          <a href="${href}" style="text-decoration:none;display:block;">
            <span style="display:block;margin:0 0 4px 0;font-family:${s.fontFamily ? s.fontFamily.replace(/"/g, "'") : 'Arial'};font-size:${s.titleFontSize}px;font-weight:bold;color:${s.titleColor};line-height:1.4;">${title}</span>
            ${description ? `<span style="display:block;margin:0;font-family:${s.fontFamily ? s.fontFamily.replace(/"/g, "'") : 'Arial'};font-size:${s.descFontSize}px;color:${s.descColor};line-height:1.4;">${description}</span>` : ''}
          </a>
        </td>`;

        const innerRow = isReverse
            ? contentCell + imgComponent
            : imgComponent + contentCell;

        contentHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${innerRow}</tr></table>`;
    }

    // Wrap in container table with padding
    return `<table role="presentation" width="100%" style="${containerStyle}" cellpadding="0" cellspacing="0">
        <tr>
            <td style="${paddingStyle}">
                ${contentHtml}
            </td>
        </tr>
    </table>`;
}


function getTypography(block) {
    return block?.tunes?.typographyTune || {};
}



const blockRenderers = {
    paragraph: block => wrapRow(`<table role="presentation" width="100%"><tr><td style="${applyTypographyStyle(applyAlignmentStyle(`${TD_BASE} padding:16px 24px;line-height:1.6;`, block), block)}">${sanitize(block.data.text)}</td></tr></table>`),
    header: block => wrapRow(`<table role="presentation" width="100%"><tr><td style="${applyTypographyStyle(applyAlignmentStyle(`${TD_BASE} padding:20px 24px;font-weight:bold;font-size:${headerSize(block.data.level)};line-height:1.3;`, block), block)}">${sanitize(block.data.text)}</td></tr></table>`),
    list: block => wrapRow(`<table role="presentation" width="100%"><tr><td style="${applyTypographyStyle(applyAlignmentStyle(`${TD_BASE} padding:16px 36px;`, block), block)}">${renderList(block.data)}</td></tr></table>`),
    checklist: block => {
        const items = block.data.items || [];
        const checklistHtml = items.map(item => {
            const checked = item.checked;
            const text = sanitize(item.text);
            const icon = checked
                ? `<span style="display:inline-block;width:16px;height:16px;background:#2563eb;border:2px solid #2563eb;border-radius:4px;color:white;text-align:center;line-height:14px;font-size:12px;">✓</span>`
                : `<span style="display:inline-block;width:16px;height:16px;background:white;border:2px solid #d1d5db;border-radius:4px;"></span>`;

            return `<div style="margin-bottom:8px;display:flex;align-items:start;">
           <div style="flex-shrink:0;margin-right:12px;padding-top:2px;">${icon}</div>
           <div style="flex-grow:1;line-height:1.6;">${text}</div>
        </div>`;
        }).join('');
        return wrapRow(`<table role="presentation" width="100%"><tr><td style="${applyTypographyStyle(applyAlignmentStyle(`${TD_BASE} padding:16px 24px;`, block), block)}">${checklistHtml}</td></tr></table>`);
    },
    imageUrl: block => {
        const data = block.data;
        const width = data.width || '100';
        const borderRadius = data.borderRadius || '0';
        const border = data.border || 'none';
        const shadow = data.shadow || 'none';
        const alignment = data.alignment || 'center';
        const alt = sanitize(data.alt || '');
        return wrapRow(`<table role="presentation" width="100%"><tr><td align="${alignment}" style="${TD_BASE} padding:16px 24px;"><img src="${convertSvgToPng(data.url)}" alt="${alt}" style="display:block;width:${width}%;max-width:100%;height:auto;border:${border};border-radius:${borderRadius}px;box-shadow:${shadow};"></td></tr></table>`);
    },
    video: block => {
        const data = block.data;
        const width = data.width || '100';
        const borderRadius = data.borderRadius || '0';
        const border = data.border || 'none';
        const shadow = data.shadow || 'none';
        const alignment = data.alignment || 'center';
        const alt = sanitize(data.alt || 'Video');

        const content = renderVideoHtml(data);
        return wrapRow(`<table role="presentation" width="100%"><tr><td align="${alignment}" style="${TD_BASE} padding:16px 24px;">${content}</td></tr></table>`);
    },
    button: block => {
        const data = block.data;
        const align = data.alignment || getAlignment(block) || 'center';
        const paddingY = data.paddingY || '12';
        const paddingX = data.paddingX || '24';
        const borderRadius = data.borderRadius || '4';
        const fontSize = data.fontSize || '15';
        const fontWeight = data.fontWeight || 'bold';
        const fullWidth = data.fullWidth ? 'display:block;width:100%;box-sizing:border-box;' : 'display:inline-block;';
        return wrapRow(`<table role="presentation" width="100%"><tr><td align="${align}" style="${TD_BASE} padding:24px;"><a href="${data.url}" style="${fullWidth}padding:${paddingY}px ${paddingX}px;border-radius:${borderRadius}px;text-decoration:none;font-weight:${fontWeight};font-size:${fontSize}px;font-family:Arial,sans-serif;background:${data.bgColor};color:${data.textColor};text-align:center;">${sanitize(data.label)}</a></td></tr></table>`);
    },
    divider: () => wrapRow(`<table role="presentation" width="100%"><tr><td style="${TD_BASE} padding:24px 24px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr></table>`),
    spacer: block => wrapRow(`<table role="presentation" width="100%"><tr><td style="${TD_BASE} padding:0;"><div style="height:${block.data.height}px;"></div></td></tr></table>`),
    row: block => wrapRow(renderColumns(block.data || {})),
    columns: block => wrapRow(renderColumns(block.data || {})),
    linkTool: block => wrapRow(`<table role="presentation" width="100%"><tr><td style="${TD_BASE} padding:16px 24px;">${renderLinkPreview(block.data || {}, block)}</td></tr></table>`),
};


