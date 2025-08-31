import { useNavigationStore } from "./store/navigationStore";
import { useSchedulerInitialization } from "./hooks/useSchedulerInitialization";
import { HomePage } from "./pages/HomePage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { IconSprite } from "./components/IconSprite";
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
    <main className="h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <IconSprite />
      <div className="max-w-md mx-auto h-full">
        {renderCurrentPage()}
      </div>
    </main>
  );
}

export default App;