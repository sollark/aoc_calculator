import React from "react";
import PropTypes from "prop-types";
import Recipe from "../recipe/Recipe";
import "./recipeList.css";

const RecipeList = ({ recipes, onRemoveRecipe, onClearList }) => {
  if (recipes.length === 0) {
    return (
      <div className="recipe-list recipe-list--empty">
        <p>
          No recipes added yet. Select a recipe and click "Add Recipe" to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <div className="recipe-list__header">
        <h3>Recipe List ({recipes.length} recipes):</h3>
        <button
          onClick={onClearList}
          className="recipe-list__clear-btn"
          disabled={recipes.length === 0}
        >
          Clear All
        </button>
      </div>

      <ul className="recipe-list__items">
        {recipes.map((recipe) => (
          <li key={recipe.id || recipe.name} className="recipe-list__item">
            <button
              onClick={() => onRemoveRecipe(recipe.id)}
              className="recipe-list__remove-btn"
              aria-label={`Remove ${recipe.name} recipe`}
            >
              ×
            </button>
            <Recipe recipeData={recipe} />
          </li>
        ))}
      </ul>
    </div>
  );
};

RecipeList.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
  onClearList: PropTypes.func.isRequired,
};

export default RecipeList;
