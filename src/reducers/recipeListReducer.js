/**
 * Recipe List Reducer - Redux-style state management for selected recipes
 *
 * This reducer manages the state for a list of selected recipes.
 * It supports adding, removing, updating quantity, and clearing the list.
 *
 * Each recipe item should have:
 *   - recipe: the recipe object (must have id, name, etc.)
 *   - quantity: required amount (number)
 *
 * Example usage:
 *   dispatch(recipeListActions.addRecipe(recipeObj))
 *   dispatch(recipeListActions.updateQuantity(recipeObj.id, 5))
 *   dispatch(recipeListActions.removeRecipe(recipeObj.id))
 *   dispatch(recipeListActions.clearList())
 *
 * NOTE:
 * This file only exports reducer and action creators.
 * The `dispatch` function comes from React's useReducer or Redux's useDispatch.
 *
 * Example with useReducer:
 *   import { useReducer } from "react";
 *   const [state, dispatch] = useReducer(recipeListReducer, initialRecipeListState);
 *   dispatch(recipeListActions.addRecipe(recipeObj));
 *
 * Example with Redux:
 *   import { useDispatch } from "react-redux";
 *   const dispatch = useDispatch();
 *   dispatch(recipeListActions.addRecipe(recipeObj));
 */

// Action Types
export const RECIPE_LIST_ACTIONS = {
  ADD_RECIPE: "ADD_RECIPE", // Add a new recipe to the list
  REMOVE_RECIPE: "REMOVE_RECIPE", // Remove a recipe by id
  CLEAR_LIST: "CLEAR_LIST", // Remove all recipes
  UPDATE_QUANTITY: "UPDATE_QUANTITY", // Change quantity for one recipe
};

// Initial State
export const initialRecipeListState = {
  recipes: [], // Array of { recipe, quantity }
  count: 0, // Total number of recipes
};

/**
 * Action creators for recipe list reducer
 */
export const recipeListActions = {
  /**
   * Add a new recipe to the list.
   * @param {Object} recipe - The recipe object
   * @returns {Object} Redux action
   * @example
   * dispatch(recipeListActions.addRecipe(recipeObj))
   */
  addRecipe: (recipe) => ({
    type: RECIPE_LIST_ACTIONS.ADD_RECIPE,
    payload: recipe,
  }),

  /**
   * Remove a recipe from the list by id.
   * @param {string|number} recipeId - The id of the recipe to remove
   * @returns {Object} Redux action
   * @example
   * dispatch(recipeListActions.removeRecipe(recipeObj.id))
   */
  removeRecipe: (recipeId) => ({
    type: RECIPE_LIST_ACTIONS.REMOVE_RECIPE,
    payload: recipeId,
  }),

  /**
   * Clear all recipes from the list.
   * @returns {Object} Redux action
   * @example
   * dispatch(recipeListActions.clearList())
   */
  clearList: () => ({
    type: RECIPE_LIST_ACTIONS.CLEAR_LIST,
  }),

  /**
   * Update the quantity of a specific recipe.
   * @param {string|number} recipeId - The id of the recipe to update
   * @param {number} quantity - The new quantity
   * @returns {Object} Redux action
   * @example
   * dispatch(recipeListActions.updateQuantity(recipeObj.id, 5))
   */
  updateQuantity: (recipeId, quantity) => ({
    type: RECIPE_LIST_ACTIONS.UPDATE_QUANTITY,
    payload: { recipeId, quantity },
  }),
};

/**
 * Pure reducer for recipe list state management.
 * Follows immutability principles and functional programming.
 *
 * @param {Object} state - Current state
 * @param {Object} action - Redux action
 * @returns {Object} New state
 */
export const recipeListReducer = (state = initialRecipeListState, action) => {
  console.log("🔧 RecipeList Reducer:", action.type, action.payload);

  switch (action.type) {
    case RECIPE_LIST_ACTIONS.ADD_RECIPE: {
      const recipe = action.payload;

      // Check if recipe already exists by id
      const exists = state.recipes.some(
        (item) => item.recipe?.id === recipe.id
      );
      if (exists) {
        console.log("⚠️ Recipe already exists, not adding");
        return state;
      }

      // Add new recipe item (no id or addedAt fields)
      const newRecipeItem = {
        recipe: recipe,
        quantity: 1,
      };

      const newRecipes = [...state.recipes, newRecipeItem];

      console.log("✅ Adding recipe item:", newRecipeItem);

      return {
        ...state,
        recipes: newRecipes,
        count: newRecipes.length,
      };
    }

    case RECIPE_LIST_ACTIONS.REMOVE_RECIPE: {
      const recipeId = action.payload;
      console.log("🗑️ Removing recipe with ID:", recipeId);

      const filteredRecipes = state.recipes.filter(
        (item) => item.recipe?.id !== recipeId
      );

      return {
        ...state,
        recipes: filteredRecipes,
        count: filteredRecipes.length,
      };
    }

    case RECIPE_LIST_ACTIONS.CLEAR_LIST: {
      console.log("🧹 Clearing recipe list");
      return {
        ...state,
        recipes: [],
        count: 0,
      };
    }

    case RECIPE_LIST_ACTIONS.UPDATE_QUANTITY: {
      const { recipeId, quantity } = action.payload;
      console.log("🔢 Updating quantity:", recipeId, quantity);

      const updatedRecipes = state.recipes.map((item) =>
        item.recipe?.id === recipeId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );

      return {
        ...state,
        recipes: updatedRecipes,
      };
    }

    default:
      return state;
  }
};
