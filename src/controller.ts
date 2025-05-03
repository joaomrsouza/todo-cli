/**
 * @file controller.ts
 * @description Controller class to handle the main logic of the TODO CLI
 */

import { c, getColoredText } from "./colors.ts";
import { db, type Todo } from "./database.ts";
import { terminal } from "./terminal.ts";

// === Constants ===

const BLOCK_WIDTH = 50; // Width of the block of text in the terminal for the titles

// === Classes ===

/**
 * @class Controller
 * @description Main class to handle the main logic of the TODO CLI
 */
class Controller {
  // === Properties ===
  private _page: number = 1;
  private _pageSize: number = 10;
  private _search: string = "";
  private _order: "asc" | "desc" = "asc";
  private _sortBy: "status" | "title" | "timestamp" = "timestamp";
  private _hideCompleted: boolean = false;
  private _selectedTodoId: number | null = null;

  // === Methods ===

  /**
   * @method greet
   * @description Greet the user
   */
  greet() {
    this._printTitle(c.green("="), "=");
    this._printTitle(c.green("Bem vindo ao TODO CLI"));
    this._printTitle(c.green("="), "=");
  }

  /**
   * @method bye
   * @description Say goodbye to the user and exit the program
   */
  bye() {
    console.log(c.green("Até logo!"));
    console.log(c.green("Saindo..."));

    process.exit(0);
  }

  /**
   * @method listActions
   * @description List the actions available to the user
   *
   * @returns The regex that matches the current available actions
   */
  listActions() {
    terminal.breakLine();
    this._printTitle(c.red("Ações"));

    const todo = this._getSelectedTodo();

    // If there is a selected TODO, list the actions available for the selected TODO
    if (todo) {
      console.log(c.yellow(`TODO selecionado: ${this._todoString(todo)}`));

      const availableActions = [
        "S - Desselecionar TODO",
        `X - Marcar como ${todo.done ? "não feito" : "feito"}`,
        "D - Deletar TODO",
        "E - Editar TODO",
      ];

      console.log(c.red(availableActions.join(" | ")));

      return this._buildActionsRegex(availableActions);
    }

    const isSorted = this._sortBy !== "timestamp" || this._order !== "asc";

    const availableActions = [
      "Q - Sair",
      "L - Listar TODOs",
      "A - Adicionar TODO",
      `R - ${isSorted ? "Limpar ordenação" : "Reordenar TODOs"}`,
      `Z - ${this._hideCompleted ? "Mostrar completos" : "Ocultar completos"}`,
      "W - Alterar número de TODOs por página",
    ];

    // If there is more than one page, add the previous page action
    if (this._page > 1) {
      availableActions.push("C - Página anterior");
    }

    // If there is more than one page, add the next page action
    if (this._page < this._getMaxPage()) {
      availableActions.push("V - Próxima página");
    }

    // If there are TODOs in the database, add the search action
    if (db.getTodos().length > 0) {
      availableActions.push(
        `B - ${this._search ? "Limpar busca" : "Buscar TODO"}`
      );
    }

    // If there are TOs in the current page, add the select TODO action
    if (this._getVisibleTodos().length > 0) {
      availableActions.push("S - Selecionar TODO");
    }

    console.log(c.red(availableActions.join(" | ")));

    return this._buildActionsRegex(availableActions);
  }

  // === Main Actions ===

  /**
   * @method listTodos
   * @description List the TODOs
   */
  listTodos() {
    terminal.breakLine();
    this._printTitle(c.yellow("TODOs"));

    const todos = this._getVisibleTodos();

    // If there is a search, print the search
    if (this._search) {
      console.log(`${c.blue("Buscando por:")} ${this._search}`);
    }

    // If the hide completed is true, print the hide completed
    if (this._hideCompleted) {
      console.log(c.blue("(Ocultando completos)"));
    }

    // If the sort by and order are not the default sort (timestamp - asc), print the sort
    if (this._sortBy !== "timestamp" || this._order !== "asc") {
      const orderLabels = {
        asc: "Crescente",
        desc: "Decrescente",
      };
      const sortLabels = {
        title: "Título",
        status: "Status",
        timestamp: "Criado em",
      };

      console.log(
        `${c.magenta("Ordenando por:")} ${sortLabels[this._sortBy]} - ${
          orderLabels[this._order]
        }`
      );
    }

    // Print the current page and the number of TODOs in the current page
    console.log(c.cyan(`Página ${this._page}/${this._getMaxPage()}.`));
    console.log(
      c.cyan(
        `Exibindo ${todos.length}/${this._getFilteredTodos().length} TODOs${
          this._search ? ` filtrados de ${db.getTodos().length}` : ""
        }.`
      )
    );

    // Print the TODOs in the current page
    todos.forEach((todo, index) => {
      console.log(c.yellow(`${index + 1}. ${this._todoString(todo)}`));
    });

    // If there are no TODOs in the current page, print a message
    if (todos.length === 0) console.log(c.red("- Nenhum TODO encontrado"));
  }

  /**
   * @method searchTodo
   * @description Search for a TODO
   */
  async searchTodo() {
    // If there is a search, clear the search
    if (this._search) {
      this._search = "";
      console.log(c.blue("Busca limpa."));
      return;
    }

    this._printTitle(c.blue("Buscar TODO"));

    // Request the search from the user
    this._search = await terminal.requestInputLine(
      /.*/, // Regex to match any text
      `${c.bgBlue("Digite o que deseja buscar:")} `
    );
  }

  /**
   * @method toggleHideCompleted
   * @description Toggle the hide completed
   */
  toggleHideCompleted() {
    this._hideCompleted = !this._hideCompleted;

    console.log(
      c.blue(
        this._hideCompleted ? "Ocultando completos" : "Mostrando completos"
      )
    );
  }

  /**
   * @method sortTodos
   * @description Sort the TODOs
   */
  async sortTodos() {
    // If the sort by and order are the default sort (timestamp - asc), clear the sort
    if (this._sortBy !== "timestamp" || this._order !== "asc") {
      this._sortBy = "timestamp";
      this._order = "asc";
      console.log(c.magenta("Ordenação limpa."));
      return;
    }

    this._printTitle(c.magenta("Reordenar TODOs"));

    // Print the sort by actions
    const sortByActions = ["T - Título", "S - Status", "C - Criado em"];

    console.log(c.magenta(sortByActions.join(" | ")));
    const regex = this._buildActionsRegex(sortByActions);

    // Request the sort by from the user
    let actionInput = await terminal.requestInputKey(
      regex,
      `${c.bgMagenta(">")} `
    );

    terminal.write(actionInput);
    terminal.breakLine();

    // Define the sort by shortcuts
    const sortByShortcuts = {
      T: "title",
      S: "status",
      C: "timestamp",
    } as const;

    const sortByAction =
      actionInput.toUpperCase() as keyof typeof sortByShortcuts;

    // Set the sort by
    this._sortBy = sortByShortcuts[sortByAction];

    // Print the order actions
    const orderActions = ["C - Crescente", "D - Decrescente"];

    console.log(c.magenta(orderActions.join(" | ")));
    const orderRegex = this._buildActionsRegex(orderActions);

    // Request the order from the user
    actionInput = await terminal.requestInputKey(
      orderRegex,
      `${c.bgMagenta(">")} `
    );

    terminal.write(actionInput);
    terminal.breakLine();

    // Define the order shortcuts
    const orderShortcuts = {
      C: "asc",
      D: "desc",
    } as const;

    const orderAction =
      actionInput.toUpperCase() as keyof typeof orderShortcuts;

    // Set the order
    this._order = orderShortcuts[orderAction];
  }

  /**
   * @method nextPage
   * @description Go to the next page
   */
  nextPage() {
    this._page++;
    console.log(c.cyan(`Página alterada para ${this._page}.`));
  }

  /**
   * @method previousPage
   * @description Go to the previous page
   */
  previousPage() {
    this._page--;
    console.log(c.cyan(`Página alterada para ${this._page}.`));
  }

  /**
   * @method changePageSize
   * @description Change the page size
   */
  async changePageSize() {
    let valid = false;

    // Request the page size from the user until it is valid
    do {
      const index = await terminal.requestInputLine(
        /^[0-9]+$/, // Regex to match a number
        `${c.bgCyan("Digite o número de TODOs por página:")} `
      );

      const pageSize = Number(index);

      // If the page size is less than 1, print an error message and continue
      if (pageSize < 1) {
        console.log(c.red("Número inválido!"));
        valid = false;
        continue;
      }

      // Set the page size
      this._pageSize = pageSize;

      terminal.breakLine();
      console.log(c.cyan(`TODOs por página alterado para ${this._pageSize}.`));

      valid = true;
    } while (!valid);
  }

  /**
   * @method addTodo
   * @description Add a TODO
   */
  async addTodo() {
    // Request the TODO from the user
    const todo = await terminal.requestInputLine(
      /.+/, // Regex to match any text (not empty)
      `${c.bgGreen("Título do TODO:")} `
    );

    db.addTodo(todo);

    console.log(c.green("TODO adicionado com sucesso!\n"));
  }

  /**
   * @method selectTodo
   * @description Select a TODO
   */
  async selectTodo() {
    // If there is a selected TODO, deselect it
    if (this._selectedTodoId) {
      this._selectedTodoId = null;
      console.log(c.yellow("TODO desselecionado."));
      return;
    }

    let valid = false;

    // Request the TODO index from the user until it's valid
    do {
      const index = await terminal.requestInputLine(
        /^[0-9]+$/, // Regex to match a number
        `${c.bgYellow("Digite o número do TODO:")} `
      );

      const todos = this._getVisibleTodos();

      // Select based on the index (1-based) of the current page
      const todo = todos[Number(index) - 1];

      // If the TODO index is out of range, print an error message and continue
      if (!todo) {
        console.log(c.red("TODO não encontrado!"));
        valid = false;
        continue;
      }

      // Select the TODO
      this._selectedTodoId = todo.id;

      terminal.breakLine();
      console.log(c.green(`TODO ${this._todoString(todo)} selecionado.`));

      valid = true;
    } while (!valid);
  }

  // === TODO Actions ===

  /**
   * @method toggleTodoDone
   * @description Toggle the done status of the selected TODO
   */
  toggleTodoDone() {
    // If there is no selected TODO, print an error message and return
    if (!this._selectedTodoId) {
      console.log(c.red("Nenhum TODO selecionado"));
      return;
    }

    // Toggle the done status of the selected TODO
    const done = db.toggleTodoDone(this._selectedTodoId);

    console.log(c.green(`TODO marcado como ${done ? "feito" : "não feito"}!`));
  }

  /**
   * @method editTodo
   * @description Edit the selected TODO
   */
  async editTodo() {
    // If there is no selected TODO, print an error message and return
    if (!this._selectedTodoId) {
      console.log(c.red("Nenhum TODO selecionado"));
      return;
    }

    // Request the new title from the user
    const todo = await terminal.requestInputLine(
      /.*/,
      `${c.bgGreen("Novo título do TODO:")} `
    );

    // Edit the TODO
    db.editTodo(this._selectedTodoId, todo);

    console.log(c.green("TODO editado com sucesso!"));
  }

  /**
   * @method deleteTodo
   * @description Delete the selected TODO
   */
  deleteTodo() {
    // If there is no selected TODO, print an error message and return
    if (!this._selectedTodoId) {
      console.log(c.red("Nenhum TODO selecionado"));
      return;
    }

    // Delete the TODO
    db.deleteTodo(this._selectedTodoId);

    // Deselect the TODO
    this._selectedTodoId = null;

    console.log(c.green("TODO deletado com sucesso!"));
  }

  // === Helpers ===

  /**
   * @method _printTitle
   * @description Print a title
   */
  private _printTitle(title: string, divider = " ") {
    // Get the colored text
    const { text, colorApply } = getColoredText(title);

    // Calculate the number of equal signs to print
    const equalSigns = "=".repeat(
      Math.floor((BLOCK_WIDTH - text.length - 2) / 2)
    );

    // Print the title with the equal signs applying the color of the titleq
    console.log(
      colorApply(`${equalSigns}${divider}${text}${divider}${equalSigns}`)
    );
  }

  /**
   * @method _getFilteredTodos
   * @description Get the filtered TODOs
   */
  private _getFilteredTodos() {
    let todos = db.getTodos();

    // If the hide completed is true, filter out the TODOs that are done
    if (this._hideCompleted) {
      todos = todos.filter((todo) => !todo.done);
    }

    // If there is a search, filter the TODOs that match the search
    if (this._search) {
      // Split the search into terms
      const searchTerms = this._search.split(" ");

      // Filter the TODOs that match every term of the search
      todos = todos.filter((todo) =>
        searchTerms.every((term) =>
          new RegExp(this._escapeRegex(term.trim()), "gi").test(todo.title)
        )
      );
    }

    // If there is a non default sort by, sort the TODOs
    if (this._sortBy !== "timestamp") {
      todos = todos.sort((a, b) => {
        // If the sort by is status, sort by done status first, then by timestamp
        if (this._sortBy === "status") {
          return a.done === b.done
            ? a.timestamp.localeCompare(b.timestamp)
            : a.done
            ? 1
            : -1;
        }

        // If the sort by is title, sort by title
        return a[this._sortBy].localeCompare(b[this._sortBy]);
      });
    }

    // If the order is descending, reverse the TODOs
    if (this._order === "desc") {
      todos = todos.reverse();
    }

    return todos;
  }

  /**
   * @method _getVisibleTodos
   * @description Get the visible TODOs
   */
  private _getVisibleTodos() {
    const todos = this._getFilteredTodos();

    // Return the TODOs in the current page
    return todos.slice(
      (this._page - 1) * this._pageSize,
      this._page * this._pageSize
    );
  }

  /**
   * @method _getSelectedTodo
   * @description Get the selected TODO
   */
  private _getSelectedTodo() {
    // If there is no selected TODO, return null
    if (!this._selectedTodoId) return null;

    // Get the TODOs in the current page
    const todos = this._getVisibleTodos();

    // Return the selected TODO
    return todos.find((todo) => todo.id === this._selectedTodoId);
  }

  /**
   * @method _todoString
   * @description Get the string representation of a TODO
   */
  private _todoString(todo: Todo) {
    const timestamp = new Date(todo.timestamp)
      .toLocaleString()
      .replace(",", "");

    return `\`[${todo.done ? "X" : " "}] - ${timestamp} - ${todo.title}\``;
  }

  /**
   * @method _getMaxPage
   * @description Get the maximum page
   */
  private _getMaxPage() {
    return Math.ceil(this._getFilteredTodos().length / this._pageSize);
  }

  /**
   * @method _buildActionsRegex
   * @description Build the regex for the actions
   */
  private _buildActionsRegex(availableActions: string[]) {
    // Get the actions without the labels (e.g. "L - Listar TODOs" -> "L") and join them with a pipe (OR) ignoring case
    return new RegExp(
      availableActions.map((action) => action.split(" - ")[0]).join("|"),
      "i"
    );
  }

  /**
   * @method _escapeRegex
   * @description Escape the regex for the search
   */
  private _escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
}

export const controller = new Controller();
