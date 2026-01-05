/**
 * CyberGongZH 核心解析引擎
 * 职责: 将 Markdown 语法转换为带有公众号内联样式的 HTML
 */

export interface CyberTheme {
    name: string;
    primary: string;
    secondary: string;
    bg: string;
    h1Style: string;
    h2Style: string;
}

export const CYBER_THEMES: Record<string, CyberTheme> = {
    'neon-blue': {
        name: '霓虹蓝',
        primary: '#38bdf8',
        secondary: '#818cf8',
        bg: '#020617',
        h1Style: 'border-left: 4px solid #38bdf8; padding: 10px 15px; background: rgba(56, 189, 248, 0.05); color: #38bdf8; font-size: 20px; font-weight: bold; margin: 20px 0; border-radius: 0 4px 4px 0;',
        h2Style: 'display: inline-block; border-bottom: 2px dashed #38bdf8; color: #38bdf8; font-size: 18px; font-weight: 600; margin: 15px 0 10px 0; padding-bottom: 4px;'
    },
    'matrix-green': {
        name: '矩阵绿',
        primary: '#10b981',
        secondary: '#34d399',
        bg: '#064e3b',
        h1Style: 'background: #10b981; color: #ffffff; padding: 8px 16px; font-size: 20px; font-weight: 800; border-radius: 4px; margin: 20px 0; box-shadow: 3px 3px 0px #064e3b;',
        h2Style: 'color: #10b981; font-size: 18px; font-weight: bold; margin: 15px 0; display: flex; align-items: center;'
    },
    'volcano-red': {
        name: '火山红',
        primary: '#ef4444',
        secondary: '#f97316',
        bg: '#450a0a',
        h1Style: 'border: 2px solid #ef4444; padding: 8px 15px; background: #ef444411; color: #ef4444; font-size: 20px; font-weight: 900; margin: 20px 0; text-align: center; border-radius: 8px;',
        h2Style: 'color: #ef4444; font-size: 18px; font-weight: bold; border-bottom: 3px double #ef4444; padding-bottom: 2px; margin: 15px 0;'
    },
    'star-purple': {
        name: '星空紫',
        primary: '#a855f7',
        secondary: '#6366f1',
        bg: '#2e1065',
        h1Style: 'background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; padding: 10px 20px; font-size: 20px; font-weight: bold; border-radius: 20px 0 20px 0; margin: 20px 0;',
        h2Style: 'color: #a855f7; font-size: 18px; font-weight: 600; padding: 4px 12px; background: #a855f711; border-radius: 6px; margin: 15px 0;'
    },
    'void-glitch': {
        name: '幽虚影',
        primary: '#06b6d4',
        secondary: '#ef4444',
        bg: '#000000',
        h1Style: 'background: #06b6d4; color: #fff; padding: 10px 20px; font-size: 20px; font-weight: 900; margin: 20px 0; transform: skew(-5deg); box-shadow: 4px 0 0 #ef4444, -4px 0 0 #06b6d4;',
        h2Style: 'color: #06b6d4; font-size: 18px; font-weight: bold; border-left: 2px solid #ef4444; padding-left: 10px; margin: 15px 0;'
    }
};

/**
 * 将 Markdown 文本解析为带内联样式的 HTML 字符串
 * @param text 原始 Markdown 文本
 * @param themeId 选择的主题 ID
 * @param customColors 可选的自定义主色和辅色
 */
export function parseToCyberHtml(
    text: string,
    themeId: string = 'neon-blue',
    customColors?: { primary?: string; secondary?: string }
): string {
    const baseTheme = CYBER_THEMES[themeId] || CYBER_THEMES['neon-blue'];

    // 融合自定义颜色
    const theme = {
        ...baseTheme,
        primary: customColors?.primary || baseTheme.primary,
        secondary: customColors?.secondary || baseTheme.secondary,
    };

    // 动态更新样式字符串中的颜色（如果用户自定义了）
    const finalH1 = theme.h1Style.replace(/#[0-9a-fA-F]{6}/g, (match) => {
        if (match.toLowerCase() === baseTheme.primary.toLowerCase()) return theme.primary;
        if (match.toLowerCase() === baseTheme.secondary.toLowerCase()) return theme.secondary;
        return match;
    });

    const finalH2 = theme.h2Style.replace(/#[0-9a-fA-F]{6}/g, (match) => {
        if (match.toLowerCase() === baseTheme.primary.toLowerCase()) return theme.primary;
        if (match.toLowerCase() === baseTheme.secondary.toLowerCase()) return theme.secondary;
        return match;
    });

    const lines = text.split('\n');
    let htmlResult = '';
    let currentInList: 'ul' | 'ol' | null = null;
    let inTable = false;
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];

    const flushCodeBlock = () => {
        if (!inCodeBlock) return '';
        const codeContent = codeLines.join('\n');
        inCodeBlock = false;
        codeLines = [];
        return `<div style="margin: 20px 0; background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid ${theme.primary}55; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
            <div style="background: #334155; padding: 5px 15px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #94a3b8; font-size: 11px; font-family: monospace;">${codeLanguage || 'CODE'}</span>
                <div style="display: flex; gap: 4px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: #ff5f56;"></div><div style="width: 8px; height: 8px; border-radius: 50%; background: #ffbd2e;"></div><div style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f;"></div></div>
            </div>
            <pre style="margin: 0; padding: 15px; overflow-x: auto; color: #e2e8f0; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.5;"><code>${codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>`;
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();

        // 1. 处理代码块
        if (trimmed.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLanguage = trimmed.slice(3).trim();
                continue;
            } else {
                htmlResult += flushCodeBlock();
                continue;
            }
        }
        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        // 2. 处理表格
        if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('|--')) {
            inTable = true;
            htmlResult += `<div style="overflow-x: auto; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 14px; min-width: 400px;">`;

            // 获取对齐方式
            const alignLine = lines[i + 1].split('|').filter(s => s.trim());
            const alignments = alignLine.map(s => {
                if (s.includes(':---:')) return 'center';
                if (s.includes('---:')) return 'right';
                return 'left';
            });

            // 表头
            const headers = line.split('|').filter(s => s.trim()).map(s => s.trim());
            htmlResult += `<tr style="background: #f8fafc;">${headers.map((h, idx) => `<th style="border: 1px solid #e2e8f0; padding: 12px 10px; text-align: ${alignments[idx] || 'left'}; font-weight: bold; color: ${theme.primary};">${h}</th>`).join('')}</tr>`;

            i++; // 跳过分隔行
            continue;
        }
        if (inTable) {
            if (trimmed.startsWith('|')) {
                const cells = line.split('|').filter(s => s.trim()).map(s => s.trim());
                htmlResult += `<tr>${cells.map(c => `<td style="border: 1px solid #e2e8f0; padding: 10px; color: #334155;">${c}</td>`).join('')}</tr>`;

                if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
                    htmlResult += `</table></div>`;
                    inTable = false;
                }
                continue;
            } else {
                htmlResult += `</table></div>`;
                inTable = false;
            }
        }

        // 3. 处理基础 MarkDown 元素
        let processedLine = line;

        // 图片
        processedLine = processedLine.replace(/!\[(.*?)\]\((.*?)\)/g,
            `<div style="text-align: center; margin: 25px 0;"><img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; border: 2px solid ${theme.primary}; box-shadow: 0 10px 25px ${theme.primary}33;" /><div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">$1</div></div>`);

        // 链接
        processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g,
            `<span style="color: ${theme.primary}; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; font-weight: 500;">$1</span>`);

        // 加粗 & 斜体 & 删除线
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${theme.primary}; text-shadow: 0 0 5px ${theme.primary}22;">$1</strong>`);
        processedLine = processedLine.replace(/\*(.*?)\*/g, `<em style="color: ${theme.primary}ee; font-style: italic;">$1</em>`);
        processedLine = processedLine.replace(/~~(.*?)~~/g, `<del style="color: #94a3b8;">$1</del>`);

        // 行内代码
        processedLine = processedLine.replace(/`(.*?)`/g, `<code style="background: ${theme.primary}11; color: ${theme.primary}; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.9em; border: 1px solid ${theme.primary}22;">$1</code>`);

        // 标题
        if (trimmed.startsWith('# ')) {
            htmlResult += `<div class="CyberHeader" style="${finalH1}">${trimmed.substring(2).trim()}</div>`;
            continue;
        }
        if (trimmed.startsWith('## ')) {
            htmlResult += `<div class="CyberSubHeader" style="${finalH2}">${trimmed.substring(3).trim()}</div>`;
            continue;
        }

        // 引用块（带提示语检测）
        if (trimmed.startsWith('> ')) {
            const content = trimmed.substring(2).trim();
            const isTip = content.startsWith('💡') || content.startsWith('🚀') || content.startsWith('📢');
            htmlResult += `<div class="CyberQuote" style="border-left: 4px solid ${theme.primary}; padding: 15px 20px; background: ${isTip ? theme.primary + '08' : '#f8fafc'}; color: #475569; border-radius: 4px; margin: 20px 0; line-height: 1.7; font-size: 15px;">${content}</div>`;
            continue;
        }

        // 水平线
        if (trimmed === '---' || trimmed === '***') {
            htmlResult += `<div style="height: 2px; background: linear-gradient(to right, transparent, ${theme.primary}66, transparent); margin: 35px 0;"></div>`;
            continue;
        }

        // 4. 处理列表
        // 任务列表
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
            const checked = trimmed.startsWith('- [x] ');
            const content = processedLine.trim().substring(6).trim();
            htmlResult += `<div style="display: flex; align-items: center; gap: 12px; margin: 10px 0; font-size: 15px; color: #334155;">
                <div style="width: 18px; height: 18px; border: 2px solid ${theme.primary}; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: ${checked ? theme.primary : 'transparent'}; transition: all 0.2s;">
                    ${checked ? '<span style="color: white; font-size: 11px; font-weight: bold;">✓</span>' : ''}
                </div>
                <span style="${checked ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${content}</span>
            </div>`;
            continue;
        }

        // 无序列表
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const indent = line.search(/\S/);
            const content = processedLine.trim().substring(2).trim();
            htmlResult += `<div style="display: flex; align-items: flex-start; margin: 8px 0; margin-left: ${indent * 12}px; color: #333; font-size: 15px;">
                <span style="color: ${theme.primary}; margin-right: 10px; font-size: 10px; margin-top: 4px;">●</span>
                <span style="line-height: 1.6;">${content}</span>
            </div>`;
            continue;
        }

        // 有序列表
        const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (olMatch) {
            const indent = line.search(/\S/);
            htmlResult += `<div style="display: flex; align-items: flex-start; margin: 8px 0; margin-left: ${indent * 12}px; color: #333; font-size: 15px;">
                <span style="color: ${theme.primary}; margin-right: 10px; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 14px;">${olMatch[1]}.</span>
                <span style="line-height: 1.6;">${olMatch[2]}</span>
            </div>`;
            continue;
        }

        // 普通段落
        if (trimmed === '') {
            htmlResult += '<div style="height: 8px;"></div>';
        } else {
            htmlResult += `<p class="CyberBody" style="margin: 14px 0; line-height: 1.85; color: #333333; font-size: 16px; text-align: justify; letter-spacing: 0.3px;">${processedLine}</p>`;
        }
    }

    // 确保未闭合的代码块也能导出
    if (inCodeBlock) htmlResult += flushCodeBlock();

    return `<div class="CyberContainer" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 15px; color: #333;">${htmlResult}</div>`;
}
