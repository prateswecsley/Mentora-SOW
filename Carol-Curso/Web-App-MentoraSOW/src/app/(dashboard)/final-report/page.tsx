import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ReportSection } from "@/components/ReportSection"
import { FinalReportClient } from "./client"

export default async function FinalReportPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/api/auth/signin")

    // Fetch user with all reports
    const user = await prisma.user.findUnique({
        where: { email: session.user?.email! },
        include: {
            reports: true,
        }
    })

    if (!user) redirect("/api/auth/signin")

    // Check if all 5 stages are completed
    const completedStages = user.reports.filter(r => r.stageId >= 1 && r.stageId <= 5).map(r => r.stageId)
    const allStagesCompleted = [1, 2, 3, 4, 5].every(stage => completedStages.includes(stage))

    // Check if final report exists
    const finalReport = user.reports.find(r => r.stageId === 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        ⭐ Laudo Final de Posicionamento SOW
                    </h1>
                    <p className="text-gray-300">
                        A integração completa da sua jornada de autoconhecimento
                    </p>
                </header>

                {!allStagesCompleted ? (
                    <div className="bg-yellow-900/30 backdrop-blur-sm border border-yellow-700/50 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-yellow-300 mb-2">
                            ⚠️ Etapas Incompletas
                        </h2>
                        <p className="text-yellow-200 mb-4">
                            Você precisa completar todas as 5 etapas antes de gerar o Laudo Final.
                        </p>
                        <p className="text-yellow-300 text-sm">
                            Etapas concluídas: {completedStages.length}/5
                        </p>
                        <p className="text-yellow-300 text-sm">
                            Faltam: {[1, 2, 3, 4, 5].filter(s => !completedStages.includes(s)).join(', ')}
                        </p>
                        <a
                            href="/dashboard"
                            className="inline-block mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                        >
                            Voltar ao Dashboard
                        </a>
                    </div>
                ) : finalReport ? (
                    <div>
                        <div className="bg-green-900/30 backdrop-blur-sm border border-green-700/50 rounded-lg p-4 mb-6">
                            <p className="text-green-300">
                                ✅ Laudo Final gerado com sucesso!
                            </p>
                        </div>
                        <ReportSection
                            report={finalReport.report}
                        />
                    </div>
                ) : (
                    <FinalReportClient />
                )}
            </div>
        </div>
    )
}
