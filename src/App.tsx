import { useNavigationStore } from "./store/navigationStore";
import { useSchedulerInitialization } from "./hooks/useSchedulerInitialization";
import { HomePage } from "./pages/HomePage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { IconSprite } from "./components/IconSprite";
import { BackgroundShapes } from "./components/BackgroundShapes";
import "./App.css";

function App() {
  const { currentPage } = useNavigationStore();
  
  // Initialize scheduler on app startup
  useSchedulerInitialization();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'collections':
        return <CollectionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <main 
      className="h-screen overflow-y-auto bg-bg-gradient relative"
    >
      <IconSprite />
      <BackgroundShapes />
      <div className="max-w-md mx-auto h-full relative z-10">
        {renderCurrentPage()}
      </div>
    </main>
  );
}

export default App;