"use client";
import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchXtream, getCredentials } from '../../../../utils/apiClient';
import styles from './player.module.css';

export default function PlayerPage({ params }) {
  const unwrappedParams = use(params);
  const { type, id } = unwrappedParams;
  const videoRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const seriesId = searchParams.get('series_id');
  
  const [error, setError] = useState(null);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [epInfo, setEpInfo] = useState(null);
  const [nextEpId, setNextEpId] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Fetch series info to find current episode details and next episode
  useEffect(() => {
    if (type !== 'series' || !seriesId) return;

    const fetchSeries = async () => {
      try {
        const data = await fetchXtream('get_series_info', `series_id=${seriesId}`);
        
        if (data.episodes) {
          // Flatten all episodes into a single sorted array
          const seasonKeys = Object.keys(data.episodes).map(Number).sort((a,b)=>a-b);
          let allEps = [];
          for (let s of seasonKeys) {
            allEps = allEps.concat(data.episodes[s]);
          }

          // Find current
          const currentIdx = allEps.findIndex(e => String(e.id) === String(id));
          if (currentIdx !== -1) {
            setEpInfo({
              season: allEps[currentIdx].season,
              episode: allEps[currentIdx].episode_num,
              title: allEps[currentIdx].title
            });
            
            // Set next episode
            if (currentIdx < allEps.length - 1) {
              setNextEpId(allEps[currentIdx + 1].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch series info in player", err);
      }
    };
    fetchSeries();
  }, [id, type, seriesId]);

  // Hide overlay after 8 seconds
  useEffect(() => {
    if (!epInfo) return;
    setShowOverlay(true);
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [epInfo]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (nextEpId && video.duration > 0) {
      const timeLeft = video.duration - video.currentTime;
      if (timeLeft <= 180 && !showNextBtn) {
        setShowNextBtn(true);
      } else if (timeLeft > 180 && showNextBtn) {
        setShowNextBtn(false);
      }
    }
  };

  useEffect(() => {
    let hls;

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

    function initializePlayer() {
      let targetUrl = '';
      
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      // Format URL to remove trailing slash or player_api.php
      let baseUrl = creds.url;
      if (baseUrl.endsWith('/player_api.php')) {
        baseUrl = baseUrl.replace('/player_api.php', '');
      } else if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const XTREAM_BASE = baseUrl;
      const USER = creds.username;
      const PASS = creds.password;

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
      <button className={styles.backButton} onClick={() => seriesId ? router.push(`/series/${seriesId}`) : router.back()}>
        <span>⬅️</span>
      </button>
      
      {epInfo && showOverlay && (
        <div className={`${styles.epOverlay} ${showOverlay ? styles.visible : ''}`}>
          Temporada {epInfo.season} - Episódio {epInfo.episode}
          {epInfo.title && <span className={styles.epTitleName}>: {epInfo.title}</span>}
        </div>
      )}
      
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
        onTimeUpdate={handleTimeUpdate}
      ></video>

      {showNextBtn && nextEpId && (
        <Link href={`/player/series/${nextEpId}?series_id=${seriesId}`} className={styles.nextEpisodeBtn}>
          ⏭️ Próximo Episódio
        </Link>
      )}
    </div>
  );
}
