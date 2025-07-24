import React, { useState } from "react";
import PropTypes from "prop-types";
import CraftComponent from "../craftComponent/CraftComponent";
import { recipePropType } from "../../types/recipePropTypes";

const RecipeCard = ({
  recipeData,
  playerLevel = 1,
  playerArtisanLevel = "novice",
  showRequirements = true,
}) => {
  console.log(`Recipe component initialized with data:`, recipeData);

  const [quantity, setQuantity] = useState(0);
  const [playerHasQuantity, setPlayerHasQuantity] = useState(0);

  if (!recipeData) return null;

  const {
    name,
    icon,
    description,
    requirements = { playerLevel: 0, artisanLevel: "novice" },
    recipe: { workStation, artisanSkill, components = [] } = {},
  } = recipeData;

  return (
    <div className="recipe">
      <div className="recipe__header">
        <h2 className="recipe__title">
          {icon ? <img src={icon} alt={name} className="recipe__icon" /> : null}
          {name}
        </h2>

        {showRequirements && (
          <div className="recipe__requirements">
            <span className="recipe__level">Lv.{requirements.playerLevel}</span>
            <span className="recipe__artisan">{requirements.artisanLevel}</span>
          </div>
        )}
      </div>

      <p className="recipe__description">{description}</p>

      <div className="recipe__details">
        <div className="recipe__workstation">
          <strong>Work Station:</strong> {workStation}
        </div>
        <div className="recipe__skill">
          <strong>Artisan Skill:</strong> {artisanSkill}
        </div>
      </div>

      <div className="recipe__components">
        <strong>Components:</strong>
        <ul className="recipe__components-list">
          {components.map((component) => (
            <li key={component.id} className="recipe__component-item">
              <CraftComponent
                name={component.name}
                quantity={component.quantity}
                onQuantityChange={(name, value) => {
                  console.log(`Updated ${name} quantity to ${value}`);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// PropTypes validation
RecipeCard.propTypes = {
  recipeData: recipePropType,
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
