import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Profile.css';

function Profile({ user, onLogout }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('photo')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setProfilePhoto(data.photo);
            }
        } catch (error) {
            console.error('Error loading profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'A foto deve ter no máximo 5MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                setProfilePhoto(base64String);

                try {
                    const updates = {
                        id: user.id,
                        photo: base64String,
                        updated_at: new Date(),
                    };

                    const { error } = await supabase
                        .from('profiles')
                        .upsert(updates);

                    if (error) throw error;

                    setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                } catch (error) {
                    setMessage({ type: 'error', text: 'Erro ao salvar foto: ' + error.message });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres' });
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao alterar senha: ' + error.message });
        }
    };

    return (
        <div className="profile-container">
            <nav className="navbar business-navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <h1 className="navbar-title gradient-title">Mentora SOW</h1>
                        </div>
                        <div className="navbar-actions">
                            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary outline-btn business-logout">Dashboard</button>
                            <button onClick={onLogout} className="btn btn-secondary outline-btn business-logout">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="profile-main container">
                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="card profile-card">
                    <div className="card-header-modern">
                        <h3 className="card-title-modern">Meu Perfil 👤</h3>
                    </div>
                    <div className="profile-content-wrapper">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="avatar-image" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <label htmlFor="photo-upload" className="photo-upload-btn">
                                📷 Alterar Foto
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        <div className="profile-info">
                            <div className="info-group">
                                <label>Nome</label>
                                <p>{user?.name || 'Não informado'}</p>
                            </div>

                            <div className="info-group">
                                <label>Email</label>
                                <p>{user?.email || 'Não informado'}</p>
                            </div>

                            <div className="info-group">
                                <label>Membro desde</label>
                                <p>{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="btn btn-primary"
                            >
                                🔒 {showPasswordForm ? 'Cancelar' : 'Alterar Senha'}
                            </button>
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="password-form">
                                <h3 className="form-title">Alterar Senha</h3>

                                <div className="form-group">
                                    <label htmlFor="current-password">Senha Atual</label>
                                    <input
                                        id="current-password"
                                        type="password"
                                        className="input"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="new-password">Nova Senha</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        className="input"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirm-password">Confirmar Nova Senha</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        className="input"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    Salvar Nova Senha
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="card help-card">
                    <div className="card-header-modern">
                        <h3 className="card-title-modern">Suporte & Ajuda 💬</h3>
                    </div>
                    <p className="help-text">
                        Precisa de ajuda? Estamos aqui para você! Entre em contato através dos canais abaixo:
                    </p>
                    <div className="help-links">
                        <a href="mailto:prates.cml@gmail.com" className="help-link">
                            <span className="link-icon">📧</span>
                            <span className="link-text">prates.cml@gmail.com</span>
                        </a>
                        <a href="#" className="help-link">
                            <span className="link-icon">📚</span>
                            <span className="link-text">Central de Ajuda</span>
                        </a>
                    </div>
                </div>

                <div className="card about-card">
                    <div className="card-header-modern">
                        <h3 className="card-title-modern">Sobre o Mentora SOW 🌷</h3>
                    </div>
                    <div className="about-content">
                        <p className="about-text">
                            O Mentora SOW – Low Ticket é sua parceira na criação de produtos digitais que vendem com leveza.
                            Nossa missão é ajudar mulheres a transformarem suas histórias em produtos Low Ticket vendáveis,
                            simples e estratégicos.
                        </p>
                        <p className="about-text">
                            Através de um processo guiado em 5 etapas, você descobrirá seu nicho, validará suas ideias
                            e criará produtos que realmente resolvem as dores da sua audiência.
                        </p>
                        <div className="about-features">
                            <div className="feature-item">
                                <span className="feature-icon">✨</span>
                                <span className="feature-text">Análise de Mercado com IA</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📋</span>
                                <span className="feature-text">Relatórios Estratégicos</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🎯</span>
                                <span className="feature-text">Produtos Personalizados</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;
