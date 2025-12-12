"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSignIn = async (provider: string) => {
        setIsLoading(true)
        await signIn(provider, { callbackUrl: "/" })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-purple-500/20">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-purple-400">Mentora SOW AI</h1>
                    <p className="text-gray-300 mt-2">Faça login para iniciar sua jornada</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSignIn("google")}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-all shadow-lg"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continuar com Google
                    </button>

                    <button
                        onClick={() => handleSignIn("github")}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white hover:bg-[#24292F]/90 px-4 py-3 rounded-lg font-medium transition-all"
                    >
                        <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5 invert" />
                        Continuar com GitHub
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800/50 text-gray-400">Ou continue com email</span>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
                            signIn('email', { email, callbackUrl: '/' })
                        }}
                        className="space-y-4"
                    >
                        <input
                            type="email"
                            name="email"
                            placeholder="seu@email.com"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar com Email"}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800/50 text-gray-400">Desenvolvimento</span>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            const email = (e.currentTarget.elements.namedItem('test-email') as HTMLInputElement).value
                            signIn('credentials', { email, callbackUrl: '/' })
                        }}
                        className="space-y-4"
                    >
                        <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-600/50 text-sm text-yellow-300 mb-2">
                            ⚠️ Modo Teste: Digite qualquer email para entrar direto.
                        </div>
                        <input
                            type="email"
                            name="test-email"
                            placeholder="teste@exemplo.com"
                            defaultValue="aluna@sow.com"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar (Modo Teste)"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
