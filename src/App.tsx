import React, { useState, useEffect, useRef } from 'react';
import { parseToCyberHtml, CYBER_THEMES } from './utils/cyber-parser';
import copy from 'copy-to-clipboard';
import { Terminal, Zap, Copy, Layers, Bold, Italic, Strikethrough, Minus, Heading, Link, Quote, Code, MessageSquare, Image as ImageIcon, Table, List, ListOrdered, CheckSquare, Smartphone, Monitor, Trash2, Smile, Undo2, Redo2 } from 'lucide-react';

const App: React.FC = () => {
  // 默认配色改为星空紫
  const [themeId, setThemeId] = useState('star-purple');
  const [primaryColor, setPrimaryColor] = useState(CYBER_THEMES['star-purple'].primary);
  const [secondaryColor, setSecondaryColor] = useState(CYBER_THEMES['star-purple'].secondary);

  const [input, setInput] = useState(`# 赛博排版大师 @boboshixiong

这是一个强大的**赛博风格转换工具**，专为公众号开发者打造，让你的文字瞬间充满未来感。

## 🚀 核心功能

| 功能 | 描述 | 状态 |
|:--|:--|:--:|
| 一键转换 | Markdown 自动转 Inline CSS HTML | ✓ |
| 手机预览 | 实时模拟 iPhone 17 Ultra 展示效果 | ✓ |
| 赛博主题 | 霓虹蓝、矩阵绿等多种科技感风格 | ✓ |
| 完整语法 | 支持表格、任务列表、代码块高亮 | ✓ |

## 📝 使用方法

1. 在左侧输入或粘贴你的 Markdown 文本
2. 在顶部点击彩色的主题按钮切换配色
3. 中间可切换“手机”或“电脑”预览效果
4. 点击“一键转到公众号”，系统将自动为你打开微信后台

## 🎨 支持的样式展示

### 文本格式化
- **重点内容**使用粗体
- *特殊强调*使用斜体
- \`important_code\` 使用行内代码
- ~~旧版内容~~ 使用删除线

### 代码展示（极客范）

\`\`\`javascript
// 赛博风格代码高亮
function welcome() {
  console.log("Welcome to Cyber Editor!");
  return "@boboshixiong";
}
\`\`\`

### 引用示例

> 💡 小贴士：生成的 HTML 已经过 Inline CSS 优化，完美避开微信后台的样式拦截。

### 列表功能

#### 任务清单
- [x] 基础框架开发
- [x] 解析引擎升级 (Tables/Lists)
- [x] 手机模拟器外壳 (iPhone 17 Ultra)
- [ ] 更多动态氛围灯效

#### 多级无序列表
- 赛博视觉矩阵
  - 霓虹色彩系统
  - 像素化边框
- 响应式布局

## 🔍 更多信息

如有问题请联系本工具维护者 **[GitHub @AIboboshixiong]**。

---

> 📢 如果你觉得这个工具有帮助，欢迎点赞分享！

如果您碰到使用问题，或者还有其他 Markdown 编辑需求，请写邮件给 **boboshixiong@gmail.com**。
`);

  // 历史记录系统
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  const saveToHistory = (newText: string) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevText = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setInput(prevText);
      addLog('执行撤销操作');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextText = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setInput(nextText);
      addLog('执行重做操作');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  useEffect(() => {
    if (history.length === 0) {
      setHistory([input]);
      setHistoryIndex(0);
    }
  }, []);

  const [previewHtml, setPreviewHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'pc'>('mobile');
  const [phoneModel, setPhoneModel] = useState('iphone-17-ultra');
  const [showEmoji, setShowEmoji] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[系统] 引擎就绪... 准备发布中...']);
  const [editorWidth, setEditorWidth] = useState(50);

  const isResizing = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs([`[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const theme = CYBER_THEMES[themeId];
    if (theme) {
      setPrimaryColor(theme.primary);
      setSecondaryColor(theme.secondary);
    }
  }, [themeId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(parseToCyberHtml(input, themeId, { primary: primaryColor, secondary: secondaryColor }));
    }, 200);
    return () => clearTimeout(timer);
  }, [input, themeId, primaryColor, secondaryColor]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 15 && newWidth < 85) setEditorWidth(newWidth);
    };
    const handleMouseUp = () => { isResizing.current = false; document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  const handleCopyAndGo = () => {
    copy(previewHtml);
    setCopied(true);
    addLog('已同步至剪贴板，正在前往微信公众号...');
    setTimeout(() => {
      setCopied(false);
      window.open('https://mp.weixin.qq.com/', '_blank');
    }, 1000);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = input.substring(start, end);
    const replacement = before + selection + after;
    const finalVal = input.substring(0, start) + replacement + input.substring(end);
    setInput(finalVal);
    saveToHistory(finalVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selection.length);
    }, 0);
  };

  // 微信常用 Emoji - 增加一个 '🎵' 以填满网格
  const commonEmojis = [
    '😊', '😂', '🤣', '😅', '🤔', '🙄', '😍', '😭', '😱', '😰', '😡', '😴', '😎', '😜', '😇', '🥳', '🧐', '🤩', '🤡', '👍', '👎', '👏', '🙌', '🙏', '🤝', '➕', '➖',
    '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢',
    '🚀', '✨', '💡', '📢', '🔥', '🎨', '✅', '❌', '📝', '🔗', '📸', '💻', '📱', '🌟',
    '💎', '🎉', '🍎', '🌈', '🎁', '🎈', '❤️', '💔', '💯', '💢', '💤', '💨', '📍', '📌', '🏆', '⭐', '🎬', '📚', '🎵'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInput(newText);
    const timer = setTimeout(() => saveToHistory(newText), 500);
    return () => clearTimeout(timer);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fffef2', color: '#1e293b', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: primaryColor, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Zap size={22} fill="currentColor" />
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#1e293b' }}>赛博排版大师</h1>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginLeft: '4px', letterSpacing: '0.05em' }}>v3.1.0 RC</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Object.entries(CYBER_THEMES).map(([id, t]) => (
              <button
                key={id}
                onClick={() => setThemeId(id)}
                style={{
                  padding: '6px 16px', borderRadius: '20px',
                  border: `2px solid ${t.primary}`,
                  background: themeId === id ? t.primary : '#fff',
                  color: themeId === id ? '#fff' : t.primary,
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: themeId === id ? `0 4px 12px ${t.primary}44` : 'none'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyAndGo}
            style={{
              background: copied ? '#10b981' : primaryColor, color: '#fff', border: 'none', padding: '10px 22px',
              borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '8px', boxShadow: `0 8px 16px ${copied ? '#10b981' : primaryColor}33`,
            }}
          >
            <Zap size={16} /> {copied ? '已复制' : '一键转到公众号'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '0' }}>
        {/* Editor */}
        <section style={{ width: `${editorWidth}%`, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ height: '42px', padding: '0 12px', background: '#fcfcfc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ToolbarButton icon={<Bold size={16} />} onClick={() => insertText('**', '**')} toolTip="加粗" />
              <ToolbarButton icon={<Italic size={16} />} onClick={() => insertText('*', '*')} toolTip="斜体" />
              <ToolbarButton icon={<Heading size={16} />} onClick={() => insertText('# ', '')} toolTip="标题" />
              <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 6px' }} />
              <div style={{ position: 'relative' }} ref={emojiRef}>
                <ToolbarButton icon={<Smile size={16} />} onClick={() => setShowEmoji(!showEmoji)} toolTip="表情" />
                {showEmoji && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 101, background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '16px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)', width: '320px', maxHeight: '350px', overflowY: 'auto', overflowX: 'hidden'
                  }}>
                    {commonEmojis.map(e => (
                      <button key={e} onClick={() => { insertText(e, ''); setShowEmoji(false); }} style={{ width: '34px', height: '34px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <ToolbarButton icon={<Link size={16} />} onClick={() => insertText('[链接名](url)', '')} toolTip="链接" />
              <ToolbarButton icon={<Quote size={16} />} onClick={() => insertText('\n> ', '')} toolTip="引用" />
              <ToolbarButton icon={<Terminal size={16} />} onClick={() => insertText('\n```javascript\n', '\n```\n')} toolTip="代码块" />
              <ToolbarButton icon={<ImageIcon size={16} />} onClick={() => insertText('![描述](url)', '')} toolTip="图片" />
              <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 6px' }} />
              <ToolbarButton icon={<List size={16} />} onClick={() => insertText('\n- ', '')} toolTip="列表" />
              <ToolbarButton icon={<CheckSquare size={16} />} onClick={() => insertText('\n- [ ] ', '')} toolTip="任务" />
              <ToolbarButton icon={<Trash2 size={16} />} onClick={() => { setInput(''); saveToHistory(''); }} toolTip="清空" danger />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                <ToolbarButton icon={<Undo2 size={16} />} onClick={handleUndo} toolTip="撤销 (Ctrl+Z)" disabled={historyIndex <= 0} />
                <ToolbarButton icon={<Redo2 size={16} />} onClick={handleRedo} toolTip="重做 (Ctrl+Y)" disabled={historyIndex >= history.length - 1} />
              </div>
              <div style={{ background: `${primaryColor}15`, color: primaryColor, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                {input.length} 字符
              </div>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            style={{
              flex: 1, border: 'none', padding: '32px', fontSize: '15px', lineHeight: '1.8', resize: 'none', outline: 'none',
              background: '#fff', color: '#334155', fontFamily: "'Fira Code', 'JetBrains Mono', monospace"
            }}
          />
        </section>

        {/* Splitter */}
        <div onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }} style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'col-resize' }}>
          <div style={{ height: '60px', width: '4px', background: '#e2e8f0', borderRadius: '4px' }} />
        </div>

        {/* Preview */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ height: '42px', padding: '0 12px', background: '#fcfcfc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode(viewMode === 'mobile' ? 'pc' : 'mobile')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', color: '#444', fontWeight: 700, cursor: 'pointer' }}
              >
                {viewMode === 'mobile' ? <><Monitor size={14} /> 电脑预览</> : <><Smartphone size={14} /> 手机预览</>}
              </button>

              {viewMode === 'mobile' && (
                <select
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', outline: 'none', fontWeight: 700, color: '#444' }}
                >
                  <option value="iphone-17-ultra">iPhone 17 Ultra</option>
                  <option value="iphone-16-pro-max">iPhone 16 Pro Max</option>
                  <option value="iphone-16e">iPhone 16e (Notch)</option>
                </select>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>中心色彩</span>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '22px', height: '22px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>辅助色彩</span>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: '22px', height: '22px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden', background: '#f9f9f9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            {viewMode === 'mobile' ? (
              <PhoneShell model={phoneModel} html={previewHtml} />
            ) : (
              <div style={{ width: '95%', height: '90%', background: '#fff', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{ height: 'calc(100% - 40px)', overflowY: 'auto', padding: '60px' }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ height: '44px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', fontSize: '12px', color: '#64748b' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b98188' }} />
          <span style={{ fontWeight: 600 }}>{logs[0]}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span>如果您碰到问题，请写信给 <b style={{ color: '#1e293b' }}>boboshixiong@gmail.com</b></span>
          <a href="https://github.com/AIboboshixiong" target="_blank" rel="noreferrer" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 700 }}>Github @boboshixiong</a>
        </div>
      </footer>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; onClick: () => void; toolTip: string; danger?: boolean; disabled?: boolean }> = ({ icon, onClick, toolTip, danger, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    title={toolTip}
    style={{
      padding: '8px', background: 'none', border: 'none',
      color: disabled ? '#e2e8f0' : (danger ? '#ef4444' : '#64748b'),
      cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
    }}
    onMouseOver={(e) => !disabled && (e.currentTarget.style.background = '#f1f5f9')}
    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
  >
    {icon}
  </button>
);

const PhoneShell: React.FC<{ model: string; html: string }> = ({ model, html }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !containerRef.current.parentElement) return;
      const parent = containerRef.current.parentElement;
      const parentWidth = parent.clientWidth - 40;
      const parentHeight = parent.clientHeight - 40;
      const shellWidth = 420;
      const shellHeight = 880;

      const scaleX = parentWidth / shellWidth;
      const scaleY = parentHeight / shellHeight;
      const targetScale = Math.min(scaleX, scaleY);
      setScale(targetScale > 1.2 ? 1.2 : targetScale);
    };
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current.parentElement) observer.observe(containerRef.current.parentElement);
    updateScale();
    return () => observer.disconnect();
  }, []);

  let width = '420px';
  let height = '880px';
  let radius = '65px';
  let bezel = '4px';
  let island = true;
  let notch = false;

  if (model === 'iphone-16-pro-max') { width = '410px'; height = '862px'; radius = '55px'; bezel = '8px'; island = true; }
  else if (model === 'iphone-16e') { width = '375px'; height = '812px'; radius = '45px'; bezel = '10px'; island = false; notch = true; }

  return (
    <div ref={containerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.1s linear' }}>
      <div style={{
        width, height, background: '#000', borderRadius: radius, border: `${bezel} solid #1a1a1a`,
        padding: '10px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)', position: 'relative'
      }}>
        <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: `calc(${radius} - 10px)`, overflow: 'hidden', position: 'relative' }}>
          {island && (
            <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '32px', background: '#000', borderRadius: '16px', zIndex: 10 }} />
          )}
          {notch && (
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '24px', background: '#000', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px', zIndex: 10 }} />
          )}
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: '24px', paddingTop: '65px', paddingBottom: '120px' }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: '130px', height: '5px', background: '#000', borderRadius: '3px', opacity: 0.1 }} />
      </div>
    </div>
  );
};

export default App;
