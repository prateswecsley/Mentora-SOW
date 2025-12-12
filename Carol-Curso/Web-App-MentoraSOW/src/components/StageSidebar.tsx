"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle, Lock, Circle, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface StageSidebarProps {
    completedStages: number[]
    currentStage: number
}

const stages = [
    { id: 1, title: "Missão SOW" },
    { id: 2, title: "IKIGAI SOW" },
    { id: 3, title: "Arquétipos" },
    { id: 4, title: "Branding" },
    { id: 5, title: "Persona & Produto" },
]

export function StageSidebar({ completedStages, currentStage }: StageSidebarProps) {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-[#141414] h-screen border-r border-gray-800 p-6 flex flex-col">
            <Link href="/dashboard">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 hover:opacity-80 transition-opacity">Mentora SOW AI</h1>
            </Link>
            <nav className="space-y-4">
                {stages.map((stage) => {
                    const isCompleted = completedStages.includes(stage.id)
                    const isLocked = !isCompleted && stage.id !== currentStage && stage.id > Math.max(...completedStages, 0) + 1
                    const isActive = pathname === `/stage/${stage.id}` || pathname === `/stage/${stage.id}/intro`

                    return (
                        <div
                            key={stage.id}
                            className={twMerge(
                                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                                isActive ? "bg-purple-900/30 text-purple-400 border border-purple-500/30" : "text-gray-400",
                                isLocked ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-800 cursor-pointer hover:text-gray-200"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isLocked ? (
                                <Lock className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Circle className={twMerge("w-5 h-5", isActive ? "text-purple-400" : "text-gray-600")} />
                            )}

                            {isLocked ? (
                                <span className="font-medium">{stage.title}</span>
                            ) : (
                                <Link href={`/stage/${stage.id}/intro`} className="font-medium w-full">
                                    {stage.title}
                                </Link>
                            )}
                        </div>
                    )
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-800 space-y-4">
                <Link
                    href="/chat"
                    className={twMerge(
                        "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                        completedStages.length === 5 ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-purple-500/20" : "text-gray-600 cursor-not-allowed"
                    )}
                >
                    <span className="font-bold">Chat com Mentora</span>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 hover:bg-red-900/20 hover:text-red-400 transition-colors w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </div>
    )
}
