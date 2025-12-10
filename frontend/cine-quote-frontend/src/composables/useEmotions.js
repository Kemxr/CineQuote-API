export function useEmotions() {
  const emotionIcons = {
    joie: '😊',
    tristesse: '😭',
    amour: '❤️',
    nostalgie: '🌙',
    anxiété: '🚩',
    peur: '😨'
  };

  const emotions = [
    { id: 'tout', label: 'Tout', icon: '⭐' },
    { id: 'joie', label: 'Joie', icon: '😊' },
    { id: 'tristesse', label: 'Tristesse', icon: '😭' },
    { id: 'amour', label: 'Amour', icon: '❤️' },
    { id: 'nostalgie', label: 'Nostalgie', icon: '🌙' },
    { id: 'anxiété', label: 'Anxiété', icon: '🚩' }
  ];

  function getEmotionIcon(emotion) {
    return emotionIcons[emotion?.toLowerCase()] || '⭐';
  }

  return {
    emotions,
    emotionIcons,
    getEmotionIcon
  };
}
