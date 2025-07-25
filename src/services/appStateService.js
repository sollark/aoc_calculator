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
export const createStateManagers = (recipeServiceFunctions) => {
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
  const createRecipeListManager = () => {
    return {
      addRecipe: (currentList, recipeData) => {
        try {
          // Use the recipe's actual type, not "recipes"
          const recipeType = recipeData.type;

          if (!recipeType) {
            return {
              success: false,
              newList: currentList,
              message: "Recipe type not found",
            };
          }

          const result = addRecipe(recipeType, recipeData);

          if (result.success) {
            // For a recipe list, we want to add to the current list, not the database
            // This should just add to the current list for calculation purposes
            const newListItem = {
              id: Date.now(), // Unique ID for the list item
              recipe: recipeData,
              quantity: 1, // Default quantity
            };

            return {
              success: true,
              newList: [...currentList, newListItem],
              message: "Recipe added to list",
            };
          }

          return {
            success: false,
            newList: currentList,
            message: result.message,
          };
        } catch (error) {
          console.error("Error adding recipe:", error);
          return {
            success: false,
            newList: currentList,
            message: "Error adding recipe",
          };
        }
      },

      removeRecipe: (currentList, recipeId) => {
        try {
          return removeRecipeFromList(currentList, recipeId);
        } catch (error) {
          console.error("Error removing recipe:", error);
          return currentList;
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
    recipeList: createRecipeListManager(),
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
