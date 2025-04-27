/**
 * @file terminal.ts
 * @description Terminal class to handle input and output
 */

import { c } from "./colors.ts";

/**
 * @class Terminal
 * @description Main class to handle terminal input and output
 */
class Terminal {
  constructor() {
    process.stdin.setEncoding("utf8");
  }

  /**
   * @method requestInputLine
   * @description Request a line of input from the user
   *
   * @param acceptedLine - The regex to accept the input
   * @param prompt - The prompt to display to the user
   *
   * @returns The string input from the user
   */
  async requestInputLine(
    acceptedLine: RegExp,
    prompt?: string
  ): Promise<string> {
    return await this._requestInput(this._readLine, acceptedLine, true, prompt);
  }

  /**
   * @method requestInputKey
   * @description Request a key from the user
   *
   * @param acceptedKeys - The regex to accept the key
   * @param prompt - The prompt to display to the user
   *
   * @returns The string key from the user
   */
  async requestInputKey(
    acceptedKeys: RegExp,
    prompt?: string
  ): Promise<string> {
    return await this._requestInput(this._readKey, acceptedKeys, true, prompt);
  }

  /**
   * @method write
   * @description Write raw text to the terminal
   *
   * @param text - The text to write to the terminal
   */
  write(text: string) {
    process.stdout.write(text);
  }

  /**
   * @method breakLine
   * @description Break the line
   *
   * @param lines - The number of lines to break (default: 1)
   */
  breakLine(lines = 1) {
    this.write("\n".repeat(lines));
  }

  /**
   * @method clear
   * @description Clear the terminal
   */
  clear() {
    this.write("\x1b[2J\x1b[H");
  }

  // === Helpers ===

  /**
   * @method debug
   * @description Debug the data
   *
   * @param data - The data to debug
   */
  static debug(...data: unknown[]) {
    console.log(
      c.bgMagenta(
        `\nDEBUG: ${data.map((d) => JSON.stringify(d, null, 2)).join(", ")}\n`
      )
    );
  }

  /**
   * @method _requestInput
   * @description Request input from the user
   *
   * @param readFunc - The function to read the input
   * @param acceptedInput - The regex to accept the input
   * @param feedback - Whether to give feedback to the user
   * @param prompt - The prompt to display to the user
   *
   * @returns The string input from the user
   */
  private async _requestInput(
    readFunc: () => Promise<string>,
    acceptedInput: RegExp,
    feedback = false,
    prompt = `${c.bgRed(">")} `
  ) {
    // Write the prompt to the terminal
    this.write(prompt);

    // Read the input from the user until it is accepted
    let input: string;
    do {
      input = await readFunc();

      // If feedback is enabled and the input is not accepted, write an error message
      if (feedback && !acceptedInput.test(input)) {
        this.write(c.red("Entrada inválida!"));
        this.breakLine();
        this.write(prompt);
      }
    } while (!acceptedInput.test(input));

    return input;
  }

  /**
   * @method _readLine
   * @description Read a line from the terminal
   *
   * @returns The string input from the user
   */
  private async _readLine(): Promise<string> {
    const input = await new Promise<string>((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim());
      });
    });
    return input;
  }

  /**
   * @method _readKey
   * @description Read a single key stroke from the terminal
   *
   * @returns The string key from the user
   */
  private async _readKey(): Promise<string> {
    // Set raw mode to read single keystrokes
    process.stdin.setRawMode(true);

    const key = await new Promise<string>((resolve) => {
      process.stdin.once("data", (data) => {
        // Reset terminal mode
        process.stdin.setRawMode(false);
        resolve(data.toString());
      });
    });

    return key;
  }
}

// Export the terminal instance singleton
export const terminal = new Terminal();
