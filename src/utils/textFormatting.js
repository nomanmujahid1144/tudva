// src/utils/textFormatting.js

/**
 * Convert underscore/snake_case text to Title Case
 * @param {string} text - Text to format (e.g., "all_levels", "beginner", "some_long_text")
 * @returns {string} - Formatted text (e.g., "All Levels", "Beginner", "Some Long Text")
 */
export const formatToTitleCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .split(' ')                   // Split into words
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )                             // Capitalize each word
    .join(' ');                   // Join back with spaces
};

/**
 * Format course level for display
 * @param {string} level - Course level
 * @param {string} fallback - Fallback text if level is empty
 * @returns {string} - Formatted level
 */
export const formatCourseLevel = (level, fallback = 'All Levels') => {
  if (!level) return fallback;
  return formatToTitleCase(level);
};

/**
 * Format category name for display
 * @param {string} category - Category name
 * @returns {string} - Formatted category
 */
export const formatCategoryName = (category) => {
  return formatToTitleCase(category);
};

/**
 * Format subcategory name for display
 * @param {string} subcategory - Subcategory name
 * @returns {string} - Formatted subcategory
 */
export const formatSubcategoryName = (subcategory) => {
  return formatToTitleCase(subcategory);
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default {
  formatToTitleCase,
  formatCourseLevel,
  formatCategoryName,
  formatSubcategoryName
};