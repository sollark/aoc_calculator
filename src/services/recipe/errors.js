/**
 * Custom error classes for recipe operations
 */

export class RecipeError extends Error {
  constructor(message) {
    super(message);
    this.name = "RecipeError";
  }
}

export class RecipeNotFoundError extends RecipeError {
  constructor(id) {
    super(`Recipe with ID ${id} not found`);
    this.name = "RecipeNotFoundError";
  }
}

export class InvalidRecipeTypeError extends RecipeError {
  constructor(type, validTypes) {
    super(
      `Invalid recipe type: ${type}. Must be one of: ${validTypes.join(", ")}`
    );
    this.name = "InvalidRecipeTypeError";
  }
}

export class ValidationError extends RecipeError {
  constructor(field, message) {
    super(`Validation error for field '${field}': ${message}`);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class DuplicateRecipeError extends RecipeError {
  constructor(id) {
    super(`Recipe with ID ${id} already exists`);
    this.name = "DuplicateRecipeError";
  }
}
