import PropTypes from "prop-types";

// Recipe requirements PropType
const recipeRequirementsPropType = PropTypes.shape({
  playerLevel: PropTypes.number.isRequired,
  artisanLevel: PropTypes.oneOf([
    "novice",
    "apprentice",
    "journeyman",
    "expert",
    "master",
  ]).isRequired,
});

// Main recipe PropType
const recipePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string, // Optional icon path
  requirements: recipeRequirementsPropType, // Make optional since some components might not have it
  recipe: PropTypes.shape({
    artisanSkill: PropTypes.string.isRequired,
    workStation: PropTypes.string.isRequired,
    components: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
});

// Raw component PropType for gathering info
const rawComponentPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  gathering: PropTypes.shape({
    skill: PropTypes.string.isRequired,
    skillLevel: PropTypes.oneOf([
      "none",
      "novice",
      "apprentice",
      "journeyman",
      "expert",
      "master",
    ]).isRequired,
    tool: PropTypes.string.isRequired,
  }),
});

// Export for use in other components
export { recipePropType, recipeRequirementsPropType, rawComponentPropType };
