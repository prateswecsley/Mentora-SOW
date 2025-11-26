import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
    return (
        <div className="dashboard-container">
            <nav className="navbar business-navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <h1 className="navbar-title">Mentora SOW</h1>
                        </div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <span className="user-avatar business-avatar">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : ''}
                                </span>
                                <span className="user-name">{user?.name || 'Usuária'}</span>
                            </div>
                            <button onClick={onLogout} className="btn btn-secondary outline-btn business-logout">
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="dashboard-main container">
                <section className="welcome-section">
                    <h2 className="welcome-title">Olá, {user?.name || 'mulher maravilhosa'}!</h2>
                    <p className="welcome-text">
                        Que bom ter você aqui. Estou pronta para te ajudar a criar produtos Low Ticket que vendem com leveza.
                    </p>
                </section>

                <div className="dashboard-grid">
                    <Link to="/new-report" className="dashboard-card">
                        <div className="card-icon">🚀</div>
                        <h3 className="card-title">Novo Relatório</h3>
                        <p className="card-description">
                            Comece uma nova jornada para criar seu produto Low Ticket
                        </p>
                    </Link>

                    <Link to="/saved-reports" className="dashboard-card">
                        <div className="card-icon">📑</div>
                        <h3 className="card-title">Relatórios Salvos</h3>
                        <p className="card-description">
                            Acesse seus relatórios e produtos criados anteriormente
                        </p>
                    </Link>

                    <Link to="/profile" className="dashboard-card">
                        <div className="card-icon">👤</div>
                        <h3 className="card-title">Meu Perfil</h3>
                        <p className="card-description">
                            Gerencie suas informações e preferências
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
