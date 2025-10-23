import { useState, useEffect } from 'react';

export const useAnimationPreferences = () => {
  const [preferences, setPreferences] = useState({
    animationsEnabled: true,
    backgroundType: 'gradient',
    backgroundIntensity: 50,
    clickSparkEnabled: true,
    textAnimations: true,
    glitchEffects: false,
    prefersReducedMotion: false
  });

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('animationPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse animation preferences:', error);
      }
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPreferences(prev => ({
      ...prev,
      prefersReducedMotion: mediaQuery.matches
    }));

    const handleChange = (e) => {
      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion: e.matches
      }));
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const updatePreferences = (newPreferences) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('animationPreferences', JSON.stringify(updated));
  };

  const toggleAnimations = () => {
    updatePreferences({ animationsEnabled: !preferences.animationsEnabled });
  };

  const setBackgroundType = (type) => {
    updatePreferences({ backgroundType: type });
  };

  const setBackgroundIntensity = (intensity) => {
    updatePreferences({ backgroundIntensity: intensity });
  };

  const toggleClickSpark = () => {
    updatePreferences({ clickSparkEnabled: !preferences.clickSparkEnabled });
  };

  const toggleTextAnimations = () => {
    updatePreferences({ textAnimations: !preferences.textAnimations });
  };

  const toggleGlitchEffects = () => {
    updatePreferences({ glitchEffects: !preferences.glitchEffects });
  };

  return {
    preferences,
    updatePreferences,
    toggleAnimations,
    setBackgroundType,
    setBackgroundIntensity,
    toggleClickSpark,
    toggleTextAnimations,
    toggleGlitchEffects
  };
};

export default useAnimationPreferences;