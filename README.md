# TODO CLI

A powerful command-line interface application for managing your TODOs efficiently.

## Features

- Add, edit, and delete TODOs
- Mark TODOs as done/undone
- List TODOs with pagination support
- Search for specific TODOs
- Sort TODOs by title, creation time, or status
- Hide completed TODOs
- Color-coded interface for better readability

## Installation

### Option 1: Download the Executable (Recommended)

Download the latest executable from the [releases page](https://github.com/joaomrsouza/todo-cli/releases).

Run the application by double-clicking the executable or from your terminal:
```
./todo-cli
```

### Option 2: Run with Bun (For Development)

If you're a developer and want to run the application using Bun, see the [Development](#development) section below.

## Usage

### Available Commands

The application supports the following keyboard commands:

| Key | Action |
|-----|--------|
| L | List TODOs |
| A | Add a new TODO |
| S | Select/Deselect a TODO |
| X | Toggle TODO status (done/undone) |
| D | Delete selected TODO |
| E | Edit selected TODO |
| B | Search TODOs / Clear search |
| R | Sort TODOs / Clear sorting |
| Z | Toggle hide/show completed TODOs |
| V | Next page |
| C | Previous page |
| W | Change page size |
| Q | Quit the application |

## Data Storage

The application stores TODOs in a JSON file (`todos.json`) in the directory where the executable is run.

## Development

### Prerequisites

- [Bun](https://bun.sh/) (recommended)
- Node.js (version 22.6.0 or higher) as an alternative

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/joaomrsouza/todo-cli.git
   cd todo-cli
   ```

2. Install dependencies:
   ```
   bun install
   ```

### Running in Development Mode

```
bun run dev
```

### Building the Executable

```
bun run bun:build
```

The executable will be created in the `dist` directory.

### Running with Node.js

If you prefer to use Node.js instead of Bun:

```
npm run node:start
```

Note: The project requires Node.js 22.6.0 or higher to run properly.

## Project Structure

- `src/index.ts` - Entry point of the application
- `src/controller.ts` - Main controller handling application logic
- `src/database.ts` - Database operations for TODOs
- `src/terminal.ts` - Terminal input/output operations
- `src/colors.ts` - Color utilities for terminal output

## License

MIT
