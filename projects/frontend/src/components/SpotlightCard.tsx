import { useEffect, useRef } from 'react';
import './SpotlightCard.css';

// Global trackers for last known screen mouse coordinates
let globalMouseX = -9999;
let globalMouseY = -9999;

if (typeof window !== 'undefined') {
  const trackMouse = (e: MouseEvent) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  };
  window.addEventListener('mousemove', trackMouse);
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(255, 255, 255, 0.25)' 
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const updateSpotlight = () => {
    if (!divRef.current || globalMouseX === -9999) return;
    const rect = divRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to this card's viewport position
    const x = globalMouseX - rect.left;
    const y = globalMouseY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
    updateSpotlight();
  };

  useEffect(() => {
    const handleScroll = () => {
      updateSpotlight();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial run to capture cursor if it is already over the element
    updateSpotlight();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [spotlightColor]);

  return (
    <div 
      ref={divRef} 
      onMouseMove={handleMouseMove} 
      onMouseEnter={updateSpotlight}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
