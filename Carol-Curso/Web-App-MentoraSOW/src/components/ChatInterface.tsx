"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot } from "lucide-react"
import { twMerge } from "tailwind-merge"

interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Olá! Sou a Mentora SOW. Li seus relatórios e estou aqui para te ajudar a aprofundar sua jornada. Sobre o que gostaria de conversar hoje?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = { role: "user" as const, content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: messages.filter(m => m.role !== "system")
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

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-4 text-white shadow-md z-10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Bot className="w-6 h-6" />
                    Mentora SOW AI
                </h2>
                <p className="text-purple-200 text-sm">Conectada à sua essência</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={twMerge(
                            "flex gap-4 max-w-[80%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={twMerge(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-purple-100 text-purple-600" : "bg-indigo-100 text-indigo-600"
                        )}>
                            {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                        </div>

                        <div className={twMerge(
                            "p-4 rounded-2xl shadow-sm text-gray-700 leading-relaxed",
                            msg.role === "user"
                                ? "bg-white border border-purple-100 rounded-tr-none"
                                : "bg-white border border-indigo-100 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="bg-white border border-indigo-100 p-4 rounded-2xl rounded-tl-none text-gray-500 italic">
                            Digitando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Converse com sua mentora..."
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
