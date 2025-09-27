import React from 'react';

export type IconName =
  | 'thunderstorm' | 'rain' | 'snow' | 'fog' | 'cloudy' | 'sunny'
  | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'dusk'
  | 'night' | 'late-night' | 'home' | 'gallery' | 'settings'
  | 'palette' | 'weather' | 'time' | 'tools' | 'default' | 'loading'
  | 'partly-cloudy' | 'check' | 'upload' | 'download' | 'close' | 'folder';

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}