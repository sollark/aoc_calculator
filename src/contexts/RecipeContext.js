import { createContext, useContext } from "react";
import { useRecipeFiltering } from "../hooks/useRecipeFiltering.js";

const RecipeContext = createContext();

export const RecipeProvider = ({ children, recipeService, stateManagers }) => {
  const {
    recipes: availableRecipes,
    isLoading,
    error,
  } = useRecipeFiltering(recipeService);

  const contextValue = {
    availableRecipes,
    isLoading,
    error,
    recipeService,
    stateManagers,
  };

  return (
    <RecipeContext.Provider value={contextValue}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipeContext must be used within RecipeProvider");
  }
  return context;
};
