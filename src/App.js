import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { useRecipeData } from "./hooks/useRecipeData";
import {
  initializeDefaultRecipe,
  logInitializationData,
  createStateManagers,
} from "./services/appStateService";

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  // Create all recipes array from JSON structure
  const allRecipes = useMemo(
    () => [...recipesData.intermediate_recipes, ...recipesData.crafted_items],
    []
  );

  // Initialize recipe data and services using custom hook
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Create state management functions
  const stateManagers = useMemo(() => {
    if (!isInitialized || !recipeServiceFunctions) {
      return null;
    }
    return createStateManagers(recipeServiceFunctions);
  }, [isInitialized, recipeServiceFunctions]);

  // Initialize default recipe selection
  useEffect(() => {
    const defaultRecipe = initializeDefaultRecipe(allRecipes, selectedRecipe);
    if (defaultRecipe !== selectedRecipe) {
      setSelectedRecipe(defaultRecipe);
    }
  }, [allRecipes, selectedRecipe]);

  // Process recipe list to extract consolidated components
  useEffect(() => {
    if (recipeServiceFunctions && recipeList.length > 0) {
      try {
        const consolidated =
          recipeServiceFunctions.processRecipeListToRawComponents(recipeList);
        setConsolidatedComponents(consolidated);
      } catch (error) {
        console.error("Error processing recipe list:", error);
        setConsolidatedComponents([]);
      }
    } else {
      setConsolidatedComponents([]);
    }
  }, [recipeList, recipeServiceFunctions]);

  // Recipe management handlers
  const handleRecipeChange = useCallback((recipeName) => {
    setSelectedRecipe(recipeName);
  }, []);

  const handleAddRecipe = useCallback(() => {
    if (!stateManagers || !selectedRecipe) return;

    const result = stateManagers.recipeList.addRecipe(
      recipeList,
      selectedRecipe
    );
    if (result.success) {
      setRecipeList(result.newList);
    } else {
      console.warn("Failed to add recipe:", result.message);
    }
  }, [stateManagers, recipeList, selectedRecipe]);

  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      if (!stateManagers) return;

      const updatedList = stateManagers.recipeList.removeRecipe(
        recipeList,
        recipeId
      );
      setRecipeList(updatedList);
    },
    [stateManagers, recipeList]
  );

  const handleClearList = useCallback(() => {
    setRecipeList([]);
    setConsolidatedComponents([]);
  }, []);

  // Log initialization data (development only)
  useEffect(() => {
    if (isInitialized) {
      logInitializationData(allRecipes, {}, {});
    }
  }, [allRecipes, isInitialized]);

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="App">
        <div>Loading recipes...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="App">
        <div>Error loading recipes: {error}</div>
      </div>
    );
  }

  // Show error if state managers couldn't be created
  if (!stateManagers) {
    return (
      <div className="App">
        <div>Error: Could not initialize application state</div>
      </div>
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
          allRecipes={allRecipes}
          selectedRecipe={selectedRecipe}
          recipeList={recipeList}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipe}
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
