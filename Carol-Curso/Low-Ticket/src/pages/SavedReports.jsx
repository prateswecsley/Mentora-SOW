import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './SavedReports.css';

function SavedReports({ user, onLogout }) {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
            try {
                const { error } = await supabase
                    .from('reports')
                    .delete()
                    .eq('id', reportId);

                if (error) throw error;

                setReports(reports.filter(report => report.id !== reportId));
            } catch (error) {
                alert('Erro ao excluir relatório: ' + error.message);
            }
        }
    };

    return (
        <div className="saved-reports-container">
            <nav className="navbar business-navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <h1 className="navbar-title gradient-title">Mentora SOW</h1>
                        </div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <span className="user-avatar business-avatar">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : ''}
                                </span>
                                <span className="user-name">{user?.name || 'Usuária'}</span>
                            </div>
                            <button onClick={onLogout} className="btn btn-secondary outline-btn business-logout">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="saved-reports-main container">
                <div className="page-header">
                    <h2 className="page-title">Meus Relatórios</h2>
                    <div className="page-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                            Voltar ao Dashboard
                        </button>
                        <Link to="/new-report" className="btn btn-primary">
                            Criar Novo Relatório
                        </Link>
                    </div>
                </div>

                {reports.length > 0 ? (
                    <div className="report-list-modern">
                        {reports.map(report => (
                            <div
                                key={report.id}
                                className="report-card-modern"
                                onClick={() => navigate(`/report/${report.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="report-card-header-styled">
                                    <span className="report-status-badge">
                                        {report.status === 'completed' ? 'COMPLETO' : 'Produtos Digitais'}
                                    </span>
                                </div>

                                <div className="report-card-body-styled">
                                    <h2 className="report-title-styled">{report.title}</h2>
                                    <p className="report-summary-styled">{report.summary}</p>

                                    <div className="report-metrics-styled">
                                        <div className="metric-tag">
                                            <span>📦</span> {report.content.products?.length || 0} produtos
                                        </div>
                                        <div className="metric-tag">
                                            <span>✨</span> {report.content.orderBumps?.length || 0} bumps
                                        </div>
                                        {report.content.upsell && (
                                            <div className="metric-tag">
                                                <span>📈</span> 1 upsell
                                            </div>
                                        )}
                                    </div>

                                    <div className="report-actions-styled">
                                        <Link to={`/report/${report.id}`} className="action-link-styled">
                                            Ver Detalhes
                                        </Link>
                                        <button
                                            className="delete-btn-styled"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteReport(report.id);
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state card">
                        <div className="empty-icon">📝</div>
                        <h3>Nenhum relatório ainda</h3>
                        <p>Crie seu primeiro relatório para começar sua jornada!</p>
                        <Link to="/new-report" className="btn btn-primary">
                            Criar Primeiro Relatório
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SavedReports;
