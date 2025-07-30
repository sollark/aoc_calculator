/**
 * SelectedRecipeListContext.js
 *
 * This module provides a React Context and custom hook for managing the list of selected recipes
 * in the application. It uses a reducer (via useAppReducer) for state management, and exposes
 * actions for adding, removing, clearing, and updating recipe quantities.
 *
 * Design Pattern:
 * - The context provider (`SelectedRecipeListProvider`) supplies shared state and actions to all
 *   descendant components.
 * - The custom hook (`useSelectedList`) encapsulates context access and error handling, making it
 *   easy and safe for components to consume the context data.
 *
 * Why use a custom hook for context?
 * - Encapsulation: The hook hides context details and error handling logic.
 * - Consistency: All components use the same API to access context data.
 * - Safety: The hook throws an error if used outside the provider, preventing bugs.
 * - Readability: Using `useSelectedList()` is clearer and more maintainable than calling
 *   `useContext(SelectedRecipeListContextObj)` everywhere.
 *
 * Usage Example:
 *   // In any component wrapped by SelectedRecipeListProvider:
 *   const {  recipeList, count, addRecipe, removeRecipe, clearList, updateQuantity } = useSelectedList();
 *
 *   // Now you can read the selected recipes and call actions to modify them.
 *
 * Provider Value:
 * - recipeList: Array of selected recipes.
 * - count: Number of selected recipes.
 * - addRecipe: Function to add a recipe to the list.
 * - removeRecipe: Function to remove a recipe by ID.
 * - clearList: Function to clear all selected recipes.
 * - updateQuantity: Function to update the quantity of a selected recipe.
 *
 * This pattern is recommended by the React team and is widely used in modern React codebases
 * for sharing state and actions across many components.
 */

import React, { createContext, useContext } from "react";
import { useAppReducer } from "../hooks/useAppReducer";

/**
 * The context object for selected recipes.
 */
const SelectedRecipeListContextObj = createContext();

/**
 * Custom hook to access the selected recipe list context.
 * Throws an error if used outside the provider.
 */
export const useSelectedList = () => {
  const context = useContext(SelectedRecipeListContextObj);
  if (!context) {
    throw new Error(
      "useSelectedList must be used within a SelectedRecipeListProvider"
    );
  }
  return context;
};

/**
 * Provider component for selected recipes.
 * Wrap your app (or subtree) with this to provide selected recipe state and actions.
 */
export const SelectedRecipeListProvider = ({ children }) => {
  const { state, recipeList, recipeListActions } = useAppReducer();

  // Wrapper for adding a recipe, returns a result object for compatibility.
  const addRecipe = async (recipe) => {
    try {
      recipeListActions.addRecipe(recipe);
      return { success: true, message: "Recipe added successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Remove a recipe by ID.
  const removeRecipe = (recipeId) => {
    recipeListActions.removeRecipe(recipeId);
  };

  // Clear all selected recipes.
  const clearList = () => {
    recipeListActions.clearList();
  };

  // Context value provided to consumers.
  const value = {
    recipeList,
    count: state.recipeList.count,
    addRecipe,
    removeRecipe,
    clearList,
    updateQuantity: recipeListActions.updateQuantity,
  };

  return (
    <SelectedRecipeListContextObj.Provider value={value}>
      {children}
    </SelectedRecipeListContextObj.Provider>
  );
};
