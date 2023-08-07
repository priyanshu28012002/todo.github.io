const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');
const session  = require("express-session");
const path = require("path")
const mongoose = require('mongoose')

const app = express();
const users = require("./users.json");
const db = require("./models/db");
const UserModel = require("./models/User");

const { error } = require("console");
const TodoModel = require("./models/Todos");
const { v4: uuidv4 } = require('uuid');


app.use(session({
    secret:"a",
    resave:false,
    saveUninitialized:true
  }));


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));


app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Set the views directory
app.use(express.static(path.join(__dirname, "css")));


// app.use(express.static('assign9'));
app.get("/", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
  } else {
 // res.sendFile(__dirname + "/index.html");
  const username = req.session.username;
 //   res.sendFile(__dirname+"/dashboard.html")
  res.render("index", { username });  // dashboard.ejs
}
});


app.get("/login",function(req,res){
  res.render("login", { error: null });
 });


app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // if suing findOne then result will be null or the user object
  // if using find then result will be an array of user objects
  UserModel.findOne({ username: username, password: password })
    .then(function (user) {
      if (user) {
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.redirect("/");
        return;
      }
      res.redirect("/");
      //res.render("login", { error: "Invalid username or password" });
    })
    .catch(function (err) {
      res.render("login", { error: "Invalid username or password" });
      //res.render("login", { error: "Something went wrong" });
    });
  //const { username, password } = req.body;
  // Find the user with matching username and password
  // const matchedUser = users.find(user => user.username === username && user.password === password);
  // if (matchedUser) {
  //   // Authentication successful
  //   req.session.isLoggedIn = true;
  //   req.session.username = username;
  // // res.status(200).send("success");
  //   res.redirect("/");
  // } else {
  //   // Authentication failed
  //   //res.status(401).send("error");
  //   res.redirect("/illegal");
  // }
});
     

// app.get("/signup",function(req,res){
//   res.sendFile(__dirname+"/signup.html")
//  // res.render("newAccount", { error: null });
// });
// Create Account route to save user data
// app.post("/createAccount", function (req, res) {
//    const { username, password } = req.body;
//    const user = { username, password };
  
  //  readAllUsers(function (err, users) {
  //    if (err) {
  //      res.status(500).json({ success: false });
  //      return;
  //    }
 
  //    // Check if the username already exists
  //    const existingUser = users.find(u => u.username === username);
  //    if (existingUser) {
  //      res.status(409).json({ success: false, message: "Username already exists." });
  //      return;
  //    }
 
     // Add the new user to the array
     // users.push(user);
 
     // Save the updated user array to users.json
    //  saveAllUsers(users, function (err) {
    //    if (err) {
    //      res.status(500).json({ success: false });
    //      return;
    //    }
    //    res.redirect("/login");
    //    //res.status(200).json({ success: true });
  
    //  });
//    });
//  });


app.get("/signup",function(req,res){
  //res.sendFile(__dirname+"/signup.html")
  res.render("signup", { error: null });
});


// Create Account route to save user data in data base
// app.post("/signup", function (req, res) {
//   const { username, password } = req.body;
//   const user = { username, password };

//   UserModel.findOne({ username: username })
//     .then(function (existingUser) {
//       if (existingUser) {
//         // Username already exists
//         res.render("signup", { error: "Username already exists." });
//         return;
//       }
//       .catch(function (err) {
//         res.status(500).json({ success: false, error: err });
//       });
                                                                       
//       // Create the new user
//       UserModel.create(user)
//         .then(function () {
//           res.redirect("/login");
//         })
//         .catch(function (err) {
//           res.render("signup", { error: "Error creating user." });
//         });
//     })
    
// });


app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      res.render("signup", { error: "Username is unavailable" });
     // res.status(400).json({ message: "Username is unavailable" });
    } else {
      const newUser = await UserModel.create({ username, password });
      res.redirect("/");
     // res.redirect("/login");
     // res.status(201).json(newUser);
    }
  } catch (error) {
    res.render("signup", { error: "An error occurred" });
   // res.status(500).json({ message: "An error occurred" });
  }
});
// app.post("/signup", function (req, res) {
//   const username = req.body.username;
//   const password = req.body.password;

//   const user = {
//     username: username,
//     password: password,
  
//   };
//   console.log(user)
//   UserModel.create(user)
//     .then(function () {
//       res.redirect("/login");
//     })
//     .catch(function (err) {
//       res.render("signup", { error: err });
//     });
//   /* saveUser(user, function (err) {
//     if (err) {
//       res.render("signup", { error: "Something went wrong" });
//       return;
//     }
//     res.redirect("/login");
//   }); */
// });



//---------------------------------------------------------------------------------------------------

app.get("/illegal",function(req,res){
  res.sendFile(__dirname+"/illegal.html")
 }); 

// data base  todo data base 1

app.post("/todo", async (req, res) => {
  const { todoText, completed,todoId } = req.body;
  const userName = req.session.username;

  if (!userName) {
    return res.status(401).send("Unauthorized");
  }

  // const todoId = uuidv4(); // Generate a UUID

  try {
    const createdTodo = await TodoModel.create({ todoId, todoText, completed, userName });
    console.log("Todo created successfully:", createdTodo);
    res.status(200).send("Todo created successfully");
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).send("An error occurred");
  }
});
// app.post("/todo", async (req, res) => {
//   const { todoText, completed } = req.body;
//   const userName = req.session.username; // Assuming you're using sessions for authentication
//   const todoId = uuid();
//   if (!userName) {
//     return res.status(401).send("Unauthorized");
//   }

//   console.log(todoText, completed, userName,todoId);

//   try {
//     const createdTodo = await TodoModel.create({ todoText, completed, userName });
//     console.log("Todo created successfully:", createdTodo);
//     res.status(200).send("Todo created successfully");
//   } catch (err) {
//     console.error("Error creating todo:", err);
//     res.status(500).send("An error occurred");
//   }
// });

// app.post("/todo", function (req, res) {
//   const { todoText, completed } = req.body;
//   const userName = req.session.username; // Assuming you're using sessions for authentication

//   if (!userName) {
//     return res.status(401).send("Unauthorized");
//   }

//   console.log(todoText, completed, userName);

//   TodoModel.create({ todoText, completed, userName }, function (err) {
//     if (err) {
//       console.error("Error creating todo:", err);
//       return res.status(500).send("An error occurred");
//     }
    
//     console.log("Todo created successfully");
//     res.status(200).send("Todo created successfully");
//   });
// });
  // saveTodoInFile(req.body, function (err) {
  //   if (err) {
  //     res.status(500).send("error");
  //     return;
  //   }
  //   res.status(200).send("success");
  // });



// data base system todo 3

app.post("/delete-todo", async (req, res) => {
  const { todoItem } = req.body; // Destructure the sent data

  const userName = req.session.username;
  if (!userName) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const deletedTodo = await TodoModel.findOneAndDelete({ todoText: todoItem, userName });

    if (!deletedTodo) {
      return res.status(404).send("Todo not found");
    }

    console.log("Todo deleted successfully:", deletedTodo);
    res.status(200).send("Todo deleted successfully");
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("An error occurred");
  }
});

// app.post("/delete-todo", async (req, res) => {
//   const todoId = req.body;
//   const userName = req.session.username;
//    // Assuming you're using sessions for authentication
//   console.log(todoId,userName);
//   if (!userName) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     const deletedTodo = await TodoModel.findOneAndDelete({ todoId  });

//     if (!deletedTodo) {
//       return res.status(404).send("Todo not found");
//     }

//     console.log("Todo deleted successfully:", deletedTodo);
//     res.status(200).send("Todo deleted successfully");
//   } catch (err) {
//     console.error("Error deleting todo:", err);
//     res.status(500).send("An error occurred");
//   }
// });

// app.post("/delete-todo", function (req, res) {
//   const { todoId } = req.body;
//   const userName = req.session.username; // Assuming you're using sessions for authentication

//   if (!userName) {
//     return res.status(401).send("Unauthorized");
//   }

//   TodoModel.findOneAndDelete({ _id: todoId, userName }, function (err, deletedTodo) {
//     if (err) {
//       console.error("Error deleting todo:", err);
//       return res.status(500).send("An error occurred");
//     }

//     if (!deletedTodo) {
//       return res.status(404).send("Todo not found");
//     }

//     console.log("Todo deleted successfully:", deletedTodo);
//     res.status(200).send("Todo deleted successfully");
//   });
// });

// app.post("/delete-todo",function (req,res){
//   removeTodoFromFile(req.body,function (err){
//     if (err){
//       res.status(500).send("error");
//     }
//     else{
//       res.status(200).send("success");
//     }
//   });
// });


// data base todo 4

app.post("/edit-todo", async (req, res) => {
  const { todoId } = req.body;
  const userName = req.session.username; // Assuming you're using sessions for authentication
  console.log(req.body);
  console.log(todoId,userName);
  try {
    const updatedTodo = await TodoModel.findOneAndUpdate(
      { todoId: todoId, userName: userName },
      { $set: { completed: true } },
      { new: true }
    );

    if (!updatedTodo) {
      console.error("Todo not found for the given ID");
      res.status(404).send("Todo not found");
      return;
    }

    console.log("Todo updated successfully:", updatedTodo);
    res.status(200).send("success");
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("error");
  }
});


// app.post("/edit-todo", async (req, res) => {
//   const { todoItem } = req.body;
//   const userName = req.session.username;
//   console.log(todoItem,userName);
//   try {
//     const updatedTodo = await TodoModel.findOneAndUpdate(
//       { todoId: todoId, userName:userName  },
//       { $set: { completed: false } },
//       { new: true }
//     );

//     if (!updatedTodo) {
//       console.error("Todo not found for the given ID");
//       res.status(404).send("Todo not found");
//       return;
//     }

//     console.log("Todo updated successfully:", updatedTodo);
//     res.status(200).send("success");
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     res.status(500).send("error");
//   }
// });


// app.post("/edit-todo", async (req, res) => {
//   const { todoId } = req.body;

//   try {
//     const updatedTodo = await TodoModel.update(
//       { todoId: todoId },
//       {"$set":{completed:false}}
//     );

//     if (!updatedTodo) {
//       console.error("Todo not found for the given ID");
//       res.status(404).send("Todo not found");
//       return;
//     }

//     // Save the changes to the database
//     await updatedTodo.save();

//     console.log("Todo updated and saved successfully:", updatedTodo);
//     res.status(200).send("success");
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     res.status(500).send("error");
//   }
// });



// app.post("/edit-todo", async (req, res) => {
//   const { todoId } = req.body;

//   try {
//     const updatedTodo = await TodoModel.findOneAndUpdate(
//       { todoId: todoId },
//       { completed: true },
//       { new: true }
//     );

//     if (!updatedTodo) {
//       console.error("Todo not found for the given ID");
//       res.status(404).send("Todo not found");
//     } else {
//       console.log("Todo updated successfully:", updatedTodo);
//       res.status(200).send("success");
//     }
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     res.status(500).send("error");
//   }
// });

// app.post("/edit-todo", async (req, res) => {
//   const { todoId } = req.body;
  
//   try {
//     await TodoModel.findOneAndUpdate({ todoId: todoId },{ completed: true },function(err,docs){
//       if (err){
//         console.log(err)
//     }
//     else{
//         console.log("Original Doc : ",docs);
//         res.status(200).send("success");
//     }
//     });
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     res.status(500).send("error");
//   }
// });

// async function editTodo(todoId) {
//   try {
//     const updatedTodo = await TodoModel.findOneAndUpdate(
//       { _id: todoId },
//       { $set: { completed: true } },
//       { new: true } // Return the updated document
//     );

//     if (!updatedTodo) {
//       throw new Error("Todo not found");
//     }

//     console.log("Todo updated successfully:", updatedTodo);
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     throw new Error("Error updating todo");
//   }
// }

// app.post("/edit-todo", function (req, res) {
//   const { todoId } = req.body;

//   editTodo(todoId, function (err) {
//     if (err) {
//       res.status(500).send("error");
//     } else {
//       res.status(200).send("success");
//     }
//   });
// });

// function editTodo(todoId, callback) {
//   // Assuming you have a function to find and update the todo by todoId
//   TodoModel.findOneAndUpdate(
//     { _id: todoId },
//     { $set: { completed: true } }, // Set the 'completed' field to true
//     function (err, updatedTodo) {
//       if (err) {
//         console.error('Error updating todo:', err);
//         callback(err);
//       } else {
//         console.log('Todo updated successfully:', updatedTodo);
//         callback();
//       }
//     }
//   );
// }

// app.post("/edit-todo",function (req,res){
//   editTodo(req.body,function (err){
//     if (err){
//       res.status(500).send("error");
//     }
//     else{
//       res.status(200).send("success");
//     }
//   });
// });

//     File base system 
// app.get("/todo-data", function (req, res) {
//   readAllTodos(function (err, data) {
//     if (err) {
//       res.status(500).send("error");
//       return;
//     }
//     // res.status(200).send(JSON.stringify(data));
//     res.status(200).json(data);
//   });
// });

//     database system  todo data base 2

app.get("/todo-data", async function (req, res) {
  const userName = req.session.username;

  try {
    const data = await TodoModel.find({ userName: userName });

    if (data) {
      console.log(data);
      res.status(200).json(data);
    } else {
      res.status(404).send("Data not found"); // Return a 404 status for not found
    }
  } catch (error) {
    console.error("Error fetching todo data:", error);
    res.status(500).send("Internal server error");
  }
});

  // readAllTodos(function (err, data) {
  //   if (err) {
  //     res.status(500).send("error");
  //     return;
  //   }
  //   // res.status(200).send(JSON.stringify(data));
  //   console.log(data);
  //   res.status(200).json(data);
  // });


app.get("/edit-todo", function (req,res) {
  res.sendFile(__dirname + "/index.html");
});


app.get("/delete-todo", function (req,res) {
  res.sendFile(__dirname + "/index.html");
});


app.get("/bootstrap.min.css", function (req, res) {
  res.sendFile(__dirname + "/bootstrap.min.css");
});


app.get("/bootstrap.min.css.map", function (req, res) {
  res.sendFile(__dirname + "/bootstrap.min.css.map");
});


app.get("/index.js", function (req, res) {
  res.sendFile(__dirname + "/index.js");
});


app.get("/contact",function(req,res){
  if(!req.session.isLoggedIn){
      res.redirect("/login");
    }
  else{
    const username = req.session.username;  
  res.render("contact", { username });
  }
 });  

 
app.get("/about",function(req,res){
  if(!req.session.isLoggedIn){
      res.redirect("/login");
    }
  else{
    const username = req.session.username;  
  res.render("about", { username });
  }
 });  
  

// Logout route to clear session and redirect to login page
app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
});


db.init()
  .then(function () {
    console.log("db connected");

    app.listen(3000, function () {
      console.log("server on port 3000");
    });
  })
  .catch(function (err) {
    console.log(err);
  });

//         Helper Functions


function readAllTodos(callback) {
  fs.readFile("./index.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    if (data.length === 0) {
      data = "[]";
    }

    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data.push(todo);

    fs.writeFile("./index.json", JSON.stringify(data,null,2), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

// Function to update the JSON data
// function editTodo(body) {
//   const {filePath,property,value} = body;
//   // Read the JSON data from the file
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading the file:', err);
//       return;
//     }

//     try {
//       // Parse the JSON data into a JavaScript array
//       const jsonData = JSON.parse(data);

//       // Find the object with id: 1
//       const objectToUpdate = jsonData.find(item => item[property] === value);

//       // Check if the object exists
//       if (objectToUpdate) {
//         // Modify the object by adding the desired data
        
//         objectToUpdate['completed'] = !objectToUpdate['completed'];

//         // Convert the modified data back to JSON string
//         const updatedData = JSON.stringify(jsonData, null, 2);

//         // Write the updated data back to the file
//         fs.writeFile(filePath, updatedData, 'utf8', (err) => {
//           if (err) {
//             console.error('Error writing to the file:', err);
//             return;
//           }
//           console.log('Data updated successfully!');
//         });
//       } else {
//         console.error('Object not found!');
//       }
//     } catch (parseErr) {
//       console.error('Error parsing JSON:', parseErr);
//     }
//   });
// }


function removeTodoFromFile(body) {
  const {filePath,property,value} = body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const filteredData = jsonData.filter(item => item[property] !== value);
      const updatedData = JSON.stringify(filteredData, null, 2);

      fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing to the file:', err);
        } else {
          console.log(`Data with '${property}' equal to '${value}' removed successfully.`);
        }
      });
    } catch (err) {
      console.error('Error parsing JSON data:', err);
    }
  });
}


// Helper function to read all users from users.json
function readAllUsers(callback) {
  fs.readFile("./users.json", "utf-8", function (err, data) {
    if (err) {
      callback(err, []);
      return;
    }

    try {
      const users = JSON.parse(data);
      callback(null, users);
    } catch (err) {
      callback(err, []);
    }
  });
}


// // Helper function to save all users to users.json
function saveAllUsers(users, callback) {
  fs.writeFile("./users.json", JSON.stringify(users), function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });
}