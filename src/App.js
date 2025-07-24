import React from "react";
import "./App.css";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { LoadingState } from "./components/ui/LoadingState";
import { ErrorState } from "./components/ui/ErrorState";
import { useRecipeData } from "./hooks/useRecipeData";
import { useRecipeFiltering } from "./hooks/useRecipeFiltering";
import { useRecipeSelection } from "./hooks/useRecipeSelection";
import { useRecipeList } from "./hooks/useRecipeList";
import { useComponentCalculation } from "./hooks/useComponentCalculation";
import { useAppState } from "./hooks/useAppState";

/**
 * Main application component for the AoC Calculator
 * Manages recipe selection, recipe list, and component calculation
 */
function App() {
  // Initialize recipe data and services
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Initialize state managers
  const stateManagers = useAppState(recipeServiceFunctions, isInitialized);

  // Filter available recipes
  const availableRecipes = useRecipeFiltering(recipeServiceFunctions);

  // Manage recipe selection
  const { selectedRecipe, handleRecipeChange } =
    useRecipeSelection(availableRecipes);

  // Manage recipe list
  const { recipeList, handleAddRecipe, handleRemoveRecipe, handleClearList } =
    useRecipeList(stateManagers);

  // Calculate consolidated components
  const consolidatedComponents = useComponentCalculation(
    recipeList,
    recipeServiceFunctions
  );

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

  // Enhanced add recipe handler that includes selected recipe
  const handleAddRecipeWithSelection = () => {
    handleAddRecipe(selectedRecipe);
  };

  // Main application render
  return (
    <div className="App">
      <header className="App-header">
        <h1>AoC Calculator</h1>
        <p>A helpful tool for crafting in Ashes of Creation</p>
      </header>

      <main className="App-main">
        <RecipeManagement
          allRecipes={availableRecipes}
          selectedRecipe={selectedRecipe}
          recipeList={recipeList}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipeWithSelection}
          onRemoveRecipe={handleRemoveRecipe}
          onClearList={handleClearList}
          stateManagers={stateManagers}
          recipeServiceFunctions={recipeServiceFunctions}
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
