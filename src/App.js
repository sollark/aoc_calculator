import React, { useState, useEffect } from "react";
import "./App.css";
import recipesData from "./db/recipes.json";
import RecipeSelector from "./components/recipeSelector/RecipeSelector";
import ManageableRecipeList from "./components/manageableRecipeList/ManageableRecipeList";
import ComponentList from "./components/componentList/ComponentList";
import {
  createRecipeLookups,
  createRawComponentLookups,
  findRecipe,
  findRawComponent,
  consolidateComponentsById,
} from "./utils/recipeUtils";

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  // Combine all recipe arrays from JSON structure
  const allRecipes = React.useMemo(
    () => [
      ...recipesData.processing_recipes,
      ...recipesData.crafted_components,
      ...recipesData.crafted_items,
    ],
    []
  );

  // Create efficient lookup maps using utility functions
  const recipeLookups = React.useMemo(
    () => createRecipeLookups(allRecipes),
    [allRecipes]
  );

  const rawComponentLookups = React.useMemo(
    () => createRawComponentLookups(recipesData.raw_components),
    []
  );

  // Optimized finder functions using lookups
  const findRecipeByIdentifier = React.useCallback(
    (identifier) => findRecipe(recipeLookups, allRecipes, identifier),
    [recipeLookups, allRecipes]
  );

  const findRawComponentByIdentifier = React.useCallback(
    (identifier) =>
      findRawComponent(
        rawComponentLookups,
        recipesData.raw_components,
        identifier
      ),
    [rawComponentLookups]
  );

  console.log("All Recipes Loaded:", allRecipes);
  console.log("Recipe Lookups:", recipeLookups);
  console.log("Raw Component Lookups:", rawComponentLookups);

  useEffect(() => {
    if (allRecipes.length > 0 && !selectedRecipe) {
      setSelectedRecipe(allRecipes[0].name);
    }
  }, [allRecipes, selectedRecipe]);

  /**
   * Pure function to recursively break down components to raw materials
   * @param {string} componentName - Name of component to break down
   * @param {number} quantity - Quantity needed
   * @param {Set} visited - Set of visited components to prevent cycles
   * @returns {Array} Array of raw components
   */
  const breakDownToRawComponents = React.useCallback(
    (componentName, quantity = 1, visited = new Set()) => {
      // Prevent infinite recursion
      if (visited.has(componentName)) {
        console.warn(`Circular dependency detected for ${componentName}`);
        return [];
      }

      // Check if it's already a raw component
      const rawComponent = findRawComponentByIdentifier(componentName);
      if (rawComponent) {
        return [
          {
            id: rawComponent.id,
            name: componentName,
            quantity: quantity,
            isRaw: true,
            description: rawComponent.description,
          },
        ];
      }

      // Check if it's a processing recipe
      const processingRecipe = findRecipeByIdentifier(componentName);
      if (processingRecipe?.recipe?.components) {
        const newVisited = new Set(visited);
        newVisited.add(componentName);

        const rawComponents = processingRecipe.recipe.components.flatMap(
          (component) =>
            breakDownToRawComponents(
              component.name,
              component.quantity * quantity,
              newVisited
            )
        );

        return rawComponents;
      }

      // Component not found - treat as unknown
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
    },
    [findRawComponentByIdentifier, findRecipeByIdentifier]
  );

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

    // Process all components using functional approach
    const allRawComponents = recipeList
      .filter((recipe) => recipe.recipe?.components)
      .flatMap((recipe) =>
        recipe.recipe.components.flatMap((component) =>
          breakDownToRawComponents(component.name, component.quantity)
        )
      );

    const consolidated = consolidateComponentsById(allRawComponents);
    console.log("Consolidated raw components:", consolidated);
    setConsolidatedComponents(consolidated);
  }, [recipeList, breakDownToRawComponents]);

  // Event handlers
  const handleAddRecipe = React.useCallback(() => {
    const recipeData = findRecipeByIdentifier(selectedRecipe);
    if (recipeData) {
      const isAlreadyAdded = recipeList.some(
        (recipe) => recipe.id === recipeData.id
      );

      if (!isAlreadyAdded) {
        console.log("Adding recipe:", recipeData);
        setRecipeList((prev) => [...prev, recipeData]);
      } else {
        console.log("Recipe already in list:", recipeData.name);
      }
    }
  }, [selectedRecipe, recipeList, findRecipeByIdentifier]);

  const handleClearList = React.useCallback(() => {
    setRecipeList([]);
  }, []);

  const handleRemoveRecipe = React.useCallback((recipeId) => {
    setRecipeList((prev) => prev.filter((recipe) => recipe.id !== recipeId));
  }, []);

  const handleRecipeChange = React.useCallback((recipeName) => {
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
