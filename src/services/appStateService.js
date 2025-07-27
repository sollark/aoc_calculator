import { consolidateComponentsById } from "../utils/recipeUtils.js";

/**
 * Pure function to remove a recipe from a list by ID
 * @param {Array} recipeList - Current recipe list
 * @param {string|number} recipeId - ID of recipe to remove
 * @returns {Array} New list without the specified recipe
 */
const removeRecipeFromList = (recipeList, recipeId) => {
  console.log("🔍 removeRecipeFromList called with:", { recipeList, recipeId });
  console.log("🔍 recipeList length:", recipeList.length);
  console.log("🔍 recipeId type:", typeof recipeId);

  if (!Array.isArray(recipeList)) {
    console.error("❌ recipeList is not an array:", recipeList);
    return [];
  }

  const filteredList = recipeList.filter((item) => {
    const matches = item.id === recipeId;
    console.log(
      `🔍 Checking item ${item.id} (${item.recipe?.name}) === ${recipeId}: ${matches}`
    );
    return !matches;
  });

  console.log("🔍 Filtered list length:", filteredList.length);
  console.log("🔍 Returning filtered list:", filteredList);

  return filteredList;
};

/**
 * Pure function to initialize default recipe selection
 */
export const initializeDefaultRecipe = (allRecipes, currentSelection) => {
  if (allRecipes.length > 0 && !currentSelection) {
    return allRecipes[0].name;
  }
  return currentSelection;
};

/**
 * Higher-order function that creates a recipe addition handler
 */
export const createRecipeAdditionHandler = (setRecipeList) => (result) => {
  if (result.success) {
    setRecipeList((prev) => [...prev, result.data]);
  }
  return result;
};

/**
 * Create state management functions
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

  const { processRecipeListToRawComponents = () => [] } =
    recipeServiceFunctions;

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

          setRecipeList((currentList) => {
            console.log("🔍 setState callback - currentList:", currentList);
            console.log(
              "🔍 setState callback - currentList length:",
              currentList.length
            );

            const safeCurrentList = Array.isArray(currentList)
              ? currentList
              : [];

            let recipeToAdd = recipeData;
            let recipeId;

            if (typeof recipeData === "string") {
              console.warn(
                "⚠️ Recipe passed as string, this should be fixed in RecipeSelector"
              );
              recipeId = recipeData;
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

            const newItem = {
              id: Date.now(),
              recipe: recipeToAdd,
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
            newList: [],
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

      // FIXED: Proper remove recipe function that uses the current state
      removeRecipe: (recipeId) => {
        console.log("🔍 removeRecipe called with ID:", recipeId);

        try {
          const currentList = getRecipeList ? getRecipeList() : [];
          console.log("🔍 Current list from getRecipeList:", currentList);
          console.log("🔍 Current list length:", currentList.length);

          const filteredList = removeRecipeFromList(currentList, recipeId);
          console.log("🔍 Filtered list:", filteredList);
          console.log("🔍 Filtered list length:", filteredList.length);

          return filteredList;
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

  return {
    recipeList: createRecipeListManager(setRecipeList, getRecipeList),
    rawComponents: createRawComponentsManager(),
    appState: createAppStateManager(),

    utils: {
      isServiceReady: () => Boolean(recipeServiceFunctions),
      getAvailableFunctions: () => Object.keys(recipeServiceFunctions || {}),
    },
  };
};

export default createStateManagers;
