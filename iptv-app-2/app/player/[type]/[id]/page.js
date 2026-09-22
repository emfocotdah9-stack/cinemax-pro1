"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './player.module.css';

export default function PlayerPage({ params }) {
  const unwrappedParams = React.use(params);
  const { type, id } = unwrappedParams;
  const videoRef = useRef(null);
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carregar HLS.js via CDN dinamicamente
    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => initializePlayer();
    } else {
      initializePlayer();
    }

    let hls;

    function initializePlayer() {
      let targetUrl = '';
      
      // Xtream Codes stream URL format
      const XTREAM_BASE = 'http://shangaicb.site:80';
      const USER = 'weslleyxc';
      const PASS = 'Cliente10';

      if (type === 'live') {
        targetUrl = `${XTREAM_BASE}/live/${USER}/${PASS}/${id}.m3u8`;
      } else if (type === 'movie') {
        targetUrl = `${XTREAM_BASE}/movie/${USER}/${PASS}/${id}.mp4`;
      } else if (type === 'series') {
        targetUrl = `${XTREAM_BASE}/series/${USER}/${PASS}/${id}.mp4`;
      }

      const video = videoRef.current;
      if (!video) return;

      if (window.Hls && window.Hls.isSupported() && targetUrl.endsWith('.m3u8')) {
        hls = new window.Hls();
        hls.loadSource(targetUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.warn("Autoplay blocked by browser policy."));
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            setError('Erro ao carregar o stream. Tente novamente mais tarde.');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = targetUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.warn("Autoplay blocked by browser policy."));
        });
      } else {
        // Direct MP4 fallback for movies/series
        video.src = targetUrl;
        video.play().catch(e => console.warn("Autoplay blocked by browser policy."));
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [id, type]);

  return (
    <div className={styles.playerContainer}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <span>⬅️</span>
      </button>
      
      {error && (
        <div className={styles.errorMessage}>
          <h2>{error}</h2>
        </div>
      )}

      <video 
        ref={videoRef} 
        className={styles.videoPlayer} 
        controls 
        autoPlay
      ></video>
    </div>
  );
}
