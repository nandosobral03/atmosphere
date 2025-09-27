import { memo, useCallback } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";

interface WallpaperThumbnailProps {
  imagePath: string;
  alt: string;
  className?: string;
}

const WallpaperThumbnailComponent = ({ imagePath, alt, className = "" }: WallpaperThumbnailProps) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    target.nextElementSibling?.classList.remove("hidden");
  }, []);

  return (
  <div className={`w-16 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0 ${className}`}>
    <img
      src={convertFileSrc(imagePath)}
      alt={alt}
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
    <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-xs">
      No Preview
    </div>
  </div>
  );
};

export const WallpaperThumbnail = memo(WallpaperThumbnailComponent);