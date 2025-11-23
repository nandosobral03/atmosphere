import { useEffect } from "react";
import { useNavigationStore } from "./store/navigationStore";
import { useThemeStore } from "./store/themeStore";
import { useSchedulerInitialization } from "./hooks/useSchedulerInitialization";
import { useSchedulerSync } from "./hooks/useSchedulerSync";
import { HomePage } from "./pages/HomePage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { IconSprite } from "./components/IconSprite";
import { BackgroundShapes } from "./components/BackgroundShapes";
import "./App.css";

function App() {
  const { currentPage } = useNavigationStore();
  const { theme } = useThemeStore();

  useSchedulerInitialization();
  useSchedulerSync();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "collections":
        return <CollectionsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-bg-gradient relative">
      <IconSprite />
      <BackgroundShapes />
      <div className="max-w-md mx-auto min-h-screen relative z-10">{renderCurrentPage()}</div>
    </main>
  );
}

export default App;
