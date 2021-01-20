// Dependencies :
const inquirer = require("inquirer")
const mysql = require("mysql")
const cTable = require('console.table');

// Connection :
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Akbou2009#",
  database: "employee_DB"
});

connection.connect(function (err) {
  if (err) throw err
  console.log("Connected as Id" + connection.threadId)
  startPrompt();
});

// initial Prompt :
function startPrompt() {
  inquirer.prompt([
    {
      type: "list",
      message: "What would you like to do ?: ",
      name: "choices",
      choices: [
        "View All Employees?",
        "View All Employee's By Roles?",
        "View all Emplyees By Deparments",
        "Update Employee",
        "Add Employee?",
        "Add Role?",
        "Add Department?"
      ]
    }
  ]).then(function (answer) {
    switch (answer.choices) {
      case "View All Employees?":
        viewAllEmployees();
        break;

      case "View All Employee's By Roles?":
        viewAllRoles();
        break;
      case "View all Emplyees By Deparments":
        viewAllDepartments();
        break;

      case "Add Employee?":
        addEmployee();
        break;

      case "Update Employee":
        updateEmployee();
        break;

      case "Add Role?":
        addRole();
        break;

      case "Add Department?":
        addDepartment();
        break;
    };
  });
};

// View All Employees :
function viewAllEmployees() {
  connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    function (err, res) {
      if (err) throw err
      console.table(res)
      startPrompt()
    });
};

// View All Roles :
function viewAllRoles() {
  connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;",
    function (err, res) {
      if (err) throw err
      console.table(res)
      startPrompt()
    })
};

// View All Employees By Departments :
function viewAllDepartments() {
  connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
    function (err, res) {
      if (err) throw err
      console.table(res)
      startPrompt()
    })
};

// Selecting By Roles :
var roles = [];
function selectRole() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err
    for (var i = 0; i < res.length; i++) {
      roles.push(res[i].title);
    }

  })
  return roles;
};

// Add Employee :
function addEmployee() {
  inquirer.prompt([
    {
      name: "firstname",
      type: "input",
      message: "Enter the employee's first name "
    },
    {
      name: "lastname",
      type: "input",
      message: "Enter the employee's last name ? "
    },
    {
      name: "role",
      type: "list",
      message: "What is the employee's role ? ",
      choices: selectRole()
    },
   
  ]).then(function (answer) {
    var roleId = selectRole().indexOf(answer.roles) + 1
    var managerId = selectManager().indexOf(answer.choices) + 1
    connection.query("INSERT INTO employee SET ?",
      {
        first_name: answer.firstName,
        last_name: answer.lastName,
        manager_id: managerId,
        role_id: roleId

      }, function (err) {
        if (err) throw err
        console.table(answer)
        startPrompt()
      })

  })
};

// Update Employee :
function updateEmployee() {
  connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", function (err, res) {
    if (err) throw err
    console.log(res)
    inquirer.prompt([
      {
        name: "lastName",
        type: "rawlist",
        choices: function () {
          var lastName = [];
          for (var i = 0; i < res.length; i++) {
            lastName.push(res[i].last_name);
          }
          return lastName;
        },
        message: "What is the employee's last name? ",
      },
      {
        name: "role",
        type: "rawlist",
        message: "What is the employee's new title? ",
        choices: selectRole()
      }
    ]).then(function (answer) {
      var roleId = selectRole().indexOf(answer.role) + 1
      connection.query("UPDATE employee SET ? WHERE ?",
        {
          last_name: answer.lastName

        },
        {
          role_id: roleId

        },
        function (err) {
          if (err) throw err
          console.table(answer)
          startPrompt()
        })

    });
  });
};

// Add Employee Role :
function addRole() {
  connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role", function (err, res) {
    inquirer.prompt([
      {
        name: "Title",
        type: "input",
        message: "What is the employee's role?"
      },
      {
        name: "Salary",
        type: "input",
        message: "What is the Salary?"

      }
    ]).then(function (res) {
      connection.query("INSERT INTO role SET ?",

        {
          title: res.Title,
          salary: res.Salary,
        },
        function (err) {
          if (err) throw err
          console.table(res);
          startPrompt();
        }
      )

    });
  });
};

//  Add Department :
function addDepartment() {

  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "What Department would you like to add?"
    }
  ]).then(function (res) {
    connection.query(
      "INSERT INTO department SET ? ",
      {
        name: res.name
      },
      function (err) {
        if (err) throw err
        console.table(res);
        startPrompt();
      }
    )
  })
};