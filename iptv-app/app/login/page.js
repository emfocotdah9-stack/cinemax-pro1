"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const creds = localStorage.getItem('xtream_credentials');
    if (creds) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!url || !username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      // Create test fetch to validate credentials
      // We call the proxy to get user_info
      let cleanUrl = url.trim();
      
      const res = await fetch('/api/xtream?action=get_vod_categories', {
        headers: {
          'x-xtream-url': cleanUrl,
          'x-xtream-user': username.trim(),
          'x-xtream-pass': password.trim()
        }
      });

      if (!res.ok) {
        throw new Error('Credenciais ou Servidor inválidos.');
      }

      const data = await res.json();
      
      // If we got valid json array, it means success
      if (Array.isArray(data) || data.user_info) {
        const credentials = {
          url: cleanUrl,
          username: username.trim(),
          password: password.trim()
        };
        localStorage.setItem('xtream_credentials', JSON.stringify(credentials));
        router.push('/');
      } else {
        throw new Error('Servidor não retornou dados válidos.');
      }
      
    } catch (err) {
      console.error(err);
      setError('Falha ao conectar. Verifique o Servidor, Usuário e Senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundOverlay}></div>
      
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>CineMax</h1>
          <p className={styles.subtitle}>Acesso Premium</p>
        </div>

        {error && (
          <div className={styles.errorMsg}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.formGroup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>URL do Servidor</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="http://exemplo.com:80"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Usuário</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Senha</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'Conectando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
