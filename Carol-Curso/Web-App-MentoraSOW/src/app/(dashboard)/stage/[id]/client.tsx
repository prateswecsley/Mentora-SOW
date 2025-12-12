"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionBlock } from "@/components/QuestionBlock"
import { ArchetypeQuestionBlock } from "@/components/ArchetypeQuestionBlock"
import { ReportSection } from "@/components/ReportSection"
import { Loader2 } from "lucide-react"
import { archetypeQuestionsData } from "@/data/archetypeQuestions"

interface StageClientProps {
    stageId: number
    questions: any[]
    initialAnswers: Record<string, string>
    initialReport?: string | null
}

export function StageClient({ stageId, questions, initialAnswers, initialReport }: StageClientProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
    const [report, setReport] = useState<string | null>(initialReport || null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleAnswerChange = (id: number, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }))
    }

    const saveAnswers = async () => {
        try {
            await fetch("/api/save-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stageId, answers }),
            })
        } catch (error) {
            console.error("Failed to save answers", error)
        }
    }

    const generateReport = async () => {
        setIsGenerating(true)
        await saveAnswers() // Ensure latest answers are saved

        try {
            const response = await fetch("/api/generate-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stageId, answers }),
            })

            const data = await response.json()
            if (data.report) {
                setReport(data.report)
                router.refresh() // Refresh to update sidebar status
            } else {
                alert("Erro ao gerar relatório. Tente novamente.")
            }
        } catch (error) {
            console.error("Failed to generate report", error)
            alert("Erro de conexão. Verifique se o servidor está rodando.")
        } finally {
            setIsGenerating(false)
        }
    }

    const allAnswered = questions.every(q => answers[q.id] && answers[q.id].trim().length > 0)

    return (
        <div>
            <div className="space-y-6">
                {stageId === 3 ? (
                    // Use ArchetypeQuestionBlock for Stage 3
                    archetypeQuestionsData.map((q) => (
                        <ArchetypeQuestionBlock
                            key={q.id}
                            id={q.id}
                            title={q.title}
                            options={q.options}
                            value={answers[q.id] || ""}
                            onChange={(val) => handleAnswerChange(q.id, val)}
                            onSave={saveAnswers}
                        />
                    ))
                ) : (
                    // Use regular QuestionBlock for other stages
                    questions.map((q) => (
                        <QuestionBlock
                            key={q.id}
                            id={q.id}
                            title={q.title}
                            tip={q.tip}
                            example={q.example}
                            value={answers[q.id] || ""}
                            onChange={(val) => handleAnswerChange(q.id, val)}
                            onSave={saveAnswers}
                        />
                    ))
                )}
            </div>

            {!report && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={generateReport}
                        disabled={!allAnswered || isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando Relatório...
                            </>
                        ) : (
                            "Gerar Relatório da Etapa"
                        )}
                    </button>
                </div>
            )}

            {report && (
                <ReportSection
                    report={report}
                    onNextStage={() => {
                        if (stageId < 5) {
                            router.push(`/stage/${stageId + 1}/intro`)
                        } else {
                            router.push("/chat")
                        }
                    }}
                    onRetry={() => setReport(null)}
                />
            )}
        </div>
    )
}
