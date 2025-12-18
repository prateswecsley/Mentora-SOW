"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!session?.user) return null

    const userInitial = session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"

    return (
        <div className="relative" ref={menuRef}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                    {session.user.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || ""}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.remove('overflow-hidden'); // Optional tweak
                                // Show initials by un-hiding a sibling or just rely on the fact that if img is hidden, we need to show content.
                                // React way: easier to use state, but this is a simple client component.
                                // Actually, simpler approach for this component:
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${session.user.name}&background=random`
                            }}
                        />
                    ) : (
                        userInitial
                    )}
                </div>

                {/* User Info */}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">{session.user.name || "Usuário"}</p>
                    <p className="text-xs text-gray-400">{session.user.email}</p>
                </div>

                {/* Dropdown Icon */}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800/30 backdrop-blur-xl rounded-lg shadow-2xl border border-purple-500/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info in Dropdown */}
                    <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/20">
                        <p className="text-sm font-semibold text-white">{session.user.name || "Usuário"}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-gray-200 hover:text-white"
                        >
                            <User className="w-5 h-5" />
                            <span className="text-sm font-medium">Meu Perfil</span>
                        </Link>



                        <div className="border-t border-gray-700/50 my-2"></div>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                signOut({ callbackUrl: "/auth/signin" })
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 transition-colors text-gray-200 hover:text-red-400"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
