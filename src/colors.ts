/**
 * @file colors.ts
 * @description Helper functions to handle the colors of the text in the terminal
 */

// Regex to match a colored text with it's color code, text and reset code
const coloredTextRegex = /(\x1b\[)([0-9]{2})(m)(.*?)(\x1b\[0m)/g;

/**
 * @function getColoredText
 * @description Get the text and color apply function from a colored text
 *
 * @param coloredText - The colored text to get the text and color apply function from
 *
 * @returns The text and color apply function
 */
export function getColoredText(coloredText: string) {
  // If the text is not colored, return the text and the color apply function (identity function)
  if (!coloredTextRegex.test(coloredText)) {
    return { text: coloredText, colorApply: (message: string) => message };
  }

  // Extract the text and color from the colored text
  const text = coloredText.replace(coloredTextRegex, "$4");
  const color = coloredText.replace(coloredTextRegex, "$2");

  // Get the color apply function
  const colorApply = getColorFunc(color);

  return { text, colorApply };
}

/**
 * @constant c
 * @description Object with the color apply functions
 */
export const c = {
  black: getColorFunc("30"),
  red: getColorFunc("31"),
  green: getColorFunc("32"),
  yellow: getColorFunc("33"),
  blue: getColorFunc("34"),
  magenta: getColorFunc("35"),
  cyan: getColorFunc("36"),
  white: getColorFunc("37"),
  bgBlack: getColorFunc("40"),
  bgRed: getColorFunc("41"),
  bgGreen: getColorFunc("42"),
  bgYellow: getColorFunc("43"),
  bgBlue: getColorFunc("44"),
  bgMagenta: getColorFunc("45"),
  bgCyan: getColorFunc("46"),
  bgWhite: getColorFunc("47"),
};

// === Helpers ===

/**
 * @function getColorFunc
 * @description Get the color apply function from a color code
 *
 * @param color - The color code to get the color apply function from
 *
 * @returns The color apply function
 */
function getColorFunc(color: string) {
  return (message: string) => `\x1b[${color}m${message}\x1b[0m`;
}
