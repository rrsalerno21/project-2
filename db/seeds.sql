-- User Seeds
INSERT INTO users (email, password, state, createdAt, updatedAt)
VALUES ('jim@hotmail.com', '$2a$10$rBZuWlxUSjJ8mT/aGRS5C.2CbPK5tpJSPKzS4vbPMLTO3DttCA3Uu', 'CA', '2020-07-09 19:00:00', '2020-07-09 19:00:00');

INSERT INTO users (email, password, state, createdAt, updatedAt)
VALUES ('joe@hotmail.com', '$2a$10$rBZuWlxUSjJ8mT/aGRS5C.2CbPK5tpJSPKzS4vbPMLTO3DttCA3Uu', 'NY', '2020-07-09 19:00:00', '2020-07-09 19:00:00');

INSERT INTO users (email, password, state, createdAt, updatedAt)
VALUES ('james@hotmail.com', '$2a$10$rBZuWlxUSjJ8mT/aGRS5C.2CbPK5tpJSPKzS4vbPMLTO3DttCA3Uu', 'OR', '2020-07-09 19:00:00', '2020-07-09 19:00:00');

-- Task Seeds
INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Buy groceries', '2020-07-09', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 1);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Buy shoes', '2020-07-11', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 1);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Go for a walk', '2020-07-19', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 1);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Study', '2020-07-12', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 2);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Finish work', '2020-07-13', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 2);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Go swimming', '2020-07-14', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 2);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Hang my clothes', '2020-07-09', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 3);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Feed the dog', '2020-07-29', 'General', false, '2020-07-09 19:00:00', '2020-07-09 19:00:00', 3);

INSERT INTO tasks (task, due_date, category, complete, createdAt, updatedAt, userId)
VALUES ('Cook dinner', '2020-07-18', 'General', false,'2020-07-09 19:00:00', '2020-07-09 19:00:00', 3);