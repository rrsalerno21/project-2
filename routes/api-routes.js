// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting data about our user's tasks to be used client side
  app.get("/api/user_data", (req, res) => {
    console.log(req.user);
    if (!req.user) {
      // The user is not logged in, send back a 403 status code
      res.status(403).end();
    } else {
      // Otherwise send back the user's data
      db.Task.findAll({
        where: {
          userID: req.user.id
        },
        include: db.User.email
      })
        .then(tasks => res.status(200).json(tasks))
        .catch(err => res.status(404).send(err));
    }
  });

  // CHECK FOR SECURITY. Post route to create a new task
  app.post("/api/create", (req, res) => {
    console.log(req.user);
    db.Task.create({
      task: req.body.task,
      due_date: req.body.due_date,
      due_date_time: req.body.due_date_time,
      category: req.body.category,
      UserId: req.body.UserId
    })
      .then(newTask => res.status(201).json(newTask))
      .catch(err => res.status(404).send(err));
  });

  app.put("/api/edit", (req, res) => {
    db.Task.update(
      {
        task: req.body.task,
        due_date: req.body.due_date,
        due_date_time: req.body.due_date_time,
        category: req.body.category
      },
      {
        where: {
          id: req.body.id
        }
      }
    )
      .then(editedTask => res.status(200).json(editedTask))
      .catch(err => res.status(404).send(err));
  });

  app.delete("/api/delete-task", (req, res) => {
    db.Task.destroy({
      where: {
        id: req.body.id
      }
    })
      .then(() => res.status(200).send("Task deleted"))
      .catch(err => res.status(404).send(err));
  });
};
