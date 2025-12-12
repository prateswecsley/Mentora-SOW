import { Play, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StageIntroPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const stageId = parseInt(id)

    // Dados mockados das etapas (idealmente viriam de um config/DB)
    const stages = {
        1: {
            title: "Missão SOW",
            subtitle: "Descobrindo sua Essência",
            description: "Nesta etapa, vamos mergulhar fundo na sua história para identificar os momentos que moldaram quem você é. Prepare-se para revisitar memórias e encontrar padrões que revelam sua verdadeira missão.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", // Placeholder
            duration: "15 min",
            nextUrl: `/stage/${stageId}`
        },
        2: {
            title: "IKIGAI SOW",
            subtitle: "O Ponto de Encontro",
            description: "Vamos descobrir o ponto de convergência entre o que você ama, o que faz bem, o que o mundo precisa e o que pode ser pago. Prepare-se para alinhar paixão, missão, vocação e profissão.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
            duration: "20 min",
            nextUrl: `/stage/${stageId}`
        },
        3: {
            title: "Arquétipos",
            subtitle: "Descubra Sua Essência",
            description: "Chegou a hora de descobrir os arquétipos femininos que definem sua identidade, presença e posicionamento. Vamos revelar as energias que te guiam e como elas se manifestam na sua vida e missão.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
            duration: "18 min",
            nextUrl: `/stage/${stageId}`
        },
        4: {
            title: "Branding",
            subtitle: "Descubra Sua Marca Pessoal",
            description: "Branding não é estética — é identidade. Vamos revelar sua essência, seu valor e a transformação que você carrega, construindo uma marca que nasce da sua alma.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
            duration: "25 min",
            nextUrl: `/stage/${stageId}`
        },
        5: {
            title: "Persona & Produto",
            subtitle: "Sua Vocação em Movimento",
            description: "Propósito é ser quem você é. Missão é colocar isso em movimento a serviço do outro. Vamos descobrir quem você pode ajudar e o que você pode entregar ao mundo.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
            duration: "30 min",
            nextUrl: `/stage/${stageId}`
        }
    }

    const stage = stages[stageId as keyof typeof stages]

    if (!stage) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Video Hero Section */}
            <div className="relative w-full h-[60vh] md:h-[70vh] bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#141414] z-10 pointer-events-none"></div>

                {/* Video Embed */}
                <iframe
                    src={stage.videoUrl}
                    title={stage.title}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent pt-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Aula {stageId}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                                <Play className="w-3 h-3" /> {stage.duration}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            {stage.title}: <span className="text-gray-400 font-normal">{stage.subtitle}</span>
                        </h1>

                        <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            {stage.description}
                        </p>

                        <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link
                                href={stage.nextUrl}
                                className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                            >
                                <Play className="w-5 h-5 fill-black" />
                                Responder Questionário
                            </Link>

                            {/* Optional: Mark as watched or other actions */}
                            {/* <button className="bg-gray-800/80 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-semibold flex items-center gap-2 backdrop-blur-sm transition-colors border border-gray-700">
                                <CheckCircle className="w-5 h-5" />
                                Marcar como Assistido
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Content / Context (Optional) */}
            <div className="max-w-4xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold text-gray-100">Sobre esta etapa</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Esta aula é fundamental para o seu progresso. Certifique-se de assistir até o fim antes de iniciar o questionário.
                            As respostas que você der a seguir serão a base para o seu relatório personalizado e para a construção do seu plano de vida.
                        </p>
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Dica da Mentora
                            </h4>
                            <p className="text-sm text-gray-300">
                                Não tenha pressa. Se precisar, pause o vídeo e faça anotações. O autoconhecimento requer tempo e reflexão honesta.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-100">Nesta aula você vai ver:</h3>
                        <ul className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                                    <div className="mt-1 min-w-[20px]">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                    </div>
                                    <span>Tópico importante abordado no vídeo {item} para seu desenvolvimento.</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Info({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
