const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {format, isValid} = require('date-fns')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started At: http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error : ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//Methods Used for API 1
//when status only as an query parameter
function isStatusOnly(queries) {
  const {status, priority, search_q, category} = queries
  if (
    status !== undefined &&
    priority === undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    return true
  } else {
    return false
  }
}

//when priority only as an query parameter
function isPriorityOnly(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority !== undefined &&
    status === undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    return true
  } else {
    return false
  }
}

//when priority and status both are present as query parameter
function isPriorityAndStatusBoth(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority !== undefined &&
    status !== undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    return true
  } else {
    return false
  }
}

//when search_q only present in the query parameter
function isSearchQOnly(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority === undefined &&
    status === undefined &&
    search_q !== undefined &&
    category === undefined
  ) {
    return true
  } else {
    return false
  }
}

//when category and status are query parameters
function isCategoryAndStatusBoth(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority === undefined &&
    status !== undefined &&
    search_q === undefined &&
    category !== undefined
  ) {
    return true
  } else {
    return false
  }
}

//when only category as a parameter
function isCategoryOnly(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority === undefined &&
    status === undefined &&
    search_q === undefined &&
    category !== undefined
  ) {
    return true
  } else {
    return false
  }
}

//when category and priority both
function isCategoryAndPriorityBoth(queries) {
  const {status, priority, search_q, category} = queries
  if (
    priority !== undefined &&
    status === undefined &&
    search_q === undefined &&
    category !== undefined
  ) {
    return true
  } else {
    return false
  }
}

//functions to check validity of status, priority, category, due date
//for status
function isStatusValid(status) {
  if (status === 'TO DO' || status === 'DONE' || status === 'IN PROGRESS') {
    return true
  } else {
    return false
  }
}
//for priority
function isPriorityValid(priority) {
  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    return true
  } else {
    return false
  }
}
//for category
function isCategoryValid(category) {
  if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
    return true
  } else {
    return false
  }
}
//for dueDate
function isDueDateValid(dueDAte) {
  let d = new Date(dueDAte)
  if (isValid(d)) {
    return true
  } else {
    return false
  }
}

//API 1
app.get('/todos/', async (request, response) => {
  const queries = request.query
  const {status, priority, search_q, category} = queries
  console.log(status, priority, search_q, category)

  let listOfAllTodosQuery = null
  let todoList = null

  switch (true) {
    case isStatusOnly(queries):
      listOfAllTodosQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            status = "${status}";`

      if (isStatusValid(status)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case isPriorityOnly(queries):
      listOfAllTodosQuery = `
      SELECT 
        *
      FROM
        todo
      WHERE
        priority = "${priority}";`

      if (isPriorityValid(priority)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }

      break
    case isPriorityAndStatusBoth(queries):
      listOfAllTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        priority = "${priority}"
      AND 
        status = "${status}";`

      if (isPriorityValid(priority) && isStatusValid(status)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        if (!isStatusValid(status)) {
          response.send('Invalid Todo Status')
        } else if (!isPriorityValid(priority)) {
          response.send('Invalid Todo Priority')
        }
      }
      break
    case isSearchQOnly(queries):
      listOfAllTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        todo LIKE "%${search_q}%";`

      todoList = await db.all(listOfAllTodosQuery)
      response.send(
        todoList.map(eachitem => ({
          id: eachitem.id,
          todo: eachitem.todo,
          priority: eachitem.priority,
          status: eachitem.status,
          category: eachitem.category,
          dueDate: eachitem.due_date,
        })),
      )
      break
    case isCategoryAndStatusBoth(queries):
      listOfAllTodosQuery = `
      SELECT 
        *
      FROM
        todo
      WHERE
        category = "${category}"
      AND 
        status = "${status}";`

      if (isCategoryValid(category) && isStatusValid(status)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        if (!isCategoryValid(category)) {
          response.send('Invalid Todo Category')
        } else if (!isStatusValid(status)) {
          response.send('Invalid Todo Status')
        }
      }
      break
    case isCategoryOnly(queries):
      listOfAllTodosQuery = `
      SELECT
        *
      FROM 
        todo
      WHERE
        category = "${category}";`

      if (isCategoryValid(category)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case isCategoryAndPriorityBoth(queries):
      listOfAllTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        category = "${category}"
      AND
        priority = "${priority}";`

      if (isCategoryValid(category) && isPriorityValid(priority)) {
        todoList = await db.all(listOfAllTodosQuery)
        response.send(
          todoList.map(eachitem => ({
            id: eachitem.id,
            todo: eachitem.todo,
            priority: eachitem.priority,
            status: eachitem.status,
            category: eachitem.category,
            dueDate: eachitem.due_date,
          })),
        )
      } else {
        response.status(400)
        if (!isCategoryValid(category)) {
          response.send('Invalid Todo Category')
        } else if (!isPriorityValid(priority)) {
          response.send('Invalid Todo Priority')
        }
      }
      break
    default:
      break
  }
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    id = ${todoId};`

  const todo = await db.get(getTodoQuery)
  response.send({
    id: todo.id,
    todo: todo.todo,
    priority: todo.priority,
    status: todo.status,
    category: todo.category,
    dueDate: todo.due_date,
  })
})

//API 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    response.status(400)
    return response.send('Invalid Due Date')
  }

  const formattedDate = format(parsedDate, 'yyyy-MM-dd')

  const getTodoBasedOnDate = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = ?;`

  try {
    const todoList = await db.all(getTodoBasedOnDate, [formattedDate])
    response.send(
      todoList.map(eachitem => ({
        id: eachitem.id,
        todo: eachitem.todo,
        priority: eachitem.priority,
        status: eachitem.status,
        category: eachitem.category,
        dueDate: eachitem.due_date,
      })),
    )
  } catch (error) {
    response.status(500)
    response.send('Internal Server Error')
  }
})

//API 4
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status, category, dueDate} = todoDetails

  try {
    if (
      !(status === 'TO DO' || status === 'DONE' || status === 'IN PROGRESS')
    ) {
      response.status(400)
      return response.send('Invalid Todo Status')
    }

    if (!(priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW')) {
      response.status(400)
      return response.send('Invalid Todo Priority')
    }

    if (
      !(category === 'WORK' || category === 'HOME' || category === 'LEARNING')
    ) {
      response.status(400)
      return response.send('Invalid Todo Category')
    }

    const d = new Date(dueDate)
    if (!isValid(d)) {
      response.status(400)
      return response.send('Invalid Due Date')
    }

    const createTodoQuery = `
      INSERT INTO todo(
        id, 
        todo, 
        priority, 
        status, 
        category, 
        due_date)
      VALUES(?, ?, ?, ?, ?, ?);`

    await db.run(createTodoQuery, [
      id,
      todo,
      priority,
      status,
      category,
      dueDate,
    ])

    response.send('Todo Successfully Added')
  } catch (error) {
    response.status(500)
    response.send('Internal Server Error')
  }
})

//API
app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  const {status, priority, todo, category, dueDate} = todoDetails

  let updateQuery = null

  switch (true) {
    case status !== undefined:
      if (
        !(status === 'TO DO' || status === 'DONE' || status === 'IN PROGRESS')
      ) {
        response.status(400)
        return response.send('Invalid Todo Status')
      }
      updateQuery = `UPDATE todo SET status = ? WHERE id = ?;`
      await db.run(updateQuery, [status, todoId])
      response.send('Status Updated')
      break
    case priority !== undefined:
      if (
        !(priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW')
      ) {
        response.status(400)
        return response.send('Invalid Todo Priority')
      }
      updateQuery = `UPDATE todo SET priority = ? WHERE id = ?;`
      await db.run(updateQuery, [priority, todoId])
      response.send('Priority Updated')
      break
    case todo !== undefined:
      updateQuery = `UPDATE todo SET todo = ? WHERE id = ?;`
      await db.run(updateQuery, [todo, todoId])
      response.send('Todo Updated')
      break
    case category !== undefined:
      if (
        !(category === 'WORK' || category === 'HOME' || category === 'LEARNING')
      ) {
        response.status(400)
        return response.send('Invalid Todo Category')
      }
      updateQuery = `UPDATE todo SET category = ? WHERE id = ?;`
      await db.run(updateQuery, [category, todoId])
      response.send('Category Updated')
      break
    case dueDate !== undefined:
      let d = new Date(dueDate)
      if (!isValid(d)) {
        response.status(400)
        return response.send('Invalid Due Date')
      }
      updateQuery = `UPDATE todo SET due_date = ? WHERE id = ?;`
      await db.run(updateQuery, [dueDate, todoId])
      response.send('Due Date Updated')
      break
    default:
      break
  }
})

//API 6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE 
  FROM
    todo
  WHERE
    id = ${todoId};`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
