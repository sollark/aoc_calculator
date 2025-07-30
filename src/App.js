import React, { useState, useCallback, useEffect } from "react";
import "./app.css";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { AvailableListProvider } from "./contexts/AvailableListContext.js";
import { SelectedListProvider } from "./contexts/SelectedListContext.js";
import { useRecipeData } from "./hooks/useRecipeData";
import { useAppState } from "./hooks/useAppState";
import { useComponentCalculation } from "./hooks/useComponentCalculation";

/**
 * Main application component for the Ashes of Creation Calculator
 */
function App() {
  // Load recipe data from external sources (JSON files)
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Initialize global application state managers
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  // Use consolidated components directly from context-driven hook
  const consolidatedComponents = useComponentCalculation();

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
    <AvailableListProvider
      recipeService={recipeServiceFunctions}
      stateManagers={stateManagers}
    >
      <SelectedListProvider>
        <div className="App">
          <header className="App-header">
            <h1>🏗️ Ashes of Creation Calculator</h1>
            <p>Plan your crafting recipes and calculate required components.</p>
          </header>

          <main className="App-main">
            <section className="App-section">
              <h2>📋 Recipe Management</h2>
              <RecipeManagement />
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
      </SelectedListProvider>
    </AvailableListProvider>
  );
}

export default App;
