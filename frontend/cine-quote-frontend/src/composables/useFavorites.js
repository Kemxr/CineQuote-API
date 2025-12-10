import { ref } from 'vue';

export function useFavorites() {
  const favorites = ref([]);

  async function fetchFavorites() {
    try {
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        favorites.value = (data || []).map(q => q._id);
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
    }
  }

  function isFavorite(quoteId) {
    return favorites.value.includes(quoteId);
  }

  async function toggleFavorite(quoteId) {
    try {
      if (isFavorite(quoteId)) {
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ quoteId })
        });

        if (response.ok) {
          favorites.value = favorites.value.filter(id => id !== quoteId);
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ quoteId })
        });

        if (response.ok) {
          favorites.value.push(quoteId);
        } else if (response.status === 401) {
          alert('Veuillez vous connecter pour ajouter des favoris');
        } else {
          const data = await response.json();
          alert(data.message || 'Erreur lors de l\'ajout aux favoris');
        }
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
      alert('Erreur lors de la modification des favoris');
    }
  }

  return {
    favorites,
    fetchFavorites,
    isFavorite,
    toggleFavorite
  };
}
