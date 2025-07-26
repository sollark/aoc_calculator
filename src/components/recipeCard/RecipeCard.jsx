import React, { useState } from "react";
import PropTypes from "prop-types";
import CraftComponent from "../craftComponent/CraftComponent";
import { recipePropType } from "../../types/recipePropTypes";

const RecipeCard = ({
  recipeData,
  recipe,
  playerLevel = 1,
  playerArtisanLevel = "novice",
  showRequirements = true,
}) => {
  console.log(`Recipe component initialized with data:`, recipeData);
  console.log(`🔍 RecipeCard props recipe:`, recipe);
  console.log(`🔍 RecipeCard recipeData:`, recipeData);

  const [quantity, setQuantity] = useState(0);
  const [playerHasQuantity, setPlayerHasQuantity] = useState(0);

  // The issue is here - fix the data extraction
  if (!recipeData) {
    console.warn("No recipe data available");
    return null;
  }

  // Extract the main recipe info and nested recipe details
  const {
    name,
    icon,
    description,
    requirements = { playerLevel: 0, artisanLevel: "novice" },
    recipe: recipeDetails = {},
  } = recipeData;

  const { workStation, artisanSkill, components = [] } = recipeDetails;

  console.log(`🔍 Extracted data:`, {
    name,
    description,
    workStation,
    artisanSkill,
    components,
  });

  return (
    <div className="recipe">
      <div className="recipe__header">
        <h2 className="recipe__title">
          {icon ? <img src={icon} alt={name} className="recipe__icon" /> : null}
          {name || "Unknown Recipe"}
        </h2>

        {showRequirements && (
          <div className="recipe__requirements">
            <span className="recipe__level">Lv.{requirements.playerLevel}</span>
            <span className="recipe__artisan">{requirements.artisanLevel}</span>
          </div>
        )}
      </div>

      <p className="recipe__description">
        {description || "No description available"}
      </p>

      <div className="recipe__details">
        <div className="recipe__workstation">
          <strong>Work Station:</strong> {workStation || "Unknown"}
        </div>
        <div className="recipe__skill">
          <strong>Artisan Skill:</strong> {artisanSkill || "Unknown"}
        </div>
      </div>

      <div className="recipe__components">
        <strong>Components:</strong>
        <ul className="recipe__components-list">
          {components.length > 0 ? (
            components.map((component, index) => (
              <li
                key={component.id || index}
                className="recipe__component-item"
              >
                <CraftComponent
                  name={component.name}
                  quantity={component.quantity}
                  onQuantityChange={(name, value) => {
                    console.log(`Updated ${name} quantity to ${value}`);
                  }}
                />
              </li>
            ))
          ) : (
            <li>No components found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// PropTypes validation
RecipeCard.propTypes = {
  recipeData: recipePropType,
  recipe: recipePropType, // Add this for nested structure
  playerLevel: PropTypes.number,
  playerArtisanLevel: PropTypes.oneOf([
    "novice",
    "apprentice",
    "journeyman",
    "expert",
    "master",
  ]),
  showRequirements: PropTypes.bool,
};

export default RecipeCard;
