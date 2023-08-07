const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    todoText: String,
    completed: Boolean,
    userName:String,
    todoId:String
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;