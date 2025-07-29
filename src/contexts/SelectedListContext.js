import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";

/**
 * SelectedListContext - Manages user's selected recipes
 */
const SelectedListContext = createContext();

/**
 * Custom hook to use selected list context
 * @returns {Object} Selected list state and handlers
 */
export const useSelectedList = () => {
  const context = useContext(SelectedListContext);
  if (!context) {
    throw new Error(
      "useSelectedList must be used within a SelectedListProvider"
    );
  }
  return context;
};

/**
 * SelectedListProvider - Provides selected list state and handlers
 */
export const SelectedListProvider = ({ children }) => {
  const [recipeList, setRecipeList] = useState([]);

  // Pure function handlers with proper error handling
  const addRecipe = useCallback(
    async (recipe) => {
      console.log("🔍 SelectedList - addRecipe called with:", recipe);

      try {
        if (!recipe) {
          console.error("❌ Cannot add recipe: No recipe provided");
          return { success: false, message: "No recipe provided" };
        }

        // Check if recipe already exists
        const exists = recipeList.some(
          (item) =>
            item.recipe?.id === recipe.id || item.recipe?.name === recipe.name
        );

        if (exists) {
          console.warn("⚠️ Recipe already exists in list");
          return { success: false, message: "Recipe already exists" };
        }

        // Create new recipe list item with proper structure
        const newItem = {
          id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          recipe: { ...recipe }, // Deep copy to prevent mutations
          quantity: 1,
          addedAt: new Date().toISOString(),
        };

        setRecipeList((current) => [...current, newItem]);

        console.log("✅ Recipe added successfully:", recipe.name);
        return { success: true, message: "Recipe added successfully" };
      } catch (error) {
        console.error("❌ Error adding recipe:", error);
        return { success: false, message: error.message };
      }
    },
    [recipeList]
  );

  const removeRecipe = useCallback((recipeId) => {
    console.log("🗑️ SelectedList - removeRecipe called with ID:", recipeId);

    try {
      setRecipeList((current) =>
        current.filter((item) => item.id !== recipeId)
      );
      console.log("✅ Recipe removed successfully");
    } catch (error) {
      console.error("❌ Error removing recipe:", error);
    }
  }, []);

  const clearList = useCallback(() => {
    console.log("🧹 SelectedList - clearing recipe list");
    setRecipeList([]);
  }, []);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      recipeCount: recipeList.length,
      hasRecipes: recipeList.length > 0,
      recipeIds: recipeList.map((item) => item.id),
      recipeNames: recipeList
        .map((item) => item.recipe?.name || "Unknown")
        .filter(Boolean),
    }),
    [recipeList]
  );

  // Context value with all state and handlers
  const contextValue = useMemo(
    () => ({
      // State
      recipeList,

      // Computed values
      ...computedValues,

      // Handlers
      addRecipe,
      removeRecipe,
      clearList,

      // Internal state setter (for advanced use cases)
      setRecipeList,
    }),
    [recipeList, computedValues, addRecipe, removeRecipe, clearList]
  );

  return (
    <SelectedListContext.Provider value={contextValue}>
      {children}
    </SelectedListContext.Provider>
  );
};

SelectedListProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SelectedListContext;
