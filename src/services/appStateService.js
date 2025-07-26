import { consolidateComponentsById } from "../utils/recipeUtils.js";

/**
 * Pure function to initialize default recipe selection
 * @param {Array} allRecipes - All available recipes
 * @param {string} currentSelection - Current selected recipe
 * @returns {string} Recipe name to select
 */
export const initializeDefaultRecipe = (allRecipes, currentSelection) => {
  if (allRecipes.length > 0 && !currentSelection) {
    return allRecipes[0].name;
  }
  return currentSelection;
};

/**
 * Pure function to log application initialization data
 * @param {Array} allRecipes - All loaded recipes
 * @param {Object} recipeLookups - Recipe lookup maps
 * @param {Object} rawComponentLookups - Raw component lookup maps
 */
export const logInitializationData = (
  allRecipes,
  recipeLookups,
  rawComponentLookups
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("All Recipes Loaded:", allRecipes);
    console.log("Recipe Lookups:", recipeLookups);
    console.log("Raw Component Lookups:", rawComponentLookups);
  }
};

/**
 * Higher-order function that creates a recipe addition handler
 * @param {Function} setRecipeList - State setter function
 * @returns {Function} Function that handles recipe addition results
 */
export const createRecipeAdditionHandler = (setRecipeList) => (result) => {
  if (result.success) {
    setRecipeList((prev) => [...prev, result.data]);
  }
  // Could add toast notifications here based on result.message
  return result;
};

/**
 * Higher-order function that creates a recipe removal handler
 * @param {Function} removeFunction - Function to remove recipe
 * @param {Function} setRecipeList - State setter function
 * @returns {Function} Function that handles recipe removal
 */
export const createRecipeRemovalHandler =
  (removeFunction, setRecipeList) => (recipeId) => {
    const updatedList = removeFunction(recipeId);
    setRecipeList(updatedList);
    return updatedList;
  };

/**
 * Create state management functions
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Object} Composed state management functions
 */
export const createStateManagers = (
  recipeServiceFunctions,
  setRecipeList,
  getRecipeList
) => {
  if (!recipeServiceFunctions) {
    console.error("recipeServiceFunctions is null or undefined");
    return null;
  }

  const {
    removeRecipeFromList = () => [],
    processRecipeListToRawComponents = () => [],
    addRecipe = () => ({
      success: false,
      message: "Function not available",
    }),
  } = recipeServiceFunctions;

  // Recipe list management
  const createRecipeListManager = (setRecipeList, getRecipeList) => {
    return {
      addRecipe: (recipeData) => {
        try {
          console.log("🔍 addRecipe called with:", recipeData);
          console.log("🔍 Recipe type:", typeof recipeData);
          console.log(
            "🔍 Recipe keys:",
            recipeData ? Object.keys(recipeData) : "no keys"
          );

          // Check if setRecipeList is a function
          if (typeof setRecipeList !== "function") {
            console.error(
              "❌ setRecipeList is not a function:",
              typeof setRecipeList
            );
            return {
              success: false,
              message: "setRecipeList is not available",
              newList: [],
            };
          }

          // Use setState callback to get current state and update it
          setRecipeList((currentList) => {
            console.log("🔍 setState callback - currentList:", currentList);
            console.log(
              "🔍 setState callback - currentList length:",
              currentList.length
            );

            const safeCurrentList = Array.isArray(currentList)
              ? currentList
              : [];

            // Handle both string and object recipes
            let recipeToAdd = recipeData;
            let recipeId;

            if (typeof recipeData === "string") {
              // If it's a string, we need to find the full recipe object
              console.warn(
                "⚠️ Recipe passed as string, this should be fixed in RecipeSelector"
              );
              recipeId = recipeData; // Use string as ID for comparison
              // For now, create a minimal object
              recipeToAdd = { name: recipeData, id: recipeData };
            } else if (recipeData && typeof recipeData === "object") {
              recipeId = recipeData.id || recipeData.name;
            } else {
              console.error("❌ Invalid recipe data:", recipeData);
              return currentList;
            }

            // Check if recipe already exists
            const alreadyExists = safeCurrentList.some((item) => {
              if (typeof item.recipe === "string") {
                return item.recipe === recipeId;
              } else if (item.recipe && typeof item.recipe === "object") {
                return (
                  item.recipe.id === recipeId || item.recipe.name === recipeId
                );
              }
              return false;
            });

            if (alreadyExists) {
              console.log("🔍 Recipe already exists in list - not adding");
              return currentList;
            }

            // Create new recipe list item
            const newItem = {
              id: Date.now(),
              recipe: recipeToAdd, // Store the full object or temporary object
              quantity: 1,
            };

            console.log("🔍 New item being created:", newItem);

            const newList = [...safeCurrentList, newItem];
            console.log("🔍 New list:", newList);
            console.log("🔍 New list length:", newList.length);

            return newList;
          });

          return {
            success: true,
            message: "Recipe added to list",
            newList: [], // We can't return the actual new list here, but that's ok
          };
        } catch (error) {
          console.error("Error adding recipe:", error);
          return {
            success: false,
            message: "Error adding recipe",
            newList: [],
          };
        }
      },

      removeRecipe: (recipeId) => {
        try {
          const currentList = getRecipeList ? getRecipeList() : [];
          return removeRecipeFromList(currentList, recipeId);
        } catch (error) {
          console.error("Error removing recipe:", error);
          return [];
        }
      },

      processToRawComponents: (recipeList) => {
        try {
          return processRecipeListToRawComponents(recipeList);
        } catch (error) {
          console.error("Error processing recipe list:", error);
          return [];
        }
      },
    };
  };

  // Raw components management
  const createRawComponentsManager = () => {
    return {
      updateQuantity: (components, componentId, newQuantity) => {
        return components.map((component) =>
          component.id === componentId
            ? { ...component, quantity: Math.max(0, newQuantity) }
            : component
        );
      },

      addCustomComponent: (components, componentData) => {
        const newComponent = {
          id: `custom_${Date.now()}`,
          name: componentData.name,
          quantity: componentData.quantity || 1,
          isCustom: true,
          ...componentData,
        };
        return [...components, newComponent];
      },

      removeComponent: (components, componentId) => {
        return components.filter((component) => component.id !== componentId);
      },

      consolidateComponents: (components) => {
        try {
          return consolidateComponentsById(components);
        } catch (error) {
          console.error("Error consolidating components:", error);
          return components;
        }
      },
    };
  };

  // Application state management
  const createAppStateManager = () => {
    return {
      resetToDefaults: () => ({
        recipeList: [],
        rawComponents: [],
        activeTab: "recipes",
        filters: {},
      }),

      updateFilters: (currentState, newFilters) => ({
        ...currentState,
        filters: { ...currentState.filters, ...newFilters },
      }),

      switchTab: (currentState, tabName) => ({
        ...currentState,
        activeTab: tabName,
      }),
    };
  };

  // Return all managers
  return {
    recipeList: createRecipeListManager(
      setRecipeList,
      getRecipeList // Pass getRecipeList directly
    ),
    rawComponents: createRawComponentsManager(),
    appState: createAppStateManager(),

    // Utility functions
    utils: {
      isServiceReady: () => Boolean(recipeServiceFunctions),
      getAvailableFunctions: () => Object.keys(recipeServiceFunctions || {}),
    },
  };
};

// Default export
export default createStateManagers;
