import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
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

  // Initialize recipe data and services using custom hook
  const { recipeServiceFunctions, isLoading, error, isInitialized } =
    useRecipeData();

  // Get all recipes from the service instead of direct import
  const allRecipes = useMemo(() => {
    if (!recipeServiceFunctions) return [];

    try {
      // Get all recipes using the service
      const recipes = recipeServiceFunctions.getAllRecipes();
      // Filter to only intermediate and crafted items (excluding raw components)
      return recipes.filter(
        (recipe) =>
          recipe.type === "intermediate_recipes" ||
          recipe.type === "crafted_items"
      );
    } catch (error) {
      console.error("Error getting recipes:", error);
      return [];
    }
  }, [recipeServiceFunctions]);

  // Create state management functions
  const stateManagers = useMemo(() => {
    if (!isInitialized || !recipeServiceFunctions) {
      return null;
    }
    return createStateManagers(recipeServiceFunctions);
  }, [isInitialized, recipeServiceFunctions]);

  // Initialize default recipe selection
  useEffect(() => {
    if (allRecipes.length > 0) {
      const defaultRecipe = initializeDefaultRecipe(allRecipes, selectedRecipe);
      if (defaultRecipe !== selectedRecipe) {
        setSelectedRecipe(defaultRecipe);
      }
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
      // Log more details for debugging
      console.log("Selected recipe:", selectedRecipe);
      console.log(
        "Available recipes:",
        allRecipes.map((r) => r.name)
      );
    }
  }, [stateManagers, recipeList, selectedRecipe, allRecipes]);

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
    if (isInitialized && allRecipes.length > 0) {
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

  // Show message if no recipes available
  if (allRecipes.length === 0) {
    return (
      <div className="App">
        <div>No recipes available. Please check your recipe data.</div>
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
