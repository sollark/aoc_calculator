import { createContext, useContext } from "react";

const RecipeContext = createContext();

export const RecipeProvider = ({ children, recipeService, stateManagers }) => (
  <RecipeContext.Provider value={{ recipeService, stateManagers }}>
    {children}
  </RecipeContext.Provider>
);

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipeContext must be used within RecipeProvider");
  }
  return context;
};
