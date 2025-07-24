import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeSelector from "./components/recipeSelector/RecipeSelector";
import ManageableRecipeList from "./components/manageableRecipeList/ManageableRecipeList";
import ComponentList from "./components/componentList/ComponentList";
import { useRecipeData } from "./hooks/useRecipeData"; // Named import
import {
  initializeDefaultRecipe,
  logInitializationData,
  createStateManagers,
} from "./services/appStateService"; // Named imports

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  // Combine all recipe arrays from JSON structure
  const allRecipes = useMemo(
    () => [
      ...recipesData.processing_recipes,
      ...recipesData.crafted_components,
      ...recipesData.crafted_items,
    ],
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

  // Event handlers using service functions
  const handleAddRecipe = useCallback(() => {
    const result = recipeServiceFunctions.addRecipeToList(
      recipeList,
      selectedRecipe
    );
    stateManagers.handleRecipeAddition(result);
  }, [selectedRecipe, recipeList, recipeServiceFunctions, stateManagers]);

  const handleClearList = useCallback(() => {
    stateManagers.clearRecipeList();
  }, [stateManagers]);

  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      stateManagers.handleRecipeRemoval(recipeId);
    },
    [stateManagers]
  );

  const handleRecipeChange = useCallback((recipeName) => {
    setSelectedRecipe(recipeName);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AoC Calculator</h1>
        <p>A helpful tool for crafting in Ashes of Creation</p>
      </header>

      <main>
        <RecipeSelector
          recipes={allRecipes}
          selectedRecipe={selectedRecipe}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipe}
          recipeListCount={recipeList.length}
        />

        <ManageableRecipeList
          recipes={recipeList}
          onRemoveRecipe={handleRemoveRecipe}
          onClearList={handleClearList}
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
