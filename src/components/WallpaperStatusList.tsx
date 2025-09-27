import { memo } from "react";
import { Card, Badge, StatusDot } from "./ui";
import { WallpaperThumbnail } from "./WallpaperThumbnail";
import { useWallpaperPriority } from "../hooks/useWallpaperPriority";
import { CurrentConditions, WallpaperSettings } from "../types";

interface WallpaperStatusListProps {
  currentConditions: CurrentConditions;
  settings: WallpaperSettings;
}

const WallpaperStatusListComponent = ({ currentConditions, settings }: WallpaperStatusListProps) => {
  const { potentialWallpapers } = useWallpaperPriority(currentConditions, settings);

  if (potentialWallpapers.length === 0) {
    return <div className="text-text-secondary text-sm">No enabled wallpapers for current conditions</div>;
  }

  return (
    <>
      {potentialWallpapers.map(({ category, setting, info }, index) => {
        const isActive = index === 0;
        const hasImage = true;

        return (
          <Card key={category} variant={isActive ? "success" : "info"} padding="md" className="flex items-center space-x-3">
            {isActive && hasImage && (
              <WallpaperThumbnail 
                imagePath={setting.imagePath!} 
                alt="Active wallpaper"
              />
            )}

            <StatusDot variant={isActive ? "success" : "info"} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <div className={`text-sm font-medium ${isActive ? "text-success" : "text-text-primary"}`}>
                  {info?.label || category}
                </div>
                <Badge variant={isActive ? "success" : "info"} size="xs">
                  {isActive ? "ACTIVE" : "READY"}
                </Badge>
              </div>
              <div className="text-xs text-text-secondary">
                Priority: {setting.priority} • #{index + 1}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

export const WallpaperStatusList = memo(WallpaperStatusListComponent);