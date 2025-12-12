"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Heart, MessageSquare, TrendingUp, Sparkles } from "lucide-react"
import { twMerge } from "tailwind-merge"
import ReactMarkdown from 'react-markdown'

interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

type Sphere = "sphere1" | "sphere2" | "sphere3"

const SPHERES = [
    {
        id: "sphere1" as Sphere,
        name: "Vida & Identidade",
        icon: Heart,
        color: "text-pink-400",
        bgColor: "bg-pink-400/10",
        borderColor: "border-pink-400/20",
        description: "Propósito, Espiritualidade e Emoção",
        topics: [
            "Quem sou eu segundo a minha essência?",
            "Como descobrir meu propósito em Deus?",
            "Estou sentindo um bloqueio emocional, me ajuda?"
        ]
    },
    {
        id: "sphere2" as Sphere,
        name: "Comunicação & Copy",
        icon: MessageSquare,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20",
        description: "Posicionamento, Voz e Textos",
        topics: [
            "Crie uma copy para um post de conexão.",
            "Como minha voz arquétipa deve falar?",
            "Me ajude a escrever um roteiro de Reels."
        ]
    },
    {
        id: "sphere3" as Sphere,
        name: "Digital & Estratégia",
        icon: TrendingUp,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
        description: "Mercado, Produtos e Vendas",
        topics: [
            "Quem é a minha persona ideal?",
            "Qual produto digital devo criar primeiro?",
            "Como vender sem parecer vendedora?"
        ]
    }
]

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Olá! Sou a Mentora SOW. Selecione acima sobre qual área você quer conversar e vamos começar. Que direção você busca hoje?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedSphere, setSelectedSphere] = useState<Sphere>("sphere1")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return

        const userMessage = { role: "user" as const, content: text }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: messages.filter(m => m.role !== "system"),
                    sphere: selectedSphere
                }),
            })

            const data = await response.json()

            if (data.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
            }
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSendMessage(input)
    }

    const currentSphereData = SPHERES.find(s => s.id === selectedSphere)

    // Custom Markdown Renderer to satisfy modern UI request
    const MarkdownRenderer = ({ content, sphereData }: { content: string, sphereData?: typeof SPHERES[0] }) => {
        return (
            <ReactMarkdown
                className="prose prose-sm max-w-none text-gray-700"
                components={{
                    // Headers as highlighted cards
                    h1: ({ node, ...props }) => <h1 className={`text-lg font-bold mt-6 mb-3 p-3 rounded-lg border-l-4 ${sphereData?.borderColor || 'border-gray-300'} bg-white shadow-sm`} {...props} />,
                    h2: ({ node, ...props }) => <h2 className={`text-base font-bold mt-5 mb-2 flex items-center gap-2 ${sphereData?.color || 'text-gray-800'}`} {...props} />,
                    h3: ({ node, ...props }) => (
                        <div className={`mt-4 mb-2 p-2 rounded-md bg-opacity-50 ${sphereData?.bgColor || 'bg-gray-100'}`}>
                            <h3 className="text-sm font-bold uppercase tracking-wide opacity-80" {...props} />
                        </div>
                    ),
                    // Paragraphs with better spacing
                    p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                    // Lists nicely spaced
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    // Strong text highlighted with sphere color
                    strong: ({ node, ...props }) => <strong className={`font-bold ${sphereData?.color || 'text-purple-700'}`} {...props} />,
                    // Code blocks/Quotes as specialized boxes
                    blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 italic text-gray-600 my-4 ${sphereData?.borderColor || 'border-gray-300'}`} {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 text-white shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                        <Bot className="w-6 h-6 text-purple-200" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Mentora SOW AI</h2>
                        <p className="text-purple-200 text-xs">Inteligência Espiritual & Estratégica</p>
                    </div>
                </div>

                {/* Sphere Selector */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {SPHERES.map((sphere) => {
                        const Icon = sphere.icon
                        const isSelected = selectedSphere === sphere.id
                        return (
                            <button
                                key={sphere.id}
                                onClick={() => setSelectedSphere(sphere.id)}
                                className={twMerge(
                                    "flex flex-col items-center p-2 rounded-lg text-center transition-all border-2",
                                    isSelected
                                        ? `bg-white/10 ${sphere.borderColor} border-white/40 shadow-inner`
                                        : "bg-black/20 border-transparent hover:bg-black/30 opacity-70 hover:opacity-100"
                                )}
                            >
                                <Icon className={twMerge("w-5 h-5 mb-1", isSelected ? "text-white" : sphere.color)} />
                                <span className="text-xs font-bold text-white">{sphere.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 flex flex-col">
                {/* Context Info Badge */}
                <div className="flex justify-center flex-shrink-0">
                    <span className={twMerge(
                        "text-xs px-3 py-1 rounded-full border",
                        currentSphereData?.bgColor,
                        currentSphereData?.color,
                        currentSphereData?.borderColor
                    )}>
                        Falando sobre: <strong>{currentSphereData?.name}</strong>
                    </span>
                </div>

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={twMerge(
                            "flex gap-4 max-w-[90%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={twMerge(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-purple-100 text-purple-600" : "bg-indigo-900 text-white"
                        )}>
                            {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        <div className={twMerge(
                            "p-4 rounded-2xl shadow-sm leading-relaxed text-sm md:text-base",
                            msg.role === "user"
                                ? "bg-white border border-purple-100 text-gray-700 rounded-tr-none"
                                : "bg-white border border-indigo-100 text-gray-800 rounded-tl-none w-full"
                        )}>
                            {msg.role === "assistant" ? (
                                <MarkdownRenderer content={msg.content} sphereData={currentSphereData} />
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Sender Recommendations (Topics) - Always visible based on current sphere */}
                {currentSphereData && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 px-4 sticky bottom-0 pb-2">
                        {currentSphereData.topics.map((topic, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(topic)}
                                className={twMerge(
                                    "text-left p-3 rounded-xl border transition-all text-xs hover:shadow-md",
                                    "bg-white hover:bg-gray-50 text-gray-600 opacity-90 hover:opacity-100",
                                    currentSphereData.borderColor
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className={twMerge("w-3 h-3", currentSphereData.color)} />
                                    <span className={twMerge("font-bold", currentSphereData.color)}>Sugestão</span>
                                </div>
                                {topic}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && (
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="bg-white border border-indigo-100 p-4 rounded-2xl rounded-tl-none text-gray-400 italic text-sm">
                            Mentora SOW pensando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Pergunte algo sobre ${currentSphereData?.name}...`}
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-900 hover:bg-purple-800 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
