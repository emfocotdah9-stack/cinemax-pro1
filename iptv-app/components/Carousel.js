import React, { useRef, useState } from 'react';
import styles from './Carousel.module.css';
import { getFavorites, saveFavorite, removeFavorite, isFavorite } from '../utils/favorites';

import Link from 'next/link';

export default function Carousel({ title, items, onFocusItem, type = 'movie' }) {
  const [dummy, setDummy] = useState(0);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselTitle}>{title}</h2>
      
      <div className={styles.carouselWrapper}>
        <button 
          className={`${styles.scrollButton} ${styles.scrollLeft}`}
          onClick={() => scroll('left')}
          aria-label="Scroll Left"
        >
          &#10094;
        </button>

        <div className={styles.scrollArea} ref={scrollRef}>
          <div className={styles.rail}>
          {items.map((item, idx) => {
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
              setDummy(dummy + 1);
            };

            return (
              <Link href={href} key={id || idx}>
                <div 
                  className={styles.card}
                  tabIndex={0}
                  onFocus={() => onFocusItem && onFocusItem(item)}
                >
                  <div 
                    className={styles.cardImage} 
                    style={{ backgroundImage: `url(${item.stream_icon || item.cover || 'https://via.placeholder.com/300x450/1a1f2e/ffffff?text=No+Image'})` }}
                  >
                    <button 
                      className={styles.favBtn}
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
          })}
        </div>
      </div>

        <button 
          className={`${styles.scrollButton} ${styles.scrollRight}`}
          onClick={() => scroll('right')}
          aria-label="Scroll Right"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
}
