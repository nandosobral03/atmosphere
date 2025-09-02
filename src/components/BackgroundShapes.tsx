import React from 'react';

export function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Organic Shape 1 - Top Left */}
      <div 
        className="absolute -top-20 -left-20 w-80 h-80 opacity-10 blur-3xl"
        style={{
          background: 'var(--color-coral)',
          borderRadius: '50px 100px 75px 25px',
          animation: 'float-1 20s ease-in-out infinite'
        }}
      />
      
      {/* Organic Shape 2 - Top Right */}
      <div 
        className="absolute -top-32 -right-16 w-64 h-96 opacity-[0.08] blur-3xl"
        style={{
          background: 'var(--color-yellow)',
          borderRadius: '75px 25px 100px 50px',
          animation: 'float-2 25s ease-in-out infinite reverse'
        }}
      />
      
      {/* Organic Shape 3 - Middle */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.06] blur-3xl"
        style={{
          background: 'var(--color-purple)',
          borderRadius: '100px 50px 25px 75px',
          animation: 'float-3 30s ease-in-out infinite'
        }}
      />
      
      {/* Organic Shape 4 - Bottom Left */}
      <div 
        className="absolute -bottom-24 -left-32 w-96 h-64 opacity-[0.08] blur-3xl"
        style={{
          background: 'var(--color-cyan)',
          borderRadius: '25px 75px 50px 100px',
          animation: 'float-4 22s ease-in-out infinite reverse'
        }}
      />
      
      {/* Organic Shape 5 - Bottom Right */}
      <div 
        className="absolute -bottom-16 -right-20 w-60 h-80 opacity-10 blur-3xl"
        style={{
          background: 'var(--color-green)',
          borderRadius: '60px 30px 90px 40px',
          animation: 'float-5 18s ease-in-out infinite'
        }}
      />
    </div>
  );
}