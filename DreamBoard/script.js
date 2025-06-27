document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".board").forEach(board => {
        board.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON" && e.target.textContent === "🗑️") {
                e.target.closest(".task").remove();
            }
        });
    });

    document.querySelectorAll(".add-new button").forEach(button => {
        button.addEventListener("click", () => {
            const input = button.previousElementSibling;
            const text = input.value.trim();
            if (!text) return;
            const task = document.createElement("div");
            task.className = "task";
            task.setAttribute("draggable", "true");
            task.innerHTML = `${text} <button>🗑️</button>`;
            button.closest(".column").insertBefore(task, button.closest(".add-new"));
            input.value = "";
        });
    });

    let draggedTask = null;

    document.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("task")) {
            draggedTask = e.target;
            e.target.classList.add("dragging");
            e.target.style.opacity = "0.5";
        }
    });

    document.addEventListener("dragend", (e) => {
        if (draggedTask) {
            draggedTask.classList.remove("dragging");
            draggedTask.style.opacity = "1";
            draggedTask = null;
        }
    });


    document.querySelectorAll(".column").forEach(column => {
        column.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        column.addEventListener("drop", (e) => {
            e.preventDefault();
            if (!draggedTask) return;

            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.insertBefore(draggedTask, column.querySelector(".add-new"));
            } else {
                column.insertBefore(draggedTask, afterElement);
            }
        });

    });
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    document.querySelectorAll(".task").forEach(task => {
        task.setAttribute("draggable", "true");
    });
});

function exportBoard() {
  const board = {};
  document.querySelectorAll(".column").forEach(column => {
    const columnName = column.querySelector("h2").textContent.trim();
    board[columnName] = [];
    column.querySelectorAll(".task").forEach(task => {
      board[columnName].push(task.textContent.trim());
    });
  });

  const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dreamboard.json";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("exportBtn").addEventListener("click", exportBoard);

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importInput").click();
});

document.getElementById("importInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      loadBoardFromData(data);
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});
function loadBoardFromData(data) {
  document.querySelectorAll(".column").forEach(column => {
    const columnName = column.querySelector("h2").textContent.trim();
    const container = column.querySelector(".task-container");
    container.innerHTML = "";

    (data[columnName] || []).forEach(taskText => {
      const task = createTask(taskText);
      container.appendChild(task);
    });

    container.appendChild(createAddInput(column));
  });
}

function comingsoon() {
  alert("Saving coming soon :)");
}