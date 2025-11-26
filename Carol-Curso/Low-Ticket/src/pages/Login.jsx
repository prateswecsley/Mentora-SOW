import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isSignup) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        },
                    },
                });

                if (error) throw error;
                setMessage({ type: 'success', text: 'Verifique seu email para confirmar o cadastro!' });
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                // App.jsx will handle the session change via onAuthStateChange
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <div className="login-header">
                    <h1 className="login-title">Mentora SOW</h1>
                    <p className="login-subtitle">Low Ticket</p>
                </div>

                {message.text && (
                    <div className={`message-banner ${message.type}`} style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9', color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignup && (
                        <div className="form-group">
                            <label htmlFor="name">Nome</label>
                            <input
                                id="name"
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Carregando...' : (isSignup ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="login-footer">
                    <button
                        type="button"
                        className="toggle-mode-btn"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setMessage({ type: '', text: '' });
                        }}
                    >
                        {isSignup ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
