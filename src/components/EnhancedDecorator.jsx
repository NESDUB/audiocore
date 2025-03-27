import React, { useEffect, useState } from 'react';

/**
 * Dynamic Environment Decorator for Storybook
 * Creates a beautiful animated gradient background with subtle motion effects
 */
const EnhancedDecorator = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Add subtle animation effect
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 0.005) % 360);
    }, 50);

    // Track mouse movement for parallax effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calculate gradient positions based on mouse and animation
  const gradientX = 50 + Math.sin(animationPhase) * 10 + (mousePosition.x - 0.5) * 20;
  const gradientY = 50 + Math.cos(animationPhase) * 10 + (mousePosition.y - 0.5) * 20;

  // Calculate accent positions for visual interest
  const accentX = 50 + Math.cos(animationPhase * 1.3) * 30;
  const accentY = 50 + Math.sin(animationPhase * 1.5) * 30;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#0F172A', // Deep blue base
          backgroundImage: `
            radial-gradient(
              circle at ${gradientX}% ${gradientY}%,
              rgba(99, 102, 241, 0.15) 0%,
              rgba(99, 102, 241, 0.05) 40%,
              transparent 60%
            ),
            radial-gradient(
              circle at ${accentX}% ${accentY}%,
              rgba(217, 70, 239, 0.1) 0%,
              rgba(217, 70, 239, 0.03) 30%,
              transparent 60%
            ),
            radial-gradient(
              circle at ${100 - gradientX}% ${100 - gradientY}%,
              rgba(56, 189, 248, 0.12) 0%,
              rgba(56, 189, 248, 0.04) 35%,
              transparent 60%
            ),
            linear-gradient(
              135deg,
              rgba(17, 24, 39, 1) 0%,
              rgba(15, 23, 42, 1) 100%
            )
          `,
          zIndex: -1,
        }}
      >
        {/* Subtle animated dot pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(
                rgba(255, 255, 255, 0.15) 1px,
                transparent 1px
              )
            `,
            backgroundSize: '30px 30px',
            backgroundPosition: `${Math.sin(animationPhase) * 15}px ${Math.cos(animationPhase) * 15}px`,
            opacity: 0.4,
          }}
        />
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          padding: '2rem',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '3rem',
            maxWidth: '90%',
            display: 'inline-block',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default EnhancedDecorator;