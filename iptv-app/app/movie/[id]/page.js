"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFavorites, saveFavorite, removeFavorite, isFavorite } from '../../../utils/favorites';
import { fetchXtream, proxyImageUrl } from '../../../utils/apiClient';
import styles from './movie.module.css';

export default function MovieDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();

  const [movieInfo, setMovieInfo] = useState(null);
  const [movieData, setMovieData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite('movie', id));
  }, [id]);

  const handleFavorite = () => {
    if (isFav) {
      removeFavorite('movie', id);
      setIsFav(false);
    } else {
      if (movieInfo) {
        // Build a minimal item object for saving
        const itemToSave = {
          stream_id: id,
          name: movieInfo.name,
          stream_icon: movieInfo.cover_big || movieInfo.cover || movieInfo.movie_image,
          stream_type: 'movie'
        };
        saveFavorite('movie', itemToSave);
        setIsFav(true);
      }
    }
  };

  useEffect(() => {
    const fetchMovieInfo = async () => {
      try {
        const data = await fetchXtream('get_vod_info', `vod_id=${id}`);
        
        if (data.info) {
          setMovieInfo(data.info);
          setMovieData(data.movie_data);
        }
      } catch (error) {
        console.error("Error fetching movie info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieInfo();
  }, [id]);

  if (isLoading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Carregando informações do filme...</div>;
  }

  if (!movieInfo) {
    return <div style={{ color: 'white', padding: '2rem' }}>Erro ao carregar filme. Tente novamente.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={() => router.push('/')}>
        <span>⬅️</span>
      </button>

      <div 
        className={styles.backdrop} 
        style={{ backgroundImage: `url(${proxyImageUrl(movieInfo.backdrop_path && movieInfo.backdrop_path.length > 0 ? movieInfo.backdrop_path[0] : movieInfo.cover_big || movieInfo.cover || movieInfo.movie_image)})` }}
      ></div>

      <div className={styles.content}>
        <div className={styles.infoSection}>
          <div 
            className={styles.poster}
            style={{ backgroundImage: `url(${proxyImageUrl(movieInfo.cover_big || movieInfo.cover || movieInfo.movie_image)})` }}
          ></div>
          
          <div className={styles.details}>
            <h1 className={styles.title}>{movieInfo.name}</h1>
            <div className={styles.meta}>
              {movieInfo.releaseDate && <span>Ano: {new Date(movieInfo.releaseDate).getFullYear() || movieInfo.year || movieInfo.releasedate}</span>}
              {movieInfo.genre && <span>{movieInfo.genre}</span>}
              {movieInfo.rating && <span>⭐ {movieInfo.rating} / 10</span>}
              {movieInfo.duration && <span>⏱️ {movieInfo.duration}</span>}
            </div>
            <p className={styles.plot}>{movieInfo.plot || movieInfo.description}</p>
            {movieInfo.cast && <p className={styles.cast}><strong>Elenco:</strong> {movieInfo.cast}</p>}
            {movieInfo.director && <p className={styles.cast}><strong>Direção:</strong> {movieInfo.director}</p>}
            
            <div className={styles.actionSection}>
              <Link href={`/player/movie/${id}`} className={styles.playButton} tabIndex={0}>
                ▶️ Assistir Agora
              </Link>
              
              <button 
                className={styles.favButton} 
                onClick={handleFavorite}
                title={isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                {isFav ? '⭐ Favorito' : '☆ Favoritar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
