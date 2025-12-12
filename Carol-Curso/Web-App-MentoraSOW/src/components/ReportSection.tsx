"use client"

import { useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { FileText, RefreshCw, ArrowRight, Download, Loader2 } from "lucide-react"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"

interface ReportSectionProps {
    report: string
    onNextStage?: () => void
    onRetry?: () => void
}

export function ReportSection({ report, onNextStage, onRetry }: ReportSectionProps) {
    const reportRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        if (!reportRef.current) return

        try {
            setIsDownloading(true)

            // Aguarda um pouco para garantir que tudo esteja renderizado
            await new Promise(resolve => setTimeout(resolve, 100))

            const dataUrl = await toPng(reportRef.current, {
                cacheBust: true,
                backgroundColor: "#ffffff",
            })
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            })

            const imgWidth = 210 // A4 width in mm
            const pageHeight = 297 // A4 height in mm
            const imgProperties = pdf.getImageProperties(dataUrl)
            const imgHeight = (imgProperties.height * imgWidth) / imgProperties.width
            let heightLeft = imgHeight
            let position = 0

            // Primeira página
            pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            // Páginas subsequentes (se o relatório for longo)
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save("Relatorio-Mentoria-SOW.pdf")
        } catch (error: any) {
            console.error("Erro ao gerar PDF:", error)
            alert(`Erro ao gerar o PDF: ${error.message || error}`)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Wrapper para captura do PDF */}
            <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden text-gray-900">

                {/* Header do Relatório */}
                <div className="bg-white border-b border-purple-100 p-8 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Seu Relatório Personalizado</h2>
                            <p className="text-gray-500 text-sm">Gerado pela Mentora SOW AI</p>
                        </div>
                    </div>

                    {/* Botões - Ignorados pelo html2canvas via data-html2canvas-ignore */}
                    <div className="flex gap-2" data-html2canvas-ignore="true">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                title="Refazer Relatório"
                                className="text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                                disabled={isDownloading}
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            title="Baixar PDF"
                            className="text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            ) : (
                                <Download className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Conteúdo do Relatório */}
                <div className="p-8 md:p-12 min-h-[500px]">
                    <div className="prose prose-lg max-w-none prose-headings:font-sans prose-p:font-serif prose-p:text-gray-600">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => (
                                    <div className="text-center mb-12">
                                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-4" {...props} />
                                        <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
                                    </div>
                                ),
                                h2: ({ node, ...props }) => (
                                    <div className="mt-16 mb-8">
                                        <h2 className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl shadow-lg text-xl md:text-2xl font-bold flex items-center gap-3 transform hover:scale-[1.01] transition-transform" {...props} />
                                    </div>
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 className="text-purple-800 text-xl font-bold mt-8 mb-4 border-l-4 border-purple-500 pl-4 py-2" {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className="text-gray-700 leading-relaxed mb-6 text-lg" {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong className="text-purple-900 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="space-y-4 my-8 list-none pl-0" {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="flex gap-4 text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <span className="text-purple-500 font-bold text-xl mt-[-2px]">•</span>
                                        <span className="flex-1 leading-relaxed" {...props} />
                                    </li>
                                ),
                                blockquote: ({ node, children, ...props }) => (
                                    <div className="my-10 transform hover:scale-[1.02] transition-transform">
                                        <blockquote className="border-l-0 bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl shadow-md border border-orange-100 relative overflow-hidden" {...props}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                </svg>
                                            </div>
                                            <div className="relative z-10 italic text-gray-800 text-lg font-serif">
                                                {children}
                                            </div>
                                        </blockquote>
                                    </div>
                                ),
                                hr: ({ node, ...props }) => (
                                    <hr className="my-12 border-t-2 border-dashed border-gray-200" {...props} />
                                ),
                            }}
                        >
                            {report}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-8 flex justify-between items-center">
                    <p className="text-sm text-gray-400">Mentora SOW AI • 2024</p>

                    {/* Botões do Footer - Ignorados pelo html2canvas */}
                    <div className="flex gap-4" data-html2canvas-ignore="true">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="text-gray-500 hover:text-purple-600 px-6 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 hover:bg-purple-50"
                                disabled={isDownloading}
                            >
                                <RefreshCw className="w-5 h-5" />
                                Refazer Relatório
                            </button>
                        )}
                        {onNextStage && (
                            <button
                                onClick={onNextStage}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-3 transform hover:-translate-y-1"
                                disabled={isDownloading}
                            >
                                Próxima Etapa
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
