"use client"

import { useState, useEffect } from "react"
import { twMerge } from "tailwind-merge"

interface QuestionBlockProps {
    id: number
    title: string
    tip: string
    example: string
    value: string
    onChange: (value: string) => void
    onSave: () => void
}

export function QuestionBlock({ id, title, tip, example, value, onChange, onSave }: QuestionBlockProps) {
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isTyping) {
                onSave()
                setIsTyping(false)
            }
        }, 2000)

        return () => clearTimeout(timeout)
    }, [value, isTyping, onSave])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
        setIsTyping(true)
    }

    return (
        <div className="bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-800 p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold border border-purple-800">
                    {id}
                </div>
                <h3 className="text-lg font-semibold text-gray-200 pt-1">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-blue-400 font-medium mb-1">💡 Dica da Mentora</p>
                        <p className="text-sm text-blue-300/80">{tip}</p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 font-medium mb-1">✨ Exemplo</p>
                        <p className="text-sm text-gray-500 italic">"{example}"</p>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={value}
                        onChange={handleChange}
                        onBlur={onSave}
                        placeholder="Sua resposta..."
                        className="w-full h-full min-h-[200px] p-4 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                        {isTyping ? "Digitando..." : "Salvo"}
                    </div>
                </div>
            </div>
        </div>
    )
}
