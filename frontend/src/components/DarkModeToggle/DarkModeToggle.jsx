import React, { useState, useEffect } from 'react'
import './DarkModeToggle.css'

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <button className={`dark-mode-toggle ${isDark ? 'dark' : ''}`} onClick={toggleDarkMode} aria-label="Toggle dark mode">
      <span className="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
};

export default DarkModeToggle;

