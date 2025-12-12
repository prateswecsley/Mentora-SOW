"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function FinalReportClient() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError("")

        try {
            const response = await fetch("/api/generate-final-report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Erro ao gerar laudo final")
            }

            // Refresh the page to show the generated report
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Pronta para o Laudo Final?
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                    Você completou todas as 5 etapas da jornada SOW! Agora vamos integrar tudo em um laudo completo de posicionamento pessoal.
                </p>
            </div>

            {error && (
                <div className="bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-lg p-4 mb-6">
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-purple-300 mb-3">
                    O que será integrado:
                </h3>
                <ul className="space-y-2 text-purple-200">
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Laudo de Missão SOW - Sua essência e propósito</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Laudo de IKIGAI SOW - Sua vocação e talentos</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Laudo de Arquétipos - Sua identidade arquetípica</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Laudo de Branding - Sua marca pessoal</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Laudo de Persona & Produto - Seu mercado e direção</span>
                    </li>
                </ul>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Gerando Laudo Final... (isso pode levar 30-60 segundos)
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Gerar Laudo Final
                    </>
                )}
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
                Este processo pode levar até 1 minuto. Por favor, aguarde...
            </p>
        </div>
    )
}
