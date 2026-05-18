import React, { useRef, useEffect } from 'react';

interface ThreadsProps {
  color?: string; // Optional hex or rgb color override
  amplitude?: number; // Multiplier for wave height (default 1)
  distance?: number; // Distance/offset between individual thread strands (default 10)
  enableMouseInteraction?: boolean; // Enable interactive cursor pulling (default true)
  speed?: number; // Wave speed multiplier (default 1)
}

export const Threads: React.FC<ThreadsProps> = ({
  color,
  amplitude = 1,
  distance = 15,
  enableMouseInteraction = true,
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // Strands definition (each strand represents a moving glowing thread)
    const totalStrands = 10;
    const phases = Array.from({ length: totalStrands }, (_, i) => i * (Math.PI / 4));
    const waveSpeeds = Array.from({ length: totalStrands }, (_, i) => (0.015 + (i * 0.003)) * speed);
    const frequencies = Array.from({ length: totalStrands }, (_, i) => 0.002 + (i * 0.0004));
    
    // Theme colors: combination of purple (#8B5CF6), gold/amber (#F59E0B), and indigo
    const strandColors = [
      'rgba(139, 92, 246, 0.25)', // Slate Purple
      'rgba(245, 158, 11, 0.18)', // Sleek Gold
      'rgba(79, 70, 229, 0.22)',  // Indigo
      'rgba(168, 85, 247, 0.20)', // Bright Purple
      'rgba(251, 191, 36, 0.15)', // Warm Gold Accent
      'rgba(99, 102, 241, 0.18)', // Slate Indigo
      'rgba(124, 58, 237, 0.22)', // Deep Violet
      'rgba(217, 119, 6, 0.16)',  // Dark Gold
      'rgba(147, 51, 234, 0.24)', // Fuchsia Purple
      'rgba(253, 224, 71, 0.12)', // Subtle Light Gold
    ];

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a subtle radial background glow
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Draw each thread strand
      for (let i = 0; i < totalStrands; i++) {
        // Increment phase for wave movement
        phases[i] += waveSpeeds[i];

        ctx.beginPath();
        
        // Settings for this strand
        const baseHeight = height / 2 + (i - totalStrands / 2) * distance;
        const currentAmplitude = (35 + Math.sin(phases[i] * 0.5) * 15) * amplitude;
        const freq = frequencies[i];
        
        ctx.lineWidth = i % 3 === 0 ? 2 : 1.2;

        // Custom color option or themed gradient color
        if (color) {
          ctx.strokeStyle = color;
        } else {
          ctx.strokeStyle = strandColors[i % strandColors.length];
        }

        // Draw points across the width of the canvas
        for (let x = 0; x <= width; x += 4) {
          // Standard sinewave path
          let y = baseHeight + Math.sin(x * freq + phases[i]) * currentAmplitude;

          // Adding secondary high-frequency ripple for realism
          y += Math.cos(x * 0.01 + phases[i] * 2) * 5;

          // Cursor interactive bending physics
          if (enableMouseInteraction && mouseRef.current.active) {
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;
            const distanceToMouse = Math.abs(x - mouseX);
            const pullRadius = 300;

            if (distanceToMouse < pullRadius) {
              // Smooth gaussian influence bell curve
              const influence = Math.pow(1 - distanceToMouse / pullRadius, 2.5);
              // Attract/deform the thread coordinate toward the mouse
              y += (mouseY - y) * influence * 0.55;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Glow layer for a highly premium glass-screen look
        ctx.shadowBlur = 12;
        ctx.shadowColor = i % 2 === 0 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        ctx.stroke();
        
        // Reset shadows for optimization
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanups
    return () => {
      window.removeEventListener('resize', handleResize);
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, amplitude, distance, enableMouseInteraction, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-auto"
      style={{ mixBlendMode: 'screen', opacity: 0.85 }}
    />
  );
};

export default Threads;
