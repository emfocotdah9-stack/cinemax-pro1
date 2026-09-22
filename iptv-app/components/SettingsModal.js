import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearCredentials, getCredentials } from '../utils/apiClient';
import styles from './SettingsModal.module.css';

export default function SettingsModal({ isOpen, onClose }) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUserInfo = async () => {
      setLoading(true);
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      try {
        // A action "get_user_info" ou apenas bater no proxy base pode não estar implementada para retornar só o user_info de forma nativa pela nossa proxy.
        // O Xtream Codes retorna "user_info" no top-level de muitos endpoints.
        // Vamos tentar chamar "get_vod_categories" com limite 1 para tentar pegar o user_info que sempre vem no payload do Xtream Codes.
        const res = await fetch('/api/xtream?action=get_vod_categories', {
          headers: {
            'x-xtream-url': creds.url,
            'x-xtream-user': creds.username,
            'x-xtream-pass': creds.password
          }
        });
        const data = await res.json();
        
        // Em muitos painéis Xtream Codes, get_vod_categories ou apenas login retornam user_info.
        if (data.user_info) {
          setUserInfo(data.user_info);
        } else {
          // Fallback minimal
          setUserInfo({ username: creds.username, status: 'Active (Fallback)' });
        }
      } catch (error) {
        console.error("Erro ao buscar user_info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isOpen, router]);

  if (!isOpen) return null;

  const handleLogout = () => {
    clearCredentials();
    router.push('/login');
  };

  const handleClearCache = () => {
    // Clear only app cache, keep credentials
    localStorage.removeItem('iptv_favorites'); // Se quisermos limpar favoritos, ou apenas dar um reload na página
    window.location.reload();
  };

  const formatExpDate = (timestamp) => {
    if (!timestamp) return 'Ilimitado';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2>Configurações</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Informações da Conta</div>
            {loading ? (
              <div>Carregando...</div>
            ) : userInfo ? (
              <>
                <div className={styles.infoRow}>
                  <span>Usuário</span>
                  <span>{userInfo.username}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Status</span>
                  <span className={userInfo.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                    {userInfo.status}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span>Expiração</span>
                  <span>{formatExpDate(userInfo.exp_date)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Conexões Ativas</span>
                  <span>{userInfo.active_cons || 0} / {userInfo.max_connections || 1}</span>
                </div>
              </>
            ) : (
              <div>Falha ao carregar informações.</div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Sistema</div>
            <button className={`${styles.actionButton} ${styles.primaryAction}`} onClick={handleClearCache}>
              🔄 Limpar Cache e Recarregar
            </button>
            <button className={`${styles.actionButton} ${styles.dangerAction}`} onClick={handleLogout}>
              🚪 Sair da Conta (Logout)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
