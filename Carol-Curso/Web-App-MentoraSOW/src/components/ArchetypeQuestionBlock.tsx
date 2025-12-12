"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Sparkles } from "lucide-react"

interface ArchetypeOption {
    letter: string
    text: string
}

interface ArchetypeQuestionBlockProps {
    id: number
    title: string
    options: ArchetypeOption[]
    value: string
    onChange: (value: string) => void
    onSave: () => void
}

export function ArchetypeQuestionBlock({
    id,
    title,
    options,
    value,
    onChange,
    onSave,
}: ArchetypeQuestionBlockProps) {
    const [selectedLetters, setSelectedLetters] = useState<string[]>([])

    // Parse initial value
    useEffect(() => {
        if (value) {
            const letters = value.split(',').map(l => l.trim()).filter(l => l)
            setSelectedLetters(letters)
        }
    }, [value])

    const toggleLetter = (letter: string) => {
        let newSelection: string[]

        if (selectedLetters.includes(letter)) {
            // Remove if already selected
            newSelection = selectedLetters.filter(l => l !== letter)
        } else {
            // Add if not selected (max 3)
            if (selectedLetters.length < 3) {
                newSelection = [...selectedLetters, letter]
            } else {
                // Already at max, don't add
                return
            }
        }

        setSelectedLetters(newSelection)
        const newValue = newSelection.join(', ')
        onChange(newValue)
    }

    const handleBlur = () => {
        onSave()
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl">
            {/* Question Header */}
            <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                    <div className="bg-purple-600 text-white rounded-lg px-3 py-1 text-sm font-bold">
                        {id}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex-1 leading-tight">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 text-sm text-purple-400 bg-purple-950/30 px-4 py-2 rounded-lg border border-purple-800/30">
                    <Sparkles className="w-4 h-4" />
                    <span>Escolha até 3 opções que mais combinam com você</span>
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {options.map((option) => {
                    const isSelected = selectedLetters.includes(option.letter)
                    const isDisabled = !isSelected && selectedLetters.length >= 3

                    return (
                        <button
                            key={option.letter}
                            onClick={() => toggleLetter(option.letter)}
                            onBlur={handleBlur}
                            disabled={isDisabled}
                            className={`
                                text-left p-4 rounded-xl border-2 transition-all h-full
                                ${isSelected
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                    : isDisabled
                                        ? 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-600 hover:bg-gray-750'
                                }
                            `}
                        >
                            <div className="flex flex-col gap-3">
                                {/* Top Row: Checkbox and Letter */}
                                <div className="flex items-center gap-2">
                                    {/* Checkbox */}
                                    <div className={`
                                        w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                        ${isSelected
                                            ? 'bg-white border-white'
                                            : 'bg-transparent border-gray-600'
                                        }
                                    `}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Letter Badge */}
                                    <div className={`
                                        w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0
                                        ${isSelected
                                            ? 'bg-white text-purple-600'
                                            : 'bg-gray-700 text-gray-400'
                                        }
                                    `}>
                                        {option.letter}
                                    </div>
                                </div>

                                {/* Option Text */}
                                <span className="text-sm font-medium leading-snug">
                                    {option.text}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Selection Counter */}
            <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                    {selectedLetters.length > 0 ? (
                        <span>
                            Selecionadas: <span className="text-purple-400 font-bold">{selectedLetters.join(', ')}</span>
                        </span>
                    ) : (
                        <span>Nenhuma opção selecionada</span>
                    )}
                </div>
                <div className={`
                    font-bold
                    ${selectedLetters.length === 3 ? 'text-purple-400' : 'text-gray-500'}
                `}>
                    {selectedLetters.length}/3
                </div>
            </div>
        </div>
    )
}
