import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * AvailableListContext - Manages available recipes from API/service
 */
const AvailableListContext = createContext();

export const useAvailableList = () => {
  const context = useContext(AvailableListContext);
  if (!context) {
    throw new Error(
      "useAvailableList must be used within an AvailableListProvider"
    );
  }
  return context;
};

export const AvailableListProvider = ({
  children,
  recipeService,
  stateManagers,
}) => {
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecipes = async () => {
      if (!recipeService?.getAllRecipes) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const recipes = await recipeService.getAllRecipes();
        setAvailableRecipes(Array.isArray(recipes) ? recipes : []);
      } catch (err) {
        console.error("Error loading recipes:", err);
        setError(err.message);
        setAvailableRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [recipeService]);

  const contextValue = {
    availableRecipes,
    isLoading,
    error,
    recipeService,
    stateManagers,
  };

  return (
    <AvailableListContext.Provider value={contextValue}>
      {children}
    </AvailableListContext.Provider>
  );
};
