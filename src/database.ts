/**
 * @file database.ts
 * @description Database class to handle the TODOs read and write from and to the file system
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

// === Types ===

export type Todo = {
  id: number;
  title: string;
  timestamp: string;
  done: boolean;
};

// === Constants ===

const DATABASE_FILE = "todos.json"; // Path to the todos.json file

// === Classes ===

/**
 * @class Database
 * @description Main class to handle the TODOs read and write from and to the file system
 */
class Database {
  /**
   * @constructor
   * @description Constructor to initialize the database and create the todos.json file if it doesn't exist
   */
  constructor() {
    if (!existsSync(DATABASE_FILE)) {
      this._saveTodos([]);
    }
  }

  /**
   * @method getTodos
   * @description Get the TODOs from the todos.json file
   *
   * @returns The TODOs from the todos.json file
   */
  getTodos() {
    const todos = readFileSync(DATABASE_FILE, "utf-8");

    return JSON.parse(todos) as Todo[];
  }

  /**
   * @method addTodo
   * @description Add a TODO to the todos.json file
   *
   * @param todo - The TODO to add
   */
  addTodo(todo: string) {
    const todos = this.getTodos();

    todos.push({
      id: todos.length + 1,
      timestamp: new Date().toISOString(),
      title: todo,
      done: false,
    });

    this._saveTodos(todos);
  }

  /**
   * @method toggleTodoDone
   * @description Toggle the done status of a TODO
   *
   * @param id - The id of the TODO
   *
   * @returns The new done status of the TODO
   */
  toggleTodoDone(id: number) {
    const todos = this.getTodos();
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return false;

    todo.done = !todo.done;
    this._saveTodos(todos);

    return todo.done;
  }

  /**
   * @method deleteTodo
   * @description Delete a TODO from the todos.json file
   *
   * @param id - The id of the TODO
   *
   * @returns Whether the TODO was deleted
   */
  deleteTodo(id: number) {
    const todos = this.getTodos();
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return false;

    todos.splice(todos.indexOf(todo), 1);
    this._saveTodos(todos);

    return true;
  }

  /**
   * @method editTodo
   * @description Edit a TODO from the todos.json file
   *
   * @param id - The id of the TODO
   * @param title - The new title of the TODO
   *
   * @returns Whether the TODO was edited
   */
  editTodo(id: number, title: string) {
    const todos = this.getTodos();
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return false;

    todo.title = title;
    this._saveTodos(todos);

    return true;
  }

  /**
   * @method _saveTodos
   * @description Save the TODOs to the todos.json file
   *
   * @param todos - The TODOs to save
   */
  private _saveTodos(todos: Todo[]) {
    writeFileSync(DATABASE_FILE, JSON.stringify(todos));
  }
}

// Export the database instance singleton
export const db = new Database();
