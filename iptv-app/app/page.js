"use client";
import React, { useEffect, useState, useRef } from 'react';
import HeroBanner from '../components/HeroBanner';
import Carousel from '../components/Carousel';
import { getFavorites, saveFavorite, removeFavorite, isFavorite } from '../utils/favorites';
import styles from './page.module.css';

import Link from 'next/link';

export default function AppHome() {
  const [activeTab, setActiveTab] = useState('home');
  const [heroItem, setHeroItem] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Home Data
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [live, setLive] = useState([]);

  // Category Data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  
  // Search Data
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allTabItems, setAllTabItems] = useState([]);
  
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Fetch Categories when Tab changes
  useEffect(() => {
    // Clear search state on tab change
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    setAllTabItems([]);

    if (activeTab === 'home') return;
    
    const fetchCategories = async () => {
      setCategories([]);
      setSelectedCategory(null);
      setCategoryItems([]);
      
      let action = '';
      if (activeTab === 'movies') action = 'get_vod_categories';
      if (activeTab === 'series') action = 'get_series_categories';
      if (activeTab === 'live') action = 'get_live_categories';
      
      try {
        const res = await fetch(`/api/xtream?action=${action}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories([{ category_id: 'favorites', category_name: '⭐ Favoritos' }, ...data]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [activeTab]);

  // Fetch items for selected category
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchCategoryItems = async () => {
      setIsLoadingCategory(true);
      setCategoryItems([]);
      
      if (selectedCategory === 'favorites') {
        const favType = activeTab === 'movies' ? 'movie' : activeTab;
        setCategoryItems(getFavorites(favType));
        setIsLoadingCategory(false);
        return;
      }
      
      let action = '';
      if (activeTab === 'movies') action = 'get_vod_streams';
      if (activeTab === 'series') action = 'get_series';
      if (activeTab === 'live') action = 'get_live_streams';
      
      try {
        const res = await fetch(`/api/xtream?action=${action}&category_id=${selectedCategory}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategoryItems(data);
        }
      } catch (error) {
        console.error("Error fetching category items:", error);
      } finally {
        setIsLoadingCategory(false);
      }
    };
    fetchCategoryItems();
  }, [selectedCategory, activeTab]);

  // Handle Search Input Focus - Preload data
  const handleSearchFocus = async () => {
    if (activeTab === 'home') return;
    if (allTabItems.length > 0) return; // already loaded
    
    let action = '';
    if (activeTab === 'movies') action = 'get_vod_streams';
    if (activeTab === 'series') action = 'get_series';
    if (activeTab === 'live') action = 'get_live_streams';
    
    try {
      const res = await fetch(`/api/xtream?action=${action}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllTabItems(data);
      }
    } catch (error) {
      console.error("Error fetching all items for search:", error);
    }
  };

  // Handle Search Query Change
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const query = searchQuery.toLowerCase();
      const results = allTabItems.filter(item => 
        (item.name || item.title || '').toLowerCase().includes(query)
      );
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery, allTabItems]);

  return (
    <div className={`${styles.appContainer} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          {!isSidebarCollapsed && <div className={styles.logo}>IPTV Pro</div>}
          <button 
            className={styles.collapseToggle} 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isSidebarCollapsed ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            )}
          </button>
        </div>
        <ul className={styles.navItems}>
          <li className={activeTab === 'home' ? styles.active : ''} onClick={() => setActiveTab('home')} tabIndex={0} title="Início">
            <span>🏠 {!isSidebarCollapsed && 'Início'}</span>
          </li>
          <li className={activeTab === 'movies' ? styles.active : ''} onClick={() => setActiveTab('movies')} tabIndex={0} title="Filmes">
            <span>🎬 {!isSidebarCollapsed && 'Filmes'}</span>
          </li>
          <li className={activeTab === 'series' ? styles.active : ''} onClick={() => setActiveTab('series')} tabIndex={0} title="Séries">
            <span>📺 {!isSidebarCollapsed && 'Séries'}</span>
          </li>
          <li className={activeTab === 'live' ? styles.active : ''} onClick={() => setActiveTab('live')} tabIndex={0} title="TV Ao Vivo">
            <span>📡 {!isSidebarCollapsed && 'TV Ao Vivo'}</span>
          </li>
        </ul>
        <div className={styles.settings} title="Configurações">
          <span>⚙️ {!isSidebarCollapsed && 'Configurações'}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {activeTab !== 'home' && (
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder={`Pesquisar em ${activeTab === 'movies' ? 'Filmes' : activeTab === 'series' ? 'Séries' : 'Canais'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        )}

        {!isSearching && <HeroBanner item={heroItem} />}
        
        
        {!isSearching && activeTab !== 'home' && categories.length > 0 && (
          <div className={styles.categoriesWrapper}>
            <button 
              className={`${styles.categoryScrollBtn} ${styles.scrollLeft}`}
              onClick={() => scrollCategories('left')}
            >
              &#10094;
            </button>
            <div className={styles.categoriesBar} ref={categoryScrollRef}>
              {categories.map((cat) => (
                <button 
                  key={cat.category_id} 
                  className={`${styles.categoryPill} ${selectedCategory === cat.category_id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.category_id)}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
            <button 
              className={`${styles.categoryScrollBtn} ${styles.scrollRight}`}
              onClick={() => scrollCategories('right')}
            >
              &#10095;
            </button>
          </div>
        )}

        {isSearching && (
          <div className={styles.gridContainer} style={{ marginTop: '2rem' }}>
            {searchResults.length === 0 && searchQuery.length > 2 ? (
              <h2 style={{color: '#fff', gridColumn: '1 / -1', textAlign: 'center'}}>Nenhum resultado encontrado para "{searchQuery}"</h2>
            ) : (
              searchResults.map((item, idx) => {
                const id = item.stream_id || item.series_id;
                const itemType = activeTab === 'live' ? 'live' : (item.series_id ? 'series' : 'movie');
                
                let href = `/player/${itemType}/${id}`;
                if (itemType === 'series') href = `/series/${id}`;
                if (itemType === 'movie') href = `/movie/${id}`;

                const isFav = isFavorite(itemType, id);

                const handleFavoriteClick = (e) => {
                  e.preventDefault();
                  if (isFav) {
                    removeFavorite(itemType, id);
                  } else {
                    const itemToSave = {
                      stream_id: item.stream_id || undefined,
                      series_id: item.series_id || undefined,
                      name: item.name || item.title,
                      cover: item.cover,
                      stream_icon: item.stream_icon,
                      stream_type: itemType
                    };
                    saveFavorite(itemType, itemToSave);
                  }
                  // Force re-render search results by updating a generic state or just setCategoryItems for now?
                  // Wait, modifying search results array needs to trigger re-render
                  setAllTabItems([...allTabItems]);
                };

                return (
                  <Link href={href} key={`search-${id}-${idx}`}>
                    <div 
                      className={styles.card}
                      onMouseEnter={() => setHeroItem(item)}
                      onFocus={() => setHeroItem(item)}
                      tabIndex={0}
                    >
                      <div 
                        className={styles.cardImage} 
                        style={{ backgroundImage: `url(${item.stream_icon || item.cover || 'https://via.placeholder.com/300x450/1a1f2e/ffffff?text=No+Image'})` }}
                      >
                        <button 
                          className={styles.liveFavBtn}
                          onClick={handleFavoriteClick}
                          title="Favoritar"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{item.name || item.title}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {!isSearching && activeTab !== 'home' && selectedCategory && (
          <div className={styles.gridContainer}>
            {isLoadingCategory ? (
              <h2 style={{color: '#fff', gridColumn: '1 / -1', textAlign: 'center'}}>Carregando...</h2>
            ) : (
              categoryItems.map((item, idx) => {
                const id = item.stream_id || item.series_id;
                const itemType = item.stream_type === 'live' ? 'live' : (item.series_id ? 'series' : 'movie');
                
                let href = `/player/${itemType}/${id}`;
                if (itemType === 'series') href = `/series/${id}`;
                if (itemType === 'movie') href = `/movie/${id}`;

                const isFav = isFavorite(itemType, id);

                const handleFavoriteClick = (e) => {
                  e.preventDefault();
                  if (isFav) {
                    removeFavorite(itemType, id);
                  } else {
                    const itemToSave = {
                      stream_id: item.stream_id || undefined,
                      series_id: item.series_id || undefined,
                      name: item.name || item.title,
                      cover: item.cover,
                      stream_icon: item.stream_icon,
                      stream_type: itemType
                    };
                    saveFavorite(itemType, itemToSave);
                  }
                  // Force re-render
                  setCategoryItems([...categoryItems]);
                };

                return (
                  <Link href={href} key={id || idx}>
                    <div 
                      className={styles.card}
                      onMouseEnter={() => setHeroItem(item)}
                      onFocus={() => setHeroItem(item)}
                      tabIndex={0}
                    >
                      <div 
                        className={styles.cardImage} 
                        style={{ backgroundImage: `url(${item.stream_icon || item.cover || 'https://via.placeholder.com/300x450/1a1f2e/ffffff?text=No+Image'})` }}
                      >
                        <button 
                          className={styles.liveFavBtn}
                          onClick={handleFavoriteClick}
                          title="Favoritar"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{item.name}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'home' && (
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
        )}
      </main>
    </div>
  );
}
