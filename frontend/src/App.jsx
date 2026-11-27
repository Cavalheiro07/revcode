import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { LogoMark } from './components/Icons.jsx';
import { useAuth } from './state/AuthContext.jsx';
import { StatsProvider } from './state/StatsContext.jsx';
import { useT } from './i18n/index.jsx';

// Tela cheia enquanto o token salvo é validado (ou se a API não respondeu).
function Boot() {
  const t = useT();
  const { status, retry, logout } = useAuth();
  return (
    <div className="shell boot">
      <LogoMark size={40} />
      {status === 'error' ? (
        <div className="boot__msg" role="alert">
          <div className="strong">{t('Não foi possível falar com o servidor.')}</div>
          <div className="row-gap row-gap--sm">
            <button type="button" className="btn btn--primary" onClick={retry}>
              {t('Tentar de novo')}
            </button>
            <button type="button" className="btn btn--secondary" onClick={logout}>
              {t('Sair')}
            </button>
          </div>
        </div>
      ) : (
        <div className="muted" role="status">
          {t('Carregando…')}
        </div>
      )}
    </div>
  );
}

// Só entra logado. O StatsProvider é recriado a cada usuário.
function Protected() {
  const { token, user, status } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  if (status !== 'ready' || !user) return <Boot />;
  return (
    <StatsProvider key={user.id}>
      <Outlet />
    </StatsProvider>
  );
}

// A entrada é só para quem não está logado. Depois do login volta para onde a pessoa tentou ir.
function PublicOnly() {
  const { token, status } = useAuth();
  const location = useLocation();
  if (token && status === 'error') return <Boot />;
  if (token) return <Navigate to={location.state?.from ?? '/hoje'} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}></Route>
      <Route element={<Protected />}></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
