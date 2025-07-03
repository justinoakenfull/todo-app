# Todo App

A minimalist, theme-toggleable Todo application built with plain HTML, CSS and JavaScript.  
This project is a work in progress: the UI is mostly styled, but core JS behavior (adding items, marking complete, filtering and drag-and-drop) has yet to be implemented.

---

## Table of Contents

1. [Demo](#demo)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
5. [Usage](#usage)  
6. [Project Structure](#project-structure)  
7. [Roadmap](#roadmap)

---

## Demo

> **Note:** No live demo yet. To preview, open `index.html` in your browser or serve the folder with any static-file server (e.g. VS Code Live Server).

---

## Features

- Responsive header with **light / dark** mode toggle  
- Styled input row with checked / unchecked icons  
- Base layout for filter controls (All, Active, Completed)  
- Placeholder for items-remaining count and “Clear Completed” action  
- Drag-and-drop hint text  

---

## Tech Stack

- **HTML5** for structure  
- **CSS3** with custom properties and flexbox layout  
- **JavaScript** (vanilla) for future dynamic behavior  

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)  
- Optionally [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or another local HTTP server  

### Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/justinoakenfull/todo-app.git
   cd todo-app-main
   ```

2. **Open in browser**  
   - Double-click `index.html`, or  
   - Run a static server:  
     ```bash
     npx serve .
     ```

---

## Usage

1. Click the **sun / moon** icon to toggle light and dark theme. (implementation pending)
2. Type a new task in the input and press **Enter** (JS handler pending).  
3. Click the circular icon to mark a task complete (handler pending).  
4. Use the filter links (**All**, **Active**, **Completed**) to view subsets (handlers pending).  
5. Drag tasks to reorder (implementation pending).  

---

## Project Structure

```
/
├─ images/                   # SVG and PNG assets
│  ├─ icon-moon.svg
│  ├─ icon-sun.svg
│  ├─ icon-check.svg
│  └─ favicon-32x32.png
├─ index.html                # Main HTML layout
├─ style.css                 # Flex-based styling and theming
└─ README.md                 # Project overview and setup
```

---

## Roadmap

- [ ] Add JS logic to **create** new todo items  
- [ ] Persist todos in **localStorage**  
- [ ] Implement **complete / uncomplete** toggle  
- [ ] Build **filter** buttons (All / Active / Completed)  
- [ ] Wire up **clear completed** action  
- [ ] Add **drag-and-drop** reordering  
- [ ] Animate item transitions and theme changes  

---