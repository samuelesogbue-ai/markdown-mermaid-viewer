import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { X, Maximize2, ZoomIn } from 'lucide-react';

interface MermaidDiagramProps {
    chart: string;
}

let mermaidInitialized = false;

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Ensure ID starts with a letter to be a valid HTML ID/selector
    const [id] = useState(() => `m${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!mermaidInitialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    primaryColor: '#ffffff',
                    primaryTextColor: '#000000',
                    primaryBorderColor: '#000000',
                    lineColor: '#000000',
                    secondaryColor: '#ffffff',
                    tertiaryColor: '#ffffff',
                    nodeBorder: '#000000',
                    mainBkg: '#ffffff',
                },
                securityLevel: 'loose',
            });
            mermaidInitialized = true;
        }
    }, []);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current || !chart) return;

            try {
                setError(null);
                ref.current.innerHTML = '';

                const { svg } = await mermaid.render(id, chart);
                ref.current.innerHTML = svg;
                setSvgContent(svg);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
            }
        };

        const timeout = setTimeout(() => {
            renderDiagram();
        }, 0);

        return () => clearTimeout(timeout);
    }, [chart, id]);

    if (error) {
        return (
            <div className="my-8 p-6 border border-black bg-white text-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-black" />
                    <p className="font-bold uppercase tracking-widest text-black">Diagram_Render_Failure</p>
                </div>
                <pre className="text-gray-500 text-xs mt-1 whitespace-pre-wrap font-mono uppercase leading-tight bg-gray-50 p-4">{error}</pre>
            </div>
        );
    }

    return (
        <>
            <div className="group relative">
                <div
                    ref={ref}
                    className="mermaid-diagram my-10 flex justify-center overflow-x-auto cursor-pointer border border-black p-8 bg-white transition-all hover:bg-gray-50 active:scale-[0.995]"
                    suppressHydrationWarning
                    onClick={() => setIsFullscreen(true)}
                />
                <div
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black"
                >
                    Expand
                    <Maximize2 className="w-3 h-3" />
                </div>
            </div>

            {isFullscreen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center overflow-auto p-4 lg:p-12 animate-in fade-in zoom-in-95 duration-300"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div
                        className="flex flex-col w-full max-w-[1400px] min-h-0 bg-white border border-black shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 h-16 border-b border-black shrink-0 bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-1 border border-black">
                                    <ZoomIn className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Diagram_Inspection_Module</span>
                            </div>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white px-4 py-2 transition-all active:scale-95 border border-black"
                            >
                                <X className="w-4 h-4" />
                                Close
                            </button>
                        </div>

                        {/* Modal Content - Fixed scroll alignment and size */}
                        <div className="flex-1 overflow-auto bg-[#fafafa] flex flex-col items-center">
                            <div className="p-16 lg:p-32 w-full flex justify-center min-h-full items-start">
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    className="w-fit max-w-[none] [&>svg]:w-auto [&>svg]:h-auto [&>svg]:min-w-[800px] [&>svg]:max-w-[2000px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
