import React, { useState, useCallback, useEffect } from "react";
import "./app.css";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { RecipeProvider } from "./contexts/RecipeContext";
import { RecipeListProvider } from "./contexts/RecipeListContext.jsx"; // ✅ ADD THIS
import { useRecipeData } from "./hooks/useRecipeData";
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
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Initialize global application state managers
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  // Track the current list of selected recipes for crafting
  const [currentRecipeList, setCurrentRecipeList] = useState([]);

  // Calculate the consolidated raw materials needed for all selected recipes
  const consolidatedComponents = useComponentCalculation(currentRecipeList);

  /**
   * Callback to update the recipe list when selections change in RecipeManagement
   * Uses useCallback to prevent unnecessary re-renders of child components
   *
   * @param {Array} newRecipeList - Updated list of selected recipes with quantities
   */
  const handleRecipeListChange = useCallback((newRecipeList) => {
    console.log("📱 App - Recipe list changed:", newRecipeList);
    setCurrentRecipeList(newRecipeList);
  }, []);

  // Debug logging
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
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  // Ensure state managers initialized successfully
  // This is a safety check to prevent runtime errors
  if (!stateManagers) {
    return <ErrorState message="Failed to initialize application state" />;
  }

  // Render the main application interface
  // The layout is split into recipe selection (top) and results (bottom)
  return (
    <RecipeProvider
      recipeService={recipeServiceFunctions}
      stateManagers={stateManagers}
    >
      <RecipeListProvider>
        <div className="App">
          <header className="App-header">
            <h1>🏗️ Ashes of Creation Calculator</h1>
            <p>Plan your crafting recipes and calculate required components.</p>
          </header>

          <main className="App-main">
            <section className="App-section">
              <h2>📋 Recipe Management</h2>
              {/* No allRecipes prop needed - gets it from context */}
              <RecipeManagement onRecipeListChange={handleRecipeListChange} />
            </section>

            <section className="App-section">
              <h2>🧱 Required Components</h2>
              <ComponentList
                components={consolidatedComponents}
                title="Consolidated Components"
                showQuantityControls={true}
                showBreakdown={true}
              />
            </section>
          </main>

          <footer className="App-footer">
            <p>&copy; 2025 AoC Calculator</p>
          </footer>
        </div>
      </RecipeListProvider>
    </RecipeProvider>
  );
}

export default App;
