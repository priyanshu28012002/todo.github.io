const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');
const session  = require("express-session");
const path = require("path")

const app = express();
const users = require("./users.json");
const db = require("./models/db");
const UserModel = require("./models/User");

app.use(session({
    secret:"a",
    resave:false,
    saveUninitialized:true
  }))


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
//   const username = req.body.username;
//   const password = req.body.password;

//   // if suing findOne then result will be null or the user object
//   // if using find then result will be an array of user objects
//   UserModel.findOne({ username: username, password: password })
//     .then(function (user) {
//       if (user) {
//         req.session.isLoggedIn = true;
//         req.session.username = username;
//         req.session.profilePic = user.profilePic;
//         res.redirect("/");
//         return;
//       }
//       res.redirect("/");
//       //res.render("login", { error: "Invalid username or password" });
//     })
//     .catch(function (err) {
//       res.redirect("/illegal");
//       //res.render("login", { error: "Something went wrong" });
//     });
  const { username, password } = req.body;
 // Find the user with matching username and password
  const matchedUser = users.find(user => user.username === username && user.password === password);
  if (matchedUser) {
    // Authentication successful
    req.session.isLoggedIn = true;
    req.session.username = username;
  // res.status(200).send("success");
    res.redirect("/");
  } else {
    // Authentication failed
    //res.status(401).send("error");
    res.render("login", { error: "Invalid username or password" });
    //res.redirect("/illegal");
  }
});
     

app.get("/newAccount",function(req,res){
  res.sendFile(__dirname+"/newAccount.html")
  //res.render("newAccount", { error: null });
});
// Create Account route to save user data
app.post("/createAccount", function (req, res) {
   const { username, password } = req.body;
   const user = { username, password };
 
   readAllUsers(function (err, users) {
     if (err) {
       res.status(500).json({ success: false });
       return;
     }
 
     // Check if the username already exists
     const existingUser = users.find(u => u.username === username);
     if (existingUser) {
       res.status(409).json({ success: false, message: "Username already exists." });
       return;
     }

    //  UserModel.create(user)
    //  .then(function () {
    //    res.redirect("/login");
    //  })
    //  .catch(function (err) {
    //    res.render("signup", { error: err });
    //  }); 
 
     // Add the new user to the array
     users.push(user);
 
  //   Save the updated user array to users.json
     saveAllUsers(users, function (err) {
       if (err) {
         res.status(500).json({ success: false });
         return;
       }
       res.redirect("/login");
       //res.status(200).json({ success: true });
  
     });
   });
 });


// app.post("/createAccount", function (req, res) {
//   const username = req.body.username;
//   const password = req.body.password;

//   const user = {
//     username: username,
//     password: password,
//   };

//   // UserModel.create(user)
//   //   .then(function () {
//   //     res.redirect("/login");
//   //   })
//   //   .catch(function (err) {
//   //     res.render("newAccount", { error: err });
//   //   });

//   saveUser(user, function (err) {
//     if (err) {
//       res.render("newAccount", { error: "Something went wrong" });
//       return;
//     }
//     res.redirect("/login");
//   }); 
// });

app.get("/illegal",function(req,res){
  res.sendFile(__dirname+"/illegal.html")
 }); 



app.post("/todo", function (req, res) {
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).send("success");
  });
});

app.post("/delete-todo",function (req,res){
  removeTodoFromFile(req.body,function (err){
    if (err){
      res.status(500).send("error");
    }
    else{
      res.status(200).send("success");
    }
  });
});
app.post("/edit-todo",function (req,res){
  editTodo(req.body,function (err){
    if (err){
      res.status(500).send("error");
    }
    else{
      res.status(200).send("success");
    }
  });
});

app.get("/todo-data", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    // res.status(200).send(JSON.stringify(data));
    res.status(200).json(data);
  });
});

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



// db.init()
//   .then(function () {
//     console.log("db connected");
 
//     app.listen(3000, function () {
//       console.log("server on port 3000");
//     });
//   })
//   .catch(function (err) {
//     console.log(err);
//   });

app.listen(3000, function () {
      console.log("server on port 3000");
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
function editTodo(body) {
  const {filePath,property,value} = body;
  // Read the JSON data from the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    try {
      // Parse the JSON data into a JavaScript array
      const jsonData = JSON.parse(data);

      // Find the object with id: 1
      const objectToUpdate = jsonData.find(item => item[property] === value);

      // Check if the object exists
      if (objectToUpdate) {
        // Modify the object by adding the desired data
        
        objectToUpdate['completed'] = !objectToUpdate['completed'];

        // Convert the modified data back to JSON string
        const updatedData = JSON.stringify(jsonData, null, 2);

        // Write the updated data back to the file
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing to the file:', err);
            return;
          }
          console.log('Data updated successfully!');
        });
      } else {
        console.error('Object not found!');
      }
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
    }
  });
}

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




function saveUser(user, callback) {
  getAllUsers(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data.push(user);

    fs.writeFile("./users.json", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}
