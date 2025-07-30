import "./app.css";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { AvailableRecipeListProvider } from "./contexts/AvailableRecipeListContext.js";
import { SelectedRecipeListProvider } from "./contexts/SelectedRecipeListContext.js";
import { useRecipeData } from "./hooks/useRecipeData";
import { useAppState } from "./hooks/useAppState";
import InnerApp from "./components/InnerApp.jsx";

/**
 * Main application component for the Ashes of Creation Calculator
 */
function App() {
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  if (isLoading || !isInitialized) {
    return <LoadingState message="Loading recipes..." />;
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!stateManagers) {
    return <ErrorState message="Failed to initialize application state" />;
  }

  return (
    <AvailableRecipeListProvider
      recipeService={recipeServiceFunctions}
      stateManagers={stateManagers}
    >
      <SelectedRecipeListProvider>
        <InnerApp />
      </SelectedRecipeListProvider>
    </AvailableRecipeListProvider>
  );
}

export default App;
