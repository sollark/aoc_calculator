/**
 * Error handling utilities and custom error classes
 */

/**
 * Base error class for recipe operations
 */
export class RecipeError extends Error {
  constructor(message, code = "RECIPE_ERROR", details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "RecipeError";
  }
}

/**
 * Recipe not found error
 */
export class RecipeNotFoundError extends RecipeError {
  constructor(id) {
    super(`Recipe with ID ${id} not found`, "RECIPE_NOT_FOUND", { id });
    this.name = "RecipeNotFoundError";
  }
}

/**
 * Invalid recipe type error
 */
export class InvalidRecipeTypeError extends RecipeError {
  constructor(type, validTypes) {
    super(
      `Invalid recipe type: ${type}. Must be one of: ${validTypes.join(", ")}`,
      "INVALID_RECIPE_TYPE",
      { type, validTypes }
    );
    this.name = "InvalidRecipeTypeError";
  }
}

/**
 * Validation error for recipe fields
 */
export class ValidationError extends RecipeError {
  constructor(field, message) {
    super(
      `Validation error for field '${field}': ${message}`,
      "VALIDATION_ERROR",
      { field }
    );
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * Duplicate recipe error
 */
export class DuplicateRecipeError extends RecipeError {
  constructor(id) {
    super(`Recipe with ID ${id} already exists`, "DUPLICATE_RECIPE", { id });
    this.name = "DuplicateRecipeError";
  }
}

/**
 * File operation error
 */
export class FileOperationError extends RecipeError {
  constructor(operation, filename, originalError) {
    super(`Failed to ${operation} file: ${filename}`, "FILE_OPERATION_ERROR", {
      operation,
      filename,
      originalError: originalError?.message,
    });
    this.name = "FileOperationError";
  }
}

/**
 * Component calculation error
 */
export class ComponentCalculationError extends RecipeError {
  constructor(componentName, message) {
    super(
      `Error calculating component '${componentName}': ${message}`,
      "COMPONENT_CALCULATION_ERROR",
      { componentName }
    );
    this.name = "ComponentCalculationError";
  }
}

/**
 * Create standardized error response object
 */
export const createErrorResponse = (error) => ({
  success: false,
  error: {
    message: error.message,
    code: error.code || "UNKNOWN_ERROR",
    details: error.details || {},
    name: error.name || "Error",
  },
});

/**
 * Create standardized success response object
 */
export const createSuccessResponse = (
  data,
  message = "Operation successful"
) => ({
  success: true,
  message,
  data,
});

/**
 * Wrap async functions with error handling
 */
export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args);
      return createSuccessResponse(result);
    } catch (error) {
      console.error(`Error in ${asyncFn.name}:`, error);
      return createErrorResponse(error);
    }
  };
};

/**
 * Error boundary helper for React components
 */
export const handleComponentError = (error, errorInfo) => {
  console.error("Component Error:", error);
  console.error("Error Info:", errorInfo);

  // You could send this to an error reporting service
  // reportError(error, errorInfo);
};

export default {
  RecipeError,
  RecipeNotFoundError,
  InvalidRecipeTypeError,
  ValidationError,
  DuplicateRecipeError,
  FileOperationError,
  ComponentCalculationError,
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  handleComponentError,
};
