import React, { useState, useEffect } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeSelector from "./components/recipeSelector/RecipeSelector";
import ManageableRecipeList from "./components/manageableRecipeList/ManageableRecipeList";
import ComponentList from "./components/componentList/ComponentList";

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  // Combine all recipe arrays from your JSON structure
  const allRecipes = React.useMemo(
    () => [
      ...recipesData.processing_recipes,
      ...recipesData.crafted_components,
      ...recipesData.crafted_items,
    ],
    []
  );

  // Create lookup maps for easy access
  const recipeLookup = React.useMemo(() => {
    const lookup = {};
    allRecipes.forEach((recipe) => {
      lookup[recipe.name] = recipe;
      lookup[recipe.id] = recipe;
    });
    return lookup;
  }, [allRecipes]);

  const rawComponentsLookup = React.useMemo(() => {
    const lookup = {};
    recipesData.raw_components.forEach((component) => {
      lookup[component.name] = component;
      lookup[component.id] = component;
    });
    return lookup;
  }, []);

  console.log("All Recipes Loaded:", allRecipes);

  useEffect(() => {
    if (allRecipes.length > 0 && !selectedRecipe) {
      setSelectedRecipe(allRecipes[0].name);
    }
  }, [allRecipes, selectedRecipe]);

  // Function to recursively break down components to raw materials
  const breakDownToRawComponents = (
    componentName,
    quantity = 1,
    visited = new Set()
  ) => {
    // Prevent infinite recursion
    if (visited.has(componentName)) {
      console.warn(`Circular dependency detected for ${componentName}`);
      return [];
    }

    // Check if it's already a raw component
    if (rawComponentsLookup[componentName]) {
      return [
        {
          id: rawComponentsLookup[componentName].id,
          name: componentName,
          quantity: quantity,
          isRaw: true,
        },
      ];
    }

    // Check if it's a processing recipe
    const processingRecipe = recipeLookup[componentName];
    if (processingRecipe && processingRecipe.recipe?.components) {
      visited.add(componentName);

      const rawComponents = [];
      processingRecipe.recipe.components.forEach((component) => {
        const subComponents = breakDownToRawComponents(
          component.name,
          component.quantity * quantity,
          new Set(visited)
        );
        rawComponents.push(...subComponents);
      });

      visited.delete(componentName);
      return rawComponents;
    }

    // If not found in raw or processing, treat as unknown raw component
    console.warn(
      `Component ${componentName} not found in raw or processing recipes`
    );
    return [
      {
        id: `unknown_${componentName}`,
        name: componentName,
        quantity: quantity,
        isRaw: false,
        isUnknown: true,
      },
    ];
  };

  // Function to consolidate duplicate components
  const consolidateComponents = (components) => {
    const consolidated = {};

    components.forEach((component) => {
      const key = component.name;
      if (consolidated[key]) {
        consolidated[key].quantity += component.quantity;
      } else {
        consolidated[key] = { ...component };
      }
    });

    return Object.values(consolidated).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  // Extract and process all components from recipes
  useEffect(() => {
    if (recipeList.length === 0) {
      setConsolidatedComponents([]);
      return;
    }

    console.log(
      "Processing components for recipes:",
      recipeList.map((r) => r.name)
    );

    const allRawComponents = [];

    recipeList.forEach((recipe) => {
      if (recipe.recipe?.components) {
        recipe.recipe.components.forEach((component) => {
          const rawComponents = breakDownToRawComponents(
            component.name,
            component.quantity
          );
          allRawComponents.push(...rawComponents);
        });
      }
    });

    const consolidated = consolidateComponents(allRawComponents);
    console.log("Consolidated raw components:", consolidated);
    setConsolidatedComponents(consolidated);
  }, [recipeList, recipeLookup, rawComponentsLookup]);

  const handleAddRecipe = () => {
    const recipeData = allRecipes.find((r) => r.name === selectedRecipe);
    if (recipeData) {
      const isAlreadyAdded = recipeList.some(
        (recipe) => recipe.id === recipeData.id
      );

      if (!isAlreadyAdded) {
        console.log("Adding recipe:", recipeData);
        setRecipeList([...recipeList, recipeData]);
      } else {
        console.log("Recipe already in list:", recipeData.name);
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
