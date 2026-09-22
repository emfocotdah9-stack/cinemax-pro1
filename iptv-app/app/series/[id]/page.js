"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFavorites, saveFavorite, removeFavorite, isFavorite } from '../../../utils/favorites';
import styles from './series.module.css';

export default function SeriesDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();

  const [seriesInfo, setSeriesInfo] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodesMap, setEpisodesMap] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite('series', id));
  }, [id]);

  const handleFavorite = () => {
    if (isFav) {
      removeFavorite('series', id);
      setIsFav(false);
    } else {
      if (seriesInfo) {
        // Build a minimal item object for saving
        const itemToSave = {
          series_id: id,
          name: seriesInfo.name,
          cover: seriesInfo.cover,
          stream_type: 'series'
        };
        saveFavorite('series', itemToSave);
        setIsFav(true);
      }
    }
  };

  useEffect(() => {
    const fetchSeriesInfo = async () => {
      try {
        const res = await fetch(`/api/xtream?action=get_series_info&series_id=${id}`);
        const data = await res.json();
        
        if (data.info) {
          setSeriesInfo(data.info);
          setSeasons(data.seasons || []);
          setEpisodesMap(data.episodes || {});
          
          if (data.seasons && data.seasons.length > 0) {
            // Select the first season by default
            setSelectedSeason(data.seasons[0].season_number || Object.keys(data.episodes)[0]);
          } else if (data.episodes && Object.keys(data.episodes).length > 0) {
            setSelectedSeason(Object.keys(data.episodes)[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching series info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesInfo();
  }, [id]);

  if (isLoading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Carregando informações da série...</div>;
  }

  if (!seriesInfo) {
    return <div style={{ color: 'white', padding: '2rem' }}>Erro ao carregar série. Tente novamente.</div>;
  }

  const episodes = selectedSeason ? (episodesMap[selectedSeason] || []) : [];

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={() => router.push('/')}>
        <span>⬅️</span>
      </button>

      <div 
        className={styles.backdrop} 
        style={{ backgroundImage: `url(${seriesInfo.backdrop_path && seriesInfo.backdrop_path.length > 0 ? seriesInfo.backdrop_path[0] : seriesInfo.cover})` }}
      ></div>

      <div className={styles.content}>
        <div className={styles.infoSection}>
          <div 
            className={styles.poster}
            style={{ backgroundImage: `url(${seriesInfo.cover})` }}
          ></div>
          
          <div className={styles.details}>
            <h1 className={styles.title}>{seriesInfo.name}</h1>
            <div className={styles.meta}>
              {seriesInfo.releaseDate && <span>Ano: {new Date(seriesInfo.releaseDate).getFullYear() || seriesInfo.year}</span>}
              {seriesInfo.genre && <span>{seriesInfo.genre}</span>}
              {seriesInfo.rating && <span>⭐ {seriesInfo.rating} / 10</span>}
            </div>
            <div className={styles.actionSection}>
              <button 
                className={styles.favButton} 
                onClick={handleFavorite}
                title={isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                {isFav ? '⭐ Favorito' : '☆ Favoritar'}
              </button>
            </div>
            <p className={styles.plot}>{seriesInfo.plot}</p>
            {seriesInfo.cast && <p className={styles.cast}><strong>Elenco:</strong> {seriesInfo.cast}</p>}
            {seriesInfo.director && <p className={styles.cast}><strong>Direção:</strong> {seriesInfo.director}</p>}
          </div>
        </div>

        <div className={styles.seasonsSection}>
          {seasons.length > 0 && (
            <div className={styles.seasonTabs}>
              {seasons.map((season) => (
                <button
                  key={season.season_number}
                  className={`${styles.seasonPill} ${selectedSeason === season.season_number ? styles.active : ''}`}
                  onClick={() => setSelectedSeason(season.season_number)}
                >
                  {season.name || `Temporada ${season.season_number}`}
                </button>
              ))}
            </div>
          )}

          <div className={styles.episodesGrid}>
            {episodes.map((ep, idx) => {
              const nextEp = episodes[idx + 1];
              let nextParam = nextEp ? `?next=${nextEp.id}` : '?next=none';
              
              if (!nextEp) {
                // Try finding the first episode of the next season
                const seasonKeys = Object.keys(episodesMap).map(Number).sort((a,b)=>a-b);
                const currentSeasonIdx = seasonKeys.indexOf(Number(selectedSeason));
                if (currentSeasonIdx >= 0 && currentSeasonIdx < seasonKeys.length - 1) {
                  const nextSeasonNum = seasonKeys[currentSeasonIdx + 1];
                  if (episodesMap[nextSeasonNum] && episodesMap[nextSeasonNum].length > 0) {
                    nextParam = `?next=${episodesMap[nextSeasonNum][0].id}`;
                  }
                }
              }

              const extraParams = `&series_id=${id}&season=${selectedSeason}&ep_num=${ep.episode_num}`;
              
              return (
              <Link href={`/player/series/${ep.id}${nextParam}${extraParams}`} key={ep.id}>
                <div className={styles.episodeCard} tabIndex={0}>
                  <div 
                    className={styles.episodeImage}
                    style={{ backgroundImage: `url(${ep.info.movie_image || seriesInfo.cover})` }}
                  >
                    <div className={styles.playIcon}>▶️</div>
                  </div>
                  <div className={styles.episodeInfo}>
                    <h3 className={styles.episodeTitle}>
                      {ep.episode_num}. {ep.title || `Episódio ${ep.episode_num}`}
                    </h3>
                    <div className={styles.episodeMeta}>
                      {ep.info.duration && <span>{ep.info.duration}</span>}
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
