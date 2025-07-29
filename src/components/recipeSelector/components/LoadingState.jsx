import React from "react";
import PropTypes from "prop-types";
import { StatusMessage } from "../../ui";
import RecipeControls from "./RecipeControls";

/**
 * LoadingState Component
 *
 * Pure component for displaying loading state.
 * Encapsulates loading UI logic for better separation of concerns.
 *
 * @component
 */
const LoadingState = ({
  message = "Loading recipes...",
  recipeListCount = 0,
}) => {
  // Create disabled controls for loading state
  const loadingControls = {
    selectOptions: [],
    selectedRecipe: null,
    onRecipeSelect: () => {},
    onAddRecipe: () => {},
    recipeListCount,
    disabled: true,
  };

  return (
    <div className="recipe-selector recipe-selector--loading">
      <RecipeControls {...loadingControls} />
      <StatusMessage type="loading">{message}</StatusMessage>
    </div>
  );
};

LoadingState.propTypes = {
  /** Loading message to display */
  message: PropTypes.string,
  /** Number of recipes in list */
  recipeListCount: PropTypes.number,
};

export default LoadingState;
