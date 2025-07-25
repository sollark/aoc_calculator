import React, { useCallback, useEffect } from "react";
import "./app.css";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { RecipeProvider } from "./contexts/RecipeContext";
import { useRecipeData } from "./hooks/useRecipeData";
import { useRecipeFiltering } from "./hooks/useRecipeFiltering";
import { useAppState } from "./hooks/useAppState";
import { useComponentCalculation } from "./hooks/useComponentCalculation";

/**
 * Main application component for the Ashes of Creation Calculator
 *
 * This component orchestrates the entire application by:
 * - Loading and managing recipe data from external sources
 * - Coordinating state between recipe management and component calculation
 * - Providing a unified interface for crafting calculations
 * - Handling loading states and error conditions gracefully
 *
 * The app follows a unidirectional data flow where recipe selections
 * flow down to component calculations, ensuring consistent state management.
 */
function App() {
  // Load recipe data from external sources (JSON files)
  // This hook handles initial data fetching and provides service functions
  // for recipe operations throughout the application
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Initialize global application state managers
  // These managers handle persistent state like user preferences,
  // selected recipes, and calculation settings
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  // Filter and prepare recipes for display in the UI
  // This hook applies any active filters and returns only recipes
  // that should be available for selection
  const availableRecipes = useRecipeFiltering(recipeServiceFunctions);

  // Track the current list of selected recipes for crafting
  // This state is managed here to coordinate between RecipeManagement
  // (which handles selection) and ComponentList (which displays results)
  const [currentRecipeList, setCurrentRecipeList] = React.useState([]);

  // Calculate the consolidated raw materials needed for all selected recipes
  // This hook processes the recipe list and breaks down complex recipes
  // into their base components, handling nested dependencies
  const consolidatedComponents = useComponentCalculation(
    currentRecipeList,
    recipeServiceFunctions
  );

  /**
   * Callback to update the recipe list when selections change in RecipeManagement
   * Uses useCallback to prevent unnecessary re-renders of child components
   *
   * @param {Array} newRecipeList - Updated list of selected recipes with quantities
   */
  const handleRecipeListChange = useCallback((newRecipeList) => {
    setCurrentRecipeList(newRecipeList);
  }, []);

  // Add this debug before calling useComponentCalculation
  useEffect(() => {
    console.log(
      "🔍 Current recipe list being passed to calculation:",
      currentRecipeList
    );
  }, [currentRecipeList]);

  // Show loading spinner while initial data is being fetched
  // This prevents the app from rendering with incomplete data
  if (isLoading || !isInitialized) {
    return <LoadingState message="Loading recipes..." />;
  }

  // Display error message if recipe data failed to load
  // This could be due to network issues, malformed data, or missing files
  if (error) {
    return <ErrorState message={`Loading recipes: ${error}`} />;
  }

  // Ensure state managers initialized successfully
  // This is a safety check to prevent runtime errors
  if (!stateManagers) {
    return <ErrorState message="Could not initialize application state" />;
  }

  // Verify that recipe data contains usable recipes
  // An empty recipe list indicates a data problem that should be addressed
  if (availableRecipes.length === 0) {
    return (
      <ErrorState message="No recipes available. Please check your recipe data." />
    );
  }

  // Render the main application interface
  // The layout is split into recipe selection (top) and results (bottom)
  return (
    <RecipeProvider
      recipeService={recipeServiceFunctions}
      stateManagers={stateManagers}
    >
      <div className="App">
        <header className="App-header">
          <h1>AoC Calculator</h1>
          <p>A helpful tool for crafting in Ashes of Creation</p>
        </header>

        <main className="App-main">
          {/* No allRecipes prop needed - gets it from context */}
          <RecipeManagement onRecipeListChange={handleRecipeListChange} />

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
    </RecipeProvider>
  );
}

export default App;
