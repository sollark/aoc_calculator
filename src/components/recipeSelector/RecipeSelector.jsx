import React from "react";
import PropTypes from "prop-types";
import "./recipeSelector.css";

const RecipeSelector = ({
  recipes,
  selectedRecipe,
  onRecipeChange,
  onAddRecipe,
  recipeListCount,
}) => {
  // Ensure recipes is always an array to prevent map errors
  const safeRecipes = Array.isArray(recipes) ? recipes : [];

  // Handle the case where no recipes are available
  if (safeRecipes.length === 0) {
    return (
      <div className="recipe-selector">
        <div className="recipe-selector__controls">
          <select disabled className="recipe-selector__dropdown">
            <option value="">No recipes available...</option>
          </select>
          <button disabled className="recipe-selector__add-btn">
            Add Recipe
          </button>
        </div>
        <p className="recipe-selector__status recipe-selector__status--empty">
          Loading recipes...
        </p>
      </div>
    );
  }

  return (
    <div className="recipe-selector">
      <div className="recipe-selector__controls">
        <select
          value={selectedRecipe || ""}
          onChange={(e) => onRecipeChange(e.target.value)}
          className="recipe-selector__dropdown"
        >
          <option value="">Select a recipe...</option>
          {safeRecipes.map((recipe) => {
            // Safety check for recipe object
            if (!recipe || (!recipe.id && !recipe.name)) {
              console.warn("Invalid recipe object:", recipe);
              return null;
            }

            const key = recipe.id || recipe.name || `recipe-${Math.random()}`;
            const value = recipe.name || `Recipe ${recipe.id}`;
            const displayName =
              recipe.name || `Recipe ${recipe.id}` || "Unknown Recipe";

            return (
              <option key={key} value={value}>
                {displayName}
              </option>
            );
          })}
        </select>

        <button
          onClick={onAddRecipe}
          className="recipe-selector__add-btn"
          disabled={!selectedRecipe}
        >
          Add Recipe
        </button>
      </div>

      {recipeListCount > 0 && (
        <p className="recipe-selector__status">
          {recipeListCount} recipe{recipeListCount !== 1 ? "s" : ""} in your
          list
        </p>
      )}

      {safeRecipes.length > 0 && recipeListCount === 0 && (
        <p className="recipe-selector__status recipe-selector__status--info">
          {safeRecipes.length} recipe{safeRecipes.length !== 1 ? "s" : ""}{" "}
          available
        </p>
      )}
    </div>
  );
};

RecipeSelector.propTypes = {
  recipes: PropTypes.array,
  selectedRecipe: PropTypes.string,
  onRecipeChange: PropTypes.func.isRequired,
  onAddRecipe: PropTypes.func.isRequired,
  recipeListCount: PropTypes.number,
};

RecipeSelector.defaultProps = {
  recipes: [],
  selectedRecipe: "",
  recipeListCount: 0,
};

export default RecipeSelector;
