import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { useRecipeData } from "./hooks/useRecipeData";
import { useRecipeManagement } from "./hooks/useRecipeManagement";
import {
  initializeDefaultRecipe,
  logInitializationData,
  createStateManagers,
} from "./services/appStateService";

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  // ✅ FIXED: Update to match new JSON structure
  const allRecipes = useMemo(
    () => [...recipesData.intermediate_recipes, ...recipesData.crafted_items],
    []
  );

  // Initialize recipe data and services using custom hook
  const { recipeLookups, rawComponentLookups, recipeServiceFunctions } =
    useRecipeData(allRecipes, recipesData.raw_components);

  // Create state management functions
  const stateManagers = useMemo(
    () => createStateManagers(setRecipeList, recipeServiceFunctions),
    [recipeServiceFunctions]
  );

  // Get recipe management handlers
  const {
    handleAddRecipe,
    handleRemoveRecipe,
    handleClearList,
    handleRecipeChange,
  } = useRecipeManagement(
    stateManagers,
    recipeServiceFunctions,
    setSelectedRecipe
  );

  // Log initialization data (development only)
  useEffect(() => {
    logInitializationData(allRecipes, recipeLookups, rawComponentLookups);
  }, [allRecipes, recipeLookups, rawComponentLookups]);

  // Initialize default recipe selection
  useEffect(() => {
    const defaultRecipe = initializeDefaultRecipe(allRecipes, selectedRecipe);
    if (defaultRecipe !== selectedRecipe) {
      setSelectedRecipe(defaultRecipe);
    }
  }, [allRecipes, selectedRecipe]);

  // Process recipe list to extract consolidated components
  useEffect(() => {
    const consolidated =
      recipeServiceFunctions.processRecipeListToRawComponents(recipeList);
    setConsolidatedComponents(consolidated);
  }, [recipeList, recipeServiceFunctions]);

  // Memoized add recipe handler for performance
  const handleAddRecipeToList = useCallback(() => {
    handleAddRecipe(recipeList, selectedRecipe);
  }, [handleAddRecipe, recipeList, selectedRecipe]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AoC Calculator</h1>
        <p>A helpful tool for crafting in Ashes of Creation</p>
      </header>

      <main className="App-main">
        <RecipeManagement
          allRecipes={allRecipes}
          selectedRecipe={selectedRecipe}
          recipeList={recipeList}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipeToList}
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
