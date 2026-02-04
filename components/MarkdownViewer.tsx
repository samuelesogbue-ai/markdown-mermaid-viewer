'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import MermaidDiagram from './MermaidDiagram';
import { Components } from 'react-markdown';

interface MarkdownViewerProps {
    content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
    const components: Components = {
        // Custom code block renderer to detect mermaid diagrams
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code(props: any) {
            const { inline, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');

            // If it's a mermaid code block, render with MermaidDiagram component
            if (!inline && language === 'mermaid') {
                return (
                    <div className="my-10 border border-black p-4 bg-white">
                        <MermaidDiagram chart={codeContent} />
                    </div>
                );
            }

            // Regular code block
            return (
                <code
                    className={`${className || ''} ${inline
                        ? 'px-1.5 py-0.5 bg-gray-100 text-black border border-gray-200 rounded-sm text-[13px] font-mono'
                        : 'block p-6 bg-black text-white border border-black overflow-x-auto font-mono text-[15px] leading-relaxed my-8'
                        }`}
                    {...rest}
                >
                    {children}
                </code>
            );
        },
        // Custom table styling
        table({ children }) {
            return (
                <div className="my-10 overflow-x-auto border border-black">
                    <table className="min-w-full border-collapse text-[14px] tracking-tight">
                        {children}
                    </table>
                </div>
            );
        },
        thead({ children }) {
            return <thead className="bg-black text-white">{children}</thead>;
        },
        th({ children }) {
            return (
                <th className="px-6 py-4 text-left font-semibold border-r border-white/20 last:border-r-0">
                    {children}
                </th>
            );
        },
        td({ children }) {
            return (
                <td className="px-6 py-4 border-b border-black text-black border-r border-black last:border-r-0">
                    {children}
                </td>
            );
        },
        tr({ children }) {
            return <tr className="hover:bg-gray-50 transition-colors group">{children}</tr>;
        },
        // Custom heading styling
        h1({ children }) {
            return (
                <div className="mt-16 mb-8 group">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-6 w-1.5 bg-black" />
                        <h1 className="text-4xl font-bold tracking-tighter text-black leading-none">
                            {children}
                        </h1>
                    </div>
                    <div className="h-px w-full bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </div>
            );
        },
        h2({ children }) {
            return (
                <div className="mt-12 mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-black flex items-center gap-3">
                        {children}
                    </h2>
                    <div className="h-px w-full bg-gray-100 mt-2" />
                </div>
            );
        },
        h3({ children }) {
            return (
                <h3 className="text-lg font-semibold tracking-widest mt-10 mb-4 text-black flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rotate-45" />
                    {children}
                </h3>
            );
        },
        h4({ children }) {
            return (
                <h4 className="text-sm font-semibold tracking-[0.2em] mt-8 mb-2 text-black/60">
                    {children}
                </h4>
            );
        },
        // Custom list styling
        ul({ children }) {
            return <ul className="my-8 space-y-3 ml-4 text-black">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="list-decimal list-outside my-8 space-y-3 ml-8 text-black font-bold text-sm tracking-tight">{children}</ol>;
        },
        li({ children }) {
            return (
                <li className="flex gap-4 group">
                    <div className="mt-2 w-1.5 h-1.5 border border-black flex-shrink-0 transition-all group-hover:bg-black" />
                    <div className="text-[16px] leading-relaxed tracking-tight">{children}</div>
                </li>
            );
        },
        // Paragraph styling
        p({ children }) {
            return <p className="my-6 text-[17px] text-black leading-relaxed tracking-tight max-w-[65ch]">{children}</p>;
        },
        // Blockquote styling
        blockquote({ children }) {
            return (
                <blockquote className="border-l-[12px] border-black pl-8 my-10 py-2 bg-gray-50/50">
                    <div className="text-xl font-semibold tracking-tighter italic text-black leading-tight">
                        {children}
                    </div>
                </blockquote>
            );
        },
        // Strong/bold styling
        strong({ children }) {
            return <strong className="font-bold text-black">{children}</strong>;
        },
        // Emphasis/italic styling
        em({ children }) {
            return <em className="italic text-black border-b border-black">{children}</em>;
        },
        // Horizontal rule
        hr() {
            return (
                <div className="my-16 flex items-center gap-4">
                    <div className="h-px flex-1 bg-black" />
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-black rounded-full" />
                        ))}
                    </div>
                    <div className="h-px flex-1 bg-black" />
                </div>
            );
        },
    };

    return (
        <div id="markdown-preview-content" className="max-w-none antialiased">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
