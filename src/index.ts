/**
 * @file index.ts
 * @description Main file to run the app
 */

import { c } from "./colors.ts";
import { controller } from "./controller.ts";
import { terminal } from "./terminal.ts";

// Main function to run the app
async function main() {
  // Initialize the app
  controller.greet();
  controller.listTodos();

  // Main loop
  while (true) {
    // List available actions
    const availableActions = controller.listActions();
    // Request input from user
    let action = await terminal.requestInputKey(availableActions);

    // Write the action to the terminal
    terminal.write(action);
    terminal.breakLine(2);

    // Handle the action
    await handleAction(action);
  }
}

// Function to handle the action
async function handleAction(action: string) {
  // Get the handler for the action
  const handler =
    actionHandlers[action.toUpperCase() as keyof typeof actionHandlers];

  // If the action is invalid, log an error and return
  if (!handler) {
    console.log(c.red("Ação inválida"));
    return;
  }

  // Execute the handler
  await handler();
}

// Action handlers - Bind the controller methods to the action keys
const actionHandlers = {
  L: () => {
    controller.listTodos();
  },
  A: async () => {
    await controller.addTodo();
    controller.listTodos();
  },
  S: async () => {
    await controller.selectTodo();
    controller.listTodos();
  },
  X: () => {
    controller.toggleTodoDone();
    controller.listTodos();
  },
  D: () => {
    controller.deleteTodo();
    controller.listTodos();
  },
  E: async () => {
    await controller.editTodo();
    controller.listTodos();
  },
  Q: () => {
    controller.bye();
  },
  B: async () => {
    await controller.searchTodo();
    controller.listTodos();
  },
  R: async () => {
    await controller.sortTodos();
    controller.listTodos();
  },
  Z: () => {
    controller.toggleHideCompleted();
    controller.listTodos();
  },
  V: () => {
    controller.nextPage();
    controller.listTodos();
  },
  C: () => {
    controller.previousPage();
    controller.listTodos();
  },
  W: async () => {
    await controller.changePageSize();
    controller.listTodos();
  },
};

// Run the app
main();
