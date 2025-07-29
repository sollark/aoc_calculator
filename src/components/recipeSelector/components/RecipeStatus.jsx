import React from "react";
import PropTypes from "prop-types";
import { StatusMessage } from "../../ui";
import { useRecipeStatus } from "../../../hooks/useRecipeStatus";

/**
 * RecipeStatus Component
 *
 * Specialized component for displaying recipe selection status.
 * Uses custom hook for logic separation and pure component pattern.
 *
 * @component
 */
const RecipeStatus = ({ recipeCount, selectedRecipe, recipeListCount }) => {
  const status = useRecipeStatus({
    recipeCount,
    selectedRecipe,
    recipeListCount,
  });

  return (
    <StatusMessage type={status.type} className="recipe-selector__status">
      {status.message}
    </StatusMessage>
  );
};

RecipeStatus.propTypes = {
  /** Total number of available recipes */
  recipeCount: PropTypes.number.isRequired,
  /** Currently selected recipe object */
  selectedRecipe: PropTypes.object,
  /** Number of recipes in the current list */
  recipeListCount: PropTypes.number.isRequired,
};

export default RecipeStatus;
