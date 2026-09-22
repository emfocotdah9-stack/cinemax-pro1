"use client";
import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import Carousel from '../components/Carousel';
import styles from './page.module.css';

export default function AppHome() {
  const [activeTab, setActiveTab] = useState('home');
  const [heroItem, setHeroItem] = useState(null);
  
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [live, setLive] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Movies (VOD)
        const vodRes = await fetch('/api/xtream?action=get_vod_streams');
        const vodData = await vodRes.json();
        const topMovies = vodData.slice(0, 20);
        setMovies(topMovies);
        
        if (topMovies.length > 0) setHeroItem(topMovies[0]);

        // Fetch Series
        const seriesRes = await fetch('/api/xtream?action=get_series');
        const seriesData = await seriesRes.json();
        setSeries(seriesData.slice(0, 20));

        // Fetch Live
        const liveRes = await fetch('/api/xtream?action=get_live_streams');
        const liveData = await liveRes.json();
        setLive(liveData.slice(0, 20));
      } catch (error) {
        console.error("Error fetching Xtream data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.appContainer}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <div className={styles.logo}>IPTV Pro</div>
        <ul className={styles.navItems}>
          <li className={activeTab === 'home' ? styles.active : ''} onClick={() => setActiveTab('home')} tabIndex={0}>
            <span>🏠 Início</span>
          </li>
          <li className={activeTab === 'movies' ? styles.active : ''} onClick={() => setActiveTab('movies')} tabIndex={0}>
            <span>🎬 Filmes</span>
          </li>
          <li className={activeTab === 'series' ? styles.active : ''} onClick={() => setActiveTab('series')} tabIndex={0}>
            <span>📺 Séries</span>
          </li>
          <li className={activeTab === 'live' ? styles.active : ''} onClick={() => setActiveTab('live')} tabIndex={0}>
            <span>📡 TV Ao Vivo</span>
          </li>
        </ul>
        <div className={styles.settings}>
          <span>⚙️ Configurações</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <HeroBanner item={heroItem} />
        
        <div className={styles.contentRows}>
          <Carousel 
            title="Filmes em Destaque" 
            items={movies} 
            onFocusItem={setHeroItem} 
          />
          <Carousel 
            title="Séries Populares" 
            items={series} 
            onFocusItem={setHeroItem} 
          />
          <Carousel 
            title="Canais de TV" 
            items={live} 
            onFocusItem={setHeroItem} 
          />
        </div>
      </main>
    </div>
  );
}
