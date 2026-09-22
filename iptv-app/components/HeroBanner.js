import React from 'react';
import Link from 'next/link';
import { proxyImageUrl } from '../utils/apiClient';
import styles from './HeroBanner.module.css';

export default function HeroBanner({ item }) {
  if (!item) return <div className={styles.heroSkeleton}></div>;

  return (
    <div className={styles.heroContainer}>
      <div 
        className={styles.heroBackground} 
        style={{ backgroundImage: `url(${proxyImageUrl(item.stream_icon || item.cover) || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80'})` }}
      >
        <div className={styles.heroGradient}></div>
      </div>
      
      <div className={styles.heroContent}>
        <h1 className={styles.title}>{item.name}</h1>
        <div className={styles.metadata}>
          {item.rating && <span className={styles.rating}>★ {item.rating}</span>}
          {item.year && <span>{item.year}</span>}
          <span className={styles.tag}>{item.category_name || 'Destaque'}</span>
        </div>
        <p className={styles.description}>
          {item.plot || "Aproveite o melhor do entretenimento com a mais alta qualidade de streaming no seu novo aplicativo profissional."}
        </p>
        
        <div className={styles.actions}>
          <Link href={`/player/${item.stream_type === 'live' ? 'live' : (item.series_id ? 'series' : 'movie')}/${item.stream_id || item.series_id}`}>
            <button className={styles.playButton}>
              Assistir Agora
            </button>
          </Link>
          
          <Link href={item.stream_type === 'live' ? `/player/live/${item.stream_id}` : (item.series_id ? `/series/${item.series_id}` : `/movie/${item.stream_id || item.id}`)}>
            <button className={styles.infoButton}>
              Mais Informações
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
