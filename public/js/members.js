$(document).ready(() => {
  // Execute on load
  renderTasks();
  renderInputTasks();

  // Event Listeners
  // ===================================
  $("#add-task-btn").on("click", addTask);
  $("#categoryInput").on("change", openCategoryModal);
  $("#save-new-category").on("click", addNewCategory);
  $(document).on("click", ".complete-task-btn", updateTaskStatus);
  $(document).on("click", ".delete-task-btn", deleteTask);
  $(document).on("click", ".edit-task-btn", openEditModal);
  $("#save-edit-btn").on("click", saveEdit);

  // RENDERING FUNCTIONS
  // ====================================

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

  // Function to create new task rows when executing renderTasks()
  function createTaskRow(
    taskId,
    taskComplete,
    taskTitle,
    taskDate,
    taskCategory
  ) {
    // Create our table row
    const rowItem = $("<tr>");

    // Determine which attributes to add depending on the status of the task
    if (taskComplete) {
      // if the task is completed, add class "table success" along with data attr.
      rowItem.attr({
        "data-id": taskId,
        "data-complete": taskComplete,
        class: "table-success"
      });
    } else {
      // else, don't include the class "table success"
      rowItem.attr({
        "data-id": taskId,
        "data-complete": taskComplete
      });
    }

    // Format our data's time to just month and date for UI
    const formattedTime = moment.utc(taskDate).format("MM/DD");

    // Create our date item
    const dateItem = $("<td>")
      .attr({
        class: "task-date",
        scope: "row"
      })
      .text(formattedTime);

    // Create our title item
    const titleItem = $("<td>")
      .attr({
        class: "task-title"
      })
      .text(taskTitle);

    // Create our category item
    const categoryItem = $("<td>")
      .attr({
        class: "task-category"
      })
      .text(taskCategory);

    // Create our button section item
    const buttonSection = $("<th>");

    // Create our complete button item with icon included
    const completeButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-success mt-3 complete-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-check-square"></i>`);

    // Create our delete button item with icon included
    const deleteButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-danger mt-3 delete-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-trash-alt"></i>`);

    // Create our edit button item with icon included
    const editButton = $("<button>")
      .attr({
        type: "button",
        class: "btn btn-warning mt-3 edit-task-btn"
      })
      // eslint-disable-next-line quotes
      .html(`<i class="fas fa-pencil-alt"></i>`);

    // Append our three buttons into our button section item
    buttonSection.append(completeButton, deleteButton, editButton);

    // Append all of our items to our rowItem
    rowItem.append(dateItem, titleItem, categoryItem, buttonSection);

    // return our rowItem
    return rowItem;
  }

  // Function to render the values of the Add Task input form
  function renderInputTasks() {
    // clear Task input field
    $("#taskInput").val("");

    // set current date in date field
    $("#dateInput").val(moment().format("YYYY-MM-DD"));

    // get category list
    renderCategoryList();
  }

  // Function to render the category list for the Add Task input form
  async function renderCategoryList() {
    try {
      // Get our user data
      const userData = await $.get("/api/user_data");

      // Declare taskData to select just the tasks from our response
      const taskData = userData.tasks;

      // Declare an empty array that we can push our categories to
      const catArray = [];

      // Loop through taskData to do the push all categories to catArray
      for (item of taskData) {
        catArray.push(item.category);
      }

      // Remove duplicate categories from catArray (see helper functions)
      removeDupes(catArray);

      // Now to render our catArray into the category section
      // First empty the select element of options
      $("#categoryInput").empty();

      // Create our default options we know will exist in the list:
      // Create a disabledChoice option:
      const disabledChoice = $("<option>")
        .attr({
          selected: "",
          disabled: "",
          value: ""
        })
        .text("Choose");

      // Create a new category option:
      const newCatChoice = $("<option>").text("Add New Category");

      // Append the disabledChoice option first
      $("#categoryInput").append(disabledChoice);

      // Then iterate through the catArray to append options
      let catOption;
      for (cat of catArray) {
        catOption = $("<option>").text(cat);
        $("#categoryInput").append(catOption);
      }

      // finally, append the newCatChoice option as the last option
      $("#categoryInput").append(newCatChoice);
    } catch (err) {
      throw err;
    }
  }

  // LISTENER FUNCTIONS
  // =======================================

  // Function to add a task
  async function addTask() {
    // Declare the existing values from the inputs and a
    // regex object for validating inputs
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

    // check for unnacceptable characters and alert if found
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

    // fadeOut the alert message if it still is fadedIn
    $("#add-task-alert").fadeOut(250);

    try {
      // Get the user's data
      const userData = await $.get("/api/user_data");

      // Post the new task using the input values and userData
      await $.post("/api/create", {
        task: taskInput,
        due_date: taskDate,
        category: taskCategory,
        complete: false,
        UserId: userData.userID
      });

      // Then render the new task list and reset the Add Task form values
      renderTasks();
      renderInputTasks();
    } catch (error) {
      // If there's an error, alert using the alert div for the form and throw error
      $("#add-task-alert .msg").text(
        "Something went wrong.  Check your internet connection and try again"
      );
      $("#add-task-alert").fadeIn(500);
      throw error;
    }
  }

  // Function to open the Category Modal
  function openCategoryModal() {
    // Remove error message if previously used
    $("#add-category-alert").fadeOut(100);

    // Declare the selector for the category input
    const newCatBtn = $("#categoryInput");

    // If the changed value is "Add New Category", then we execute our
    // opening code
    if (newCatBtn.val() === "Add New Category") {
      // First empty the value from any previous use
      $("#new-category-create").val("");

      // Click on the hidden modal button
      $("#cat-modal-btn").click();

      // Select an empty option for the category input so that if the user
      // cancels out of adding a new category, they can change to "Add New
      // Category option again"
      newCatBtn.val("");
    }
  }

  // Function to add a new category within the Category Modal
  async function addNewCategory() {
    // Declare the existing values from the inputs and a
    // regex object for validating inputs
    acceptableCharacters = /[^A-Za-z0-9 .'?!,@$*#\-_\n\r]/;
    const newCatVal = $("#new-category-create").val();

    // Validate inputs are not empty
    if (!newCatVal) {
      $("#add-category-alert .msg").text("Please provide a new category name.");
      $("#add-category-alert").fadeIn(500);
      return;
    }

    // Validate inputs contain only acceptable characters
    if (acceptableCharacters.test(newCatVal)) {
      $("#add-category-alert .msg").text(
        "Unnacceptable characters found in your category input. (Only accepts alphanumeric and .'?!,@$#-*_ characters)"
      );
      $("#add-category-alert").fadeIn(500);
      return;
    }

    // FadeOut alert message if already fadedIn
    $("#add-category-alert").fadeOut(100);

    // Create a new option to be added to category input list
    const newCatOption = $("<option>")
      .attr("selected", "")
      .text(newCatVal);

    try {
      // Render the categories once more to remove any previously made categories
      await renderCategoryList();

      // Remove the choice option
      $("#categoryInput option")
        .first()
        .remove();

      // Add our new category to the category list
      $("#categoryInput").prepend(newCatOption);

      // Close our category modal
      $("#close-cat-modal").click();
    } catch (error) {
      throw error;
    }
  }

  // Function to update the status of the task
  function updateTaskStatus() {
    // Declare variables and select our values from UI
    let updatedTaskStatus;
    const selectedRow = $(this)
      .parent()
      .parent();
    const dataId = selectedRow.data("id");
    const taskComplete = selectedRow.data("complete");
    const taskDate = selectedRow.children(".task-date").text();
    const taskTitle = selectedRow.children(".task-title").text();
    const taskCategory = selectedRow.children(".task-category").text();

    // Toggle the "table-success" class to add/remove green background
    selectedRow.toggleClass("table-success");

    // Toggle the task-complete data attribute and set updatedTaskStatus
    // to the opposite of the current status
    if (taskComplete) {
      updatedTaskStatus = false;
      selectedRow.attr("data-complete", "false");
    } else {
      updatedTaskStatus = true;
      selectedRow.attr("data-complete", "true");
    }

    // Execute a PUT request to update the task's status
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
    })
      .then(data => {
        // Log the new task to the console
        console.log(`${data}`);

        // then render the task list again to the UI to reflect
        // the data-complete attr for each table row
        renderTasks();
      })
      .catch(err => {
        throw err;
      });
  }

  // Function to delete a task
  function deleteTask() {
    // Declare selected row and its data-id attribute
    const selectedRow = $(this)
      .parent()
      .parent();
    const dataId = selectedRow.data("id");

    // Execute a DELETE request using the dataId
    $.ajax({
      url: "/api/delete-task",
      method: "DELETE",
      data: {
        id: dataId
      }
    }).then(data => {
      // Log the response to the console
      console.log(data);

      // Render the task list again
      renderTasks();

      // Render the category list to update if the category
      // has been removed completely
      renderCategoryList();
    });
  }

  // Function to open the edit modal
  async function openEditModal() {
    // Clear error message if already used
    $("#edit-task-alert").fadeOut(100);

    // Declare the selected row, it's data attributes, and row's values
    const selectedRow = $(this)
      .parent()
      .parent();
    const taskId = selectedRow.data("id");
    const taskComplete = selectedRow.data("complete");
    const taskTitle = selectedRow.children(".task-title").text();
    const taskCategory = selectedRow.children(".task-category").text();

    try {
      // Get category list (slightly different operation than our
      // renderCategoryList fn)
      const userData = await $.get("/api/user_data");

      // Declare taskData to select the user's tasks specifically
      const taskData = userData.tasks;

      // Declare array for categories and variable to get the task due date
      const catArray = [];
      let userDate;

      // loop through userData to push categories to catArray and also find
      // the task's due date
      for (item of taskData) {
        catArray.push(item.category);
        if (item.id === taskId) {
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

      // Handle the category section
      // First empty the select element of options
      $("#edit-categoryInput").empty();

      // Then iterate throw the catArray to append options
      // while selecting the current category
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

      // Set the id onto the save button
      $("#save-edit-btn").attr({
        "data-id": taskId,
        "data-complete": taskComplete
      });

      // Open the modal
      $("#task-modal-btn").click();
    } catch (error) {
      throw error;
    }
  }

  // Function to edit a task within the edit modal
  function saveEdit() {
    // Declare input values and regex object for acceptable characters
    const modalTaskTitle = $("#modal-task-title").val(),
      modalTaskDate = $("#modal-task-date").val(),
      modalCategory = $("#edit-categoryInput").val(),
      modalTaskComplete = $("#save-edit-btn").data("complete"),
      modalTaskId = $("#save-edit-btn").data("id"),
      acceptableCharacters = /[^A-Za-z0-9 .'?!,@$*#\-_\n\r]/;

    // Validate for empty inputs
    if (!modalTaskTitle || !modalTaskDate || !modalCategory) {
      $("#edit-task-alert .msg").text(
        "Please provide a task Name, Date, and Category to save your edit."
      );
      $("#edit-task-alert").fadeIn(500);
      return;
    }

    // Check for unnacceptable characters
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

    // FadeOut alert message if already fadedIn
    $("#edit-task-alert").fadeOut(250);

    // Execute PUT request to update the task's data
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
        // Log the resposne to the console
        console.log(data);

        // Close the Edit Task Modal
        $("#edit-modal-close").click();

        // Render our Task List
        renderTasks();

        // Render the Add Task form inputs
        renderInputTasks();
      })
      .catch(err => {
        throw err;
      });
  }

  // HELPER FUNCTIONS
  // ====================================

  // Function to remove duplicate elements from an array
  function removeDupes(arr) {
    // Sort the array alphabetically (or from least to greatest)
    bubbleSort(arr);

    // loop through each element of the array from right to left
    for (let i = arr.length; i >= 0; i--) {
      // if the current element is equal to the element to its left...
      if (arr[i] === arr[i - 1]) {
        // remove the current element
        arr.splice(i, 1);
      }
    }

    // return the given array
    return arr;
  }

  // Bubble sort fuction to order an array alphabetically
  function bubbleSort(arr) {
    // Use variable 'done' as a flag for the while loop
    let done = false;
    // While we're not done
    while (!done) {
      // switch the flag to true
      done = true;
      // iterate through the array from left to right
      for (let i = 0; i < arr.length; i++) {
        // if the current element is larger than its right neighbor
        if (arr[i] > arr[i + 1]) {
          // switch the flag to false
          done = false;
          // swap the elements using a temporary varialbe, tmp
          const tmp = arr[i + 1];
          arr[i + 1] = arr[i];
          arr[i] = tmp;
        }
      }
    }

    // return the given array
    return arr;
  }
});
