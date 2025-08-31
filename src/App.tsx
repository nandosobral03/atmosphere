import { useNavigationStore } from "./store/navigationStore";
import { HomePage } from "./pages/HomePage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./App.css";

function App() {
  const { currentPage } = useNavigationStore();

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
      <div className="max-w-md mx-auto h-full">
        {renderCurrentPage()}
      </div>
    </main>
  );
}

export default App;