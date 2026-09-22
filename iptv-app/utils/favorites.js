export const getFavorites = (type) => {
  if (typeof window === 'undefined') return [];
  try {
    const favs = localStorage.getItem(`favorites_${type}`);
    return favs ? JSON.parse(favs) : [];
  } catch (error) {
    console.error("Error reading favorites", error);
    return [];
  }
};

export const saveFavorite = (type, item) => {
  if (typeof window === 'undefined') return;
  try {
    const favs = getFavorites(type);
    const id = item.stream_id || item.series_id || item.id;
    const exists = favs.find(f => (f.stream_id || f.series_id || f.id) === id);
    
    if (!exists) {
      favs.push(item);
      localStorage.setItem(`favorites_${type}`, JSON.stringify(favs));
    }
  } catch (error) {
    console.error("Error saving favorite", error);
  }
};

export const removeFavorite = (type, id) => {
  if (typeof window === 'undefined') return;
  try {
    const favs = getFavorites(type);
    const newFavs = favs.filter(f => (f.stream_id || f.series_id || f.id) !== id);
    localStorage.setItem(`favorites_${type}`, JSON.stringify(newFavs));
  } catch (error) {
    console.error("Error removing favorite", error);
  }
};

export const isFavorite = (type, id) => {
  const favs = getFavorites(type);
  return favs.some(f => (f.stream_id || f.series_id || f.id) === id);
};
