import React, { useCallback } from "react";
import "./App.css";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { useRecipeData } from "./hooks/useRecipeData";
import { useRecipeFiltering } from "./hooks/useRecipeFiltering";
import { useAppState } from "./hooks/useAppState";
import { useComponentCalculation } from "./hooks/useComponentCalculation";

/**
 * Main application component for the AoC Calculator
 * Now simplified with RecipeManagement handling its own state
 */
function App() {
  // Initialize recipe data and services
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Initialize state managers
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  // Filter available recipes
  const availableRecipes = useRecipeFiltering(recipeServiceFunctions);

  // Track recipe list for component calculation (received from RecipeManagement)
  const [currentRecipeList, setCurrentRecipeList] = React.useState([]);

  // Calculate consolidated components based on current recipe list
  const consolidatedComponents = useComponentCalculation(
    currentRecipeList,
    recipeServiceFunctions
  );

  // Handle recipe list changes from RecipeManagement
  const handleRecipeListChange = useCallback((newRecipeList) => {
    setCurrentRecipeList(newRecipeList);
  }, []);

  // Loading state
  if (isLoading || !isInitialized) {
    return <LoadingState message="Loading recipes..." />;
  }

  // Error states
  if (error) {
    return <ErrorState message={`Loading recipes: ${error}`} />;
  }

  if (!stateManagers) {
    return <ErrorState message="Could not initialize application state" />;
  }

  if (availableRecipes.length === 0) {
    return (
      <ErrorState message="No recipes available. Please check your recipe data." />
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AoC Calculator</h1>
        <p>A helpful tool for crafting in Ashes of Creation</p>
      </header>

      <main className="App-main">
        <RecipeManagement
          allRecipes={availableRecipes}
          stateManagers={stateManagers}
          recipeServiceFunctions={recipeServiceFunctions}
          onRecipeListChange={handleRecipeListChange}
        />

        <ComponentList
          components={consolidatedComponents}
          title="Raw Materials Required"
          showQuantityControls={true}
          showBreakdown={true}
        />
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 AoC Calculator</p>
      </footer>
    </div>
  );
}

export default App;
