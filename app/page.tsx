'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownViewer from '@/components/MarkdownViewer';
import { Download, Loader2, Maximize2, Minimize2, Upload, FileText, Plus, Zap, ArrowRight, CornerDownRight } from 'lucide-react';
import { generatePdf } from '@/utils/pdf-generator';

export default function Home() {
    const [markdown, setMarkdown] = useState('');
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditorActive, setIsEditorActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus textarea when editor becomes active
    useEffect(() => {
        if (isEditorActive && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditorActive]);

    const handleDownloadPdf = async () => {
        try {
            setIsGeneratingPdf(true);
            await generatePdf('markdown-preview-content', 'document.pdf');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.md')) {
                alert('Please upload a markdown (.md) file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setMarkdown(content);
                setActiveTab('preview');
                setIsEditorActive(true);
            };
            reader.readAsText(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.name.endsWith('.md')) {
                alert('Please drop a markdown (.md) file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setMarkdown(content);
                setActiveTab('preview');
                setIsEditorActive(true);
            };
            reader.readAsText(file);
        }
    };

    const handlePasteButtonClick = () => {
        setIsEditorActive(true);
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden text-black selection:bg-black selection:text-white">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".md"
                className="hidden"
            />

            {/* Left Pane - Editor (40%) */}
            <div
                className={`w-full lg:w-[40%] flex flex-col border-r border-black h-full ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'} ${isFullScreen ? 'lg:hidden' : ''} ${isDragging ? 'bg-gray-100' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex items-center justify-between px-6 h-16 border-b border-black bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Markdown_Input</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white px-3 py-1.5 border border-black transition-all active:scale-95"
                        >
                            <Upload className="w-3 h-3" />
                            Upload
                        </button>
                        <button
                            onClick={() => {
                                setMarkdown('');
                                setIsEditorActive(false);
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 flex flex-col min-h-0">
                    {!isEditorActive && !markdown ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white z-20">
                            <div className="w-full max-w-[320px]">
                                <div className="mb-12">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-sm font-bold text-black">01</span>
                                        <h3 className="text-xl font-bold tracking-tighter uppercase leading-none">Core_Engine</h3>
                                    </div>
                                    <div className="h-px w-full bg-black mb-4" />
                                    <p className="text-[14px] text-gray-500 leading-relaxed tracking-tight">
                                        System initialized. Awaiting markdown stream. Please select an operational mode below.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group flex items-center justify-between w-full p-4 border border-black hover:bg-black hover:text-white transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Upload className="w-5 h-5" />
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mode_A</div>
                                                <div className="text-sm font-bold uppercase">Upload_File</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <button
                                        onClick={handlePasteButtonClick}
                                        className="group flex items-center justify-between w-full p-4 border border-black hover:bg-black hover:text-white transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Plus className="w-5 h-5" />
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mode_B</div>
                                                <div className="text-sm font-bold uppercase">Manual_Entry</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>

                                <div className="mt-12 flex items-center gap-2 text-gray-300">
                                    <CornerDownRight className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Drag_Drop_Protocol_V1.0</span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {isDragging && (
                        <div className="absolute inset-0 bg-black text-white flex flex-col items-center justify-center z-30 pointer-events-none transition-all">
                            <Upload className="w-12 h-12 mb-4 animate-pulse" />
                            <p className="text-xs font-bold uppercase tracking-[0.4em]">Release_To_Parse</p>
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={markdown}
                        onChange={(e) => {
                            setMarkdown(e.target.value);
                            if (!isEditorActive) setIsEditorActive(true);
                        }}
                        onFocus={() => setIsEditorActive(true)}
                        placeholder="[AWAITING_CONTENT_PIPE]..."
                        className="flex-1 w-full p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-black placeholder-gray-200 bg-white"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Right Pane - Preview (60%) */}
            <div className={`w-full ${isFullScreen ? 'w-full' : 'lg:w-[60%]'} h-full bg-white flex flex-col ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
                {/* Mobile Tab Switcher */}
                <div className="lg:hidden flex border-b border-black">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-black text-white' : 'text-black'}`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-black text-white' : 'text-black'}`}
                    >
                        Preview
                    </button>
                </div>

                {/* Desktop Header for Preview */}
                <div className="hidden lg:flex items-center justify-between px-6 h-16 border-b border-black bg-white">
                    <div className="flex items-center gap-3 text-black">
                        <Zap className="w-4 h-4 fill-black" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            {isFullScreen ? 'Focus_Module_Active' : 'Live_Output_Stream'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="p-2 border border-black hover:bg-black hover:text-white transition-all active:scale-95"
                            title={isFullScreen ? "Exit Focus" : "Enter Focus"}
                        >
                            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf || !markdown}
                            className={`flex items-center gap-2 px-4 py-2 border border-black text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isGeneratingPdf || !markdown
                                ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            {isGeneratingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            Sync_Pdf
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto min-h-full flex flex-col">
                        {markdown ? (
                            <div className="p-12 lg:p-20 pb-32">
                                <MarkdownViewer content={markdown} />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/20">
                                <div className="text-center space-y-4 opacity-10 grayscale select-none pointer-events-none">
                                    <div className="w-24 h-24 border-2 border-dashed border-black mx-auto flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                        <div className="w-12 h-12 bg-black" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.5em]">Output_Idle</h3>
                                    <div className="flex justify-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`h-1 w-4 bg-black animate-pulse`} style={{ animationDelay: `${i * 100}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
