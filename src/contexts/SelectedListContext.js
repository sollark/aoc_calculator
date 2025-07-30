import React, { createContext, useContext } from "react";
import { useAppReducer } from "../hooks/useAppReducer";

/**
 * SelectedListContext - Now using reducers instead of complex state service
 */
const SelectedListContext = createContext();

export const useSelectedList = () => {
  const context = useContext(SelectedListContext);
  if (!context) {
    throw new Error(
      "useSelectedList must be used within a SelectedListProvider"
    );
  }
  return context;
};

export const SelectedListProvider = ({ children }) => {
  const { state, recipeList, recipeListActions } = useAppReducer();

  console.log("🔧 SelectedListProvider - Recipe count:", recipeList.length);

  // Simple wrapper functions for compatibility
  const addRecipe = async (recipe) => {
    console.log("🔧 SelectedListContext - Adding recipe:", recipe?.name);

    try {
      recipeListActions.addRecipe(recipe);
      return { success: true, message: "Recipe added successfully" };
    } catch (error) {
      console.error("❌ Error adding recipe:", error);
      return { success: false, message: error.message };
    }
  };

  const removeRecipe = (recipeId) => {
    console.log("🔧 SelectedListContext - Removing recipe:", recipeId);
    recipeListActions.removeRecipe(recipeId);
  };

  const clearList = () => {
    console.log("🔧 SelectedListContext - Clearing list");
    recipeListActions.clearList();
  };

  const value = {
    recipeList,
    count: state.recipeList.count,
    addRecipe,
    removeRecipe,
    clearList,
    updateQuantity: recipeListActions.updateQuantity,
  };

  return (
    <SelectedListContext.Provider value={value}>
      {children}
    </SelectedListContext.Provider>
  );
};
