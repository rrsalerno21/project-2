$(document).ready(() => {
  // Render on load
  renderTasks();
  renderInputTasks();

  // Event Listeners
  $(document).on("click", ".complete-task-btn", updateTaskStatus);
  $(document).on("click", ".delete-task-btn", deleteTask);
  $(document).on("click", ".edit-task-btn", openEditModal);
  $("#save-edit-btn").on("click", saveEdit);
  $("#categoryInput").on("change", openCategoryModal);
  $("#add-task-btn").on("click", addTask);
  $("#save-new-category").on("click", addNewCategory);

  // Function to render the task list
  function renderTasks() {
    // identify the tasks div
    const tasksDiv = $("#tasks-div");

    // first empty the tasksDiv
    tasksDiv.empty();

    // then get our user's data
    $.get("/api/user_data").then(response => {
      console.log(response);
      const data = response.tasks;

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

    const formattedTime = moment.utc(taskDate).format("MM/DD");

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
      selectedRow.attr("data-complete", "false");
    } else {
      updatedTaskStatus = true;
      selectedRow.attr("data-complete", "true");
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
    }).then(data => {
      console.log(`${data}`);
      renderTasks();
    });
  }
  // Function to delete a task
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
      renderInputTasks();
    });
  }

  async function openEditModal() {
    // clear error message if already used
    $("#edit-task-alert").fadeOut(100);
    const selectedRow = $(this)
      .parent()
      .parent();
    const taskId = selectedRow.data("id");
    const taskComplete = selectedRow.data("complete");
    const taskTitle = selectedRow.children(".task-title").text();
    const taskCategory = selectedRow.children(".task-category").text();

    // get category list
    try {
      const userData = await $.ajax({
        url: "/api/user_data",
        method: "GET"
      });

      const taskData = userData.tasks;

      // declare array for categories and variable to get the task due date
      const catArray = [];
      let userDate;

      // loop through userData
      for (item of taskData) {
        catArray.push(item.category);
        if (item.task === taskTitle) {
          userDate = item.due_date;
        }
      }

      // remove duplicate categories from list
      removeDupes(catArray);

      // format due date
      const formattedDate = userDate.split("T")[0];

      // set title and date to selected task data for editing
      $("#modal-task-title").val(taskTitle);
      $("#modal-task-date").val(formattedDate);

      // handle the category section
      // --first empty the select element of options
      $("#edit-categoryInput").empty();

      // --then iterate throw the catArray to append options
      // --while selecting the current category
      let selectedCat;

      for (cat of catArray) {
        if (cat === taskCategory) {
          selectedCat = $("<option>")
            .attr("selected", "")
            .text(cat);
          $("#edit-categoryInput").append(selectedCat);
        } else {
          selectedCat = $("<option>").text(cat);
          $("#edit-categoryInput").append(selectedCat);
        }
      }

      // set the id onto the save button
      $("#save-edit-btn").attr({
        "data-id": taskId,
        "data-complete": taskComplete
      });

      // open the modal
      $("#task-modal-btn").click();
    } catch (error) {
      throw error;
    }
  }

  function saveEdit() {
    const modalTaskTitle = $("#modal-task-title").val(),
      modalTaskDate = $("#modal-task-date").val(),
      modalCategory = $("#edit-categoryInput").val(),
      modalTaskComplete = $("#save-edit-btn").data("complete"),
      modalTaskId = $("#save-edit-btn").data("id"),
      acceptableCharacters = /[^A-Za-z0-9 .'?!,@$*#\-_\n\r]/;

    console.log(modalTaskTitle, modalTaskDate, modalCategory);

    if (!modalTaskTitle || !modalTaskDate || !modalCategory) {
      $("#edit-task-alert .msg").text(
        "Please provide a task Name, Date, and Category to save your edit."
      );
      $("#edit-task-alert").fadeIn(500);
      return;
    }

    // check for unnacceptable characters
    if (
      acceptableCharacters.test(modalTaskTitle) ||
      acceptableCharacters.test(modalCategory)
    ) {
      $("#edit-task-alert .msg").text(
        "Unnacceptable characters found in your inputs. \n (Only accepts alphanumeric and .'?!,@$#-*_ characters)"
      );
      $("#edit-task-alert").fadeIn(500);
      $("#modal-task-title").focus();
      return;
    }

    $("#edit-task-alert").fadeOut(250);

    $.ajax({
      url: "/api/edit",
      method: "PUT",
      data: {
        task: modalTaskTitle,
        due_date: modalTaskDate,
        category: modalCategory,
        complete: modalTaskComplete,
        id: modalTaskId
      }
    })
      .then(data => {
        console.log(data);
        $("#edit-modal-close").click();
        renderTasks();
        renderInputTasks();
      })
      .catch(err => console.log(err));
  }

  function openCategoryModal() {
    // remove error message if previously used
    $("#add-category-alert").fadeOut(100);
    const newCatBtn = $("#categoryInput");
    if (newCatBtn.val() === "Add New Category") {
      console.log("you clicked me");
      // empty the value from any previous use
      $("#new-category-create").val("");
      $("#cat-modal-btn").click();
      newCatBtn.val("");
    }
  }

  async function renderInputTasks() {
    // clear Task input field
    $("#taskInput").val("");

    // set current date in date field
    $("#dateInput").val(moment().format("YYYY-MM-DD"));

    // get category list
    try {
      const userData = await $.ajax({
        url: "/api/user_data",
        method: "GET"
      });

      const taskData = userData.tasks;

      // declare array for categories
      const catArray = [];

      // loop through userData
      for (item of taskData) {
        catArray.push(item.category);
      }

      // remove duplicate categories from list
      removeDupes(catArray);

      // handle the category section
      // --first empty the select element of options
      $("#categoryInput").empty();

      // --then iterate throw the catArray to append options
      // --while selecting the current category
      const disabledChoice = $("<option>")
        .attr({
          selected: "",
          disabled: "",
          value: ""
        })
        .text("Choose");

      const newCatChoice = $("<option>").text("Add New Category");

      $("#categoryInput").append(disabledChoice);

      let newOption;
      for (cat of catArray) {
        newOption = $("<option>").text(cat);
        $("#categoryInput").append(newOption);
      }

      $("#categoryInput").append(newCatChoice);
    } catch (err) {
      throw err;
    }
  }

  async function addTask() {
    const taskInput = $("#taskInput").val(),
      taskDate = $("#dateInput").val(),
      taskCategory = $("#categoryInput").val(),
      acceptableCharacters = /[^A-Za-z0-9 .'?!,@$*#\-_\n\r]/;

    // check for input validation
    if (!taskInput || !taskDate || !taskCategory) {
      $("#add-task-alert .msg").text(
        "Please provide a task Name, Date, and Category."
      );
      $("#add-task-alert").fadeIn(500);
      return;
    }

    // check for unnacceptable characters
    if (
      acceptableCharacters.test(taskInput) ||
      acceptableCharacters.test(taskCategory)
    ) {
      $("#add-task-alert .msg").text(
        "Unnacceptable characters found in your inputs. \n (Only accepts alphanumeric and .'?!,@$#-*_ characters)"
      );
      $("#add-task-alert").fadeIn(500);
      $("#taskInput").focus();
      return;
    }

    $("#add-task-alert").fadeOut(250);

    try {
      const userData = await $.get("/api/user_data");

      const newTask = await $.post("/api/create", {
        task: taskInput,
        due_date: taskDate,
        category: taskCategory,
        complete: false,
        UserId: userData.userID
      });

      console.log(newTask);

      renderTasks();
      renderInputTasks();
    } catch (error) {
      $("#add-task-alert .msg").text(
        "Something went wrong.  Check your internet connection and try again"
      );
      $("#add-task-alert").fadeIn(500);
      throw error;
    }
  }

  async function addNewCategory() {
    acceptableCharacters = /[^A-Za-z0-9 .'?!,@$*#\-_\n\r]/;
    const newCatVal = $("#new-category-create").val();

    if (!newCatVal) {
      $("#add-category-alert .msg").text("Please provide a new category name.");
      $("#add-category-alert").fadeIn(500);
      return;
    }

    if (acceptableCharacters.test(newCatVal)) {
      $("#add-category-alert .msg").text(
        "Unnacceptable characters found in your category input. (Only accepts alphanumeric and .'?!,@$#-*_ characters)"
      );
      $("#add-category-alert").fadeIn(500);
      return;
    }

    $("#add-category-alert").fadeOut(500);

    const newCatOption = $("<option>")
      .attr("selected", "")
      .text(newCatVal);

    // render the categories once more to remove any previously made categories
    await renderInputTasks();

    // remove the choice option
    $("#categoryInput option")
      .first()
      .remove();

    // add our new category to the category list
    $("#categoryInput").prepend(newCatOption);

    // close our category modal
    $("#close-cat-modal").click();
  }

  // HELPER FUNCTIONS
  // ===================

  function removeDupes(arr) {
    bubbleSort(arr);

    for (let i = arr.length; i >= 0; i--) {
      if (arr[i] === arr[i - 1]) {
        arr.splice(i, 1);
      }
    }

    return arr;
  }

  function bubbleSort(arr) {
    let done = false;
    while (!done) {
      done = true;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] > arr[i + 1]) {
          done = false;
          const tmp = arr[i + 1];
          arr[i + 1] = arr[i];
          arr[i] = tmp;
        }
      }
    }
    return arr;
  }
});
