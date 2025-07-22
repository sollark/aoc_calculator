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
  return (
    <div className="recipe-selector">
      <div className="recipe-selector__controls">
        <select
          value={selectedRecipe}
          onChange={(e) => onRecipeChange(e.target.value)}
          className="recipe-selector__dropdown"
        >
          <option value="">Select a recipe...</option>
          {recipes.map((recipe) => (
            <option key={recipe.id || recipe.name} value={recipe.name}>
              {recipe.name}
            </option>
          ))}
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
    </div>
  );
};

RecipeSelector.propTypes = {
  recipes: PropTypes.array.isRequired,
  selectedRecipe: PropTypes.string.isRequired,
  onRecipeChange: PropTypes.func.isRequired,
  onAddRecipe: PropTypes.func.isRequired,
  recipeListCount: PropTypes.number.isRequired,
};

export default RecipeSelector;
