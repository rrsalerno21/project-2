$(document).ready(() => {
  // Render on load
  renderTasks();

  // Event Listeners
  // eslint-disable-next-line prefer-arrow-callback
  $(document).on("click", ".complete-task-btn", updateTaskStatus);
  $(document).on("click", ".delete-task-btn", deleteTask);

  // Function to render the task list
  function renderTasks() {
    // identify the tasks div
    const tasksDiv = $("#tasks-div");

    // first empty the tasksDiv
    tasksDiv.empty();

    // then get our user's data
    $.get("/api/user_data").then(data => {
      console.log(data);

      // then iterate through the data
      for (item of data) {
        // identify each item of data
        const taskId = item.id,
          taskComplete = item.complete,
          taskTitle = item.task,
          taskDate = item.due_date,
          taskCategory = item.category;

        // create a new row with that data
        const newRow = createTaskRow(
          taskId,
          taskComplete,
          taskTitle,
          taskDate,
          taskCategory
        );

        // append the new row to our tasksDiv
        tasksDiv.append(newRow);
      }
    });
  }

  // Function to create new task rows
  function createTaskRow(
    taskId,
    taskComplete,
    taskTitle,
    taskDate,
    taskCategory
  ) {
    const rowItem = $("<tr>");

    if (taskComplete) {
      rowItem.attr({
        "data-id": taskId,
        "data-complete": taskComplete,
        class: "table-success"
      });
    } else {
      rowItem.attr({
        "data-id": taskId,
        "data-complete": taskComplete
      });
    }

    const formattedTime = moment(taskDate).format("MM/DD");

    const dateItem = $("<td>")
      .attr({
        class: "task-date",
        scope: "row"
      })
      .text(formattedTime);

    const titleItem = $("<td>")
      .attr({
        class: "task-title"
      })
      .text(taskTitle);

    const categoryItem = $("<td>")
      .attr({
        class: "task-category"
      })
      .text(taskCategory);

    const buttonSection = $("<th>");

    const completeButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-success mt-3 complete-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-check-square"></i>`);

    const deleteButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-danger mt-3 delete-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-trash-alt"></i>`);

    const editButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-warning mt-3 edit-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-pencil-alt"></i>`);

    buttonSection.append(completeButton, deleteButton, editButton);
    rowItem.append(dateItem, titleItem, categoryItem, buttonSection);

    return rowItem;
  }

  // Function to update the status of the task
  function updateTaskStatus() {
    let updatedTaskStatus;
    const selectedRow = $(this)
      .parent()
      .parent();
    const dataId = selectedRow.data("id");
    const taskComplete = selectedRow.data("complete");
    const taskDate = selectedRow.children(".task-date").text();
    const taskTitle = selectedRow.children(".task-title").text();
    const taskCategory = selectedRow.children(".task-category").text();

    selectedRow.toggleClass("table-success");

    if (taskComplete) {
      updatedTaskStatus = false;
    } else {
      updatedTaskStatus = true;
    }

    $.ajax({
      url: "/api/edit",
      type: "PUT",
      data: {
        task: taskTitle,
        due_date: taskDate,
        category: taskCategory,
        complete: updatedTaskStatus,
        id: dataId
      }
    }).then(data => console.log(`${data}`));
  }
  // Function to update the status of the task
  function deleteTask() {
    const selectedRow = $(this)
      .parent()
      .parent();
    const dataId = selectedRow.data("id");

    console.log(dataId);

    $.ajax({
      url: "/api/delete-task",
      method: "DELETE",
      data: {
        id: dataId
      }
    }).then(data => {
      console.log(data);
      renderTasks();
    });
  }
});
