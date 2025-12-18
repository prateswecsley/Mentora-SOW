import { Play, ChevronRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/UserMenu"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/api/auth/signin")

    // Fetch user progress
    let user = null
    try {
        user = await prisma.user.findUnique({
            where: { email: session.user?.email || "" },
            include: {
                answers: true,
                reports: true,
            },
        })
    } catch (error) {
        console.error("Database connection error:", error)
        // Continue with null user - will show empty state
    }

    // Determine stage progress
    const stages = [
        { id: 1, title: "Missão SOW", img: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=1000&auto=format&fit=crop" },
        { id: 2, title: "IKIGAI SOW", img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" },
        { id: 3, title: "Arquétipos", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" },
        { id: 4, title: "Branding", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop" },
        { id: 5, title: "Persona & Produto", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop" },
    ]

    // Check which stages are completed (have reports)
    const completedStages = new Set(user?.reports.map(r => r.stageId) || [])

    // Check which stages have answers but no report (in progress)
    const stagesWithAnswers = new Set(user?.answers.map(a => a.stageId) || [])
    const inProgressStages = Array.from(stagesWithAnswers).filter(id => !completedStages.has(id))

    // Current stage is the first in-progress stage, or the next uncompleted stage
    let currentStage = null
    if (inProgressStages.length > 0) {
        currentStage = stages.find(s => s.id === inProgressStages[0])
    } else {
        // Find first incomplete stage
        currentStage = stages.find(s => !completedStages.has(s.id))
    }

    return (
        <div className="min-h-screen bg-[#141414] text-white pb-20">
            {/* Top Navigation Bar */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-end px-4 md:px-12 py-4 bg-gradient-to-b from-black/80 to-transparent">
                <UserMenu />
            </nav>

            {/* Hero Section */}
            <div className="relative h-[80vh] w-full">
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/60 to-[#141414] z-10"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop")' }}
                ></div>

                {/* Hero Content */}
                <div className="absolute bottom-[20%] left-4 md:left-12 z-20 max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Mentora SOW AI</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                        Jornada da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Essência</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-md max-w-lg">
                        Descubra quem você realmente é. Uma jornada guiada de autoconhecimento, propósito e transformação espiritual.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            href={currentStage ? `/stage/${currentStage.id}/intro` : "/stage/1/intro"}
                            className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-md font-bold text-lg flex items-center gap-3 transition-colors"
                        >
                            <Play className="w-6 h-6 fill-black" />
                            {currentStage ? "Continuar" : "Comece Aqui"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Rows */}
            <div className="px-4 md:px-12 -mt-20 relative z-30 space-y-12">
                {/* Row 1: Continue Watching / Current Stage */}
                {currentStage && inProgressStages.length > 0 && (
                    <section>
                        <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                            Continuar Assistindo
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href={`/stage/${currentStage.id}`} className="group relative aspect-video bg-gray-800 rounded-md overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border-2 border-transparent hover:border-gray-500">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                <img src={currentStage.img} alt={currentStage.title} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                                    <div className="w-full bg-gray-700 h-1 rounded-full mb-2 overflow-hidden">
                                        <div className="bg-purple-600 h-full w-[50%]"></div>
                                    </div>
                                    <h4 className="font-bold text-white">Etapa {currentStage.id}: {currentStage.title}</h4>
                                    <p className="text-xs text-gray-300 mt-1">Em andamento</p>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/50">
                                        <Play className="w-8 h-8 fill-white text-white" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                )}

                {/* New Section: Final Report & Chat Cards */}
                <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Sua Jornada Completa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Laudo Final */}
                        <Link
                            href="/final-report"
                            className="group relative h-48 bg-gray-800 rounded-lg overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border-2 border-transparent hover:border-purple-500"
                        >
                            {/* Background Image */}
                            <img
                                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop"
                                alt="Laudo Final"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>

                            {/* Content */}
                            <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between">
                                <div className="flex items-start justify-end">
                                    {user?.reports.some(r => r.stageId === 0) && (
                                        <span className="bg-green-500/20 backdrop-blur-sm text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                            ✓ Gerado
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Seu Laudo Final</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        {completedStages.size === 5
                                            ? "Integração completa de todas as 5 etapas"
                                            : `Progresso: ${completedStages.size}/5 etapas concluídas`}
                                    </p>
                                    <div className="flex items-center text-purple-300 text-sm group-hover:text-purple-200 transition">
                                        {user?.reports.some(r => r.stageId === 0) ? "Ver Laudo Completo" : "Gerar Laudo Final"}
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>


                        </Link>

                        {/* Card 2: Chat com Mentora SOW */}
                        {user?.reports.some(r => r.stageId === 0) ? (
                            <Link
                                href="/chat"
                                className="group relative h-48 bg-gray-800 rounded-lg overflow-hidden hover:scale-105 hover:z-10 transition-all duration-300 shadow-lg cursor-pointer border-2 border-transparent hover:border-cyan-500"
                            >
                                {/* Background Image */}
                                <img
                                    src="https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1200&auto=format&fit=crop"
                                    alt="Chat com Mentora SOW"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between">
                                    <div className="flex items-start justify-end">
                                        <span className="bg-green-500/20 backdrop-blur-sm text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                            ✓ Liberado
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">Converse com a Mentora SOW</h4>
                                        <p className="text-gray-300 text-sm mb-3">
                                            Chat personalizado com contexto completo da sua jornada
                                        </p>
                                        <div className="flex items-center text-cyan-300 text-sm group-hover:text-cyan-200 transition">
                                            Iniciar Conversa
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>


                            </Link>
                        ) : (
                            <div className="relative h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700/30 opacity-60">
                                {/* Background Image (Grayscale/Darkened) */}
                                <img
                                    src="https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1200&auto=format&fit=crop"
                                    alt="Chat Bloqueado"
                                    className="absolute inset-0 w-full h-full object-cover grayscale"
                                />
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-black/70 z-10"></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between">
                                    <div className="flex items-start justify-end">
                                        <span className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                                            🔒 Bloqueado
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-gray-400 mb-2">Converse com a Mentora SOW</h4>
                                        <p className="text-gray-500 text-sm mb-3">
                                            Complete todas as etapas e gere o Laudo Final para desbloquear
                                        </p>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            ⚠️ Requer Laudo Final
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Row 2: Episodes / Stages */}
                <section>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Todas as Etapas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {stages.map((stage) => {
                            const isCompleted = completedStages.has(stage.id)

                            return (
                                <Link key={stage.id} href={`/stage/${stage.id}/intro`} className="w-full aspect-video bg-gray-800 rounded-md overflow-hidden relative group hover:scale-105 transition-transform duration-300 shadow-lg border border-gray-800 hover:border-gray-600">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                                    <img src={stage.img} alt={stage.title} className="w-full h-full object-cover" />

                                    {/* Completed Badge */}
                                    {isCompleted && (
                                        <div className="absolute top-2 right-2 z-30 bg-green-600 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-lg">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Concluída
                                        </div>
                                    )}

                                    {/* Large Number Background */}
                                    <span className="absolute -right-4 -bottom-8 text-9xl font-black text-white/10 z-0 pointer-events-none select-none">
                                        {stage.id}
                                    </span>

                                    <div className="absolute bottom-0 left-0 p-3 z-20 w-full bg-gradient-to-t from-black/90 to-transparent">
                                        <h4 className="font-bold text-white text-sm md:text-base leading-tight">{stage.title}</h4>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Row 3: Bonus Content (Placeholders) */}
                <section>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Conteúdos Extras</h3>
                    <div className="flex overflow-x-auto gap-4 pb-8 scrollbar-hide">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-none w-48 aspect-[2/3] bg-gray-800 rounded-md overflow-hidden relative group hover:scale-105 transition-transform duration-300 cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                                <img src={`https://source.unsplash.com/random/300x450?sig=${i + 10}`} alt="Extra" className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 left-0 w-full text-center z-20">
                                    <span className="text-xs font-bold text-red-500 bg-black/50 px-2 py-1 rounded">EM BREVE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
