import React, { useState, useEffect } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeSelector from "./components/recipeSelector/RecipeSelector";
import ManageableRecipeList from "./components/manageableRecipeList/ManageableRecipeList";
import ComponentList from "./components/componentList/ComponentList";
import "./App.css";

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [allComponents, setAllComponents] = useState([]);

  // Combine all recipe arrays from your JSON structure
  const allRecipes = React.useMemo(
    () => [
      ...recipesData.processing_recipes,
      ...recipesData.crafted_components,
      ...recipesData.crafted_items,
    ],
    []
  );

  console.log("All Recipes Loaded:", allRecipes);

  useEffect(() => {
    if (allRecipes.length > 0 && !selectedRecipe) {
      setSelectedRecipe(allRecipes[0].name);
    }
  }, [allRecipes, selectedRecipe]);

  const handleAddRecipe = () => {
    const recipeData = allRecipes.find((r) => r.name === selectedRecipe);
    if (recipeData) {
      // Check if recipe is already in the list
      const isAlreadyAdded = recipeList.some(
        (recipe) => recipe.id === recipeData.id
      );

      if (!isAlreadyAdded) {
        console.log("Adding recipe:", recipeData);
        setRecipeList([...recipeList, recipeData]);
      } else {
        console.log("Recipe already in list:", recipeData.name);
        // Could show a toast notification here
      }
    }
  };

  const handleClearList = () => {
    setRecipeList([]);
  };

  const handleRemoveRecipe = (recipeId) => {
    setRecipeList(recipeList.filter((recipe) => recipe.id !== recipeId));
  };

  const handleRecipeChange = (recipeName) => {
    setSelectedRecipe(recipeName);
  };

  // Extract all components from recipes
  useEffect(() => {
    const components = recipeList.flatMap(
      (recipe) => recipe.recipe?.components || []
    );
    setAllComponents(components);
  }, [recipeList]);

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
          components={allComponents}
          title="All Required Components"
          showQuantityControls={false}
        />
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 AoC Calculator</p>
      </footer>
    </div>
  );
}

export default App;
