//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();

const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://amitai-admin:nehama1992@cluster0.nobba.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema ={
  item:String
};

const Item = mongoose.model("Item", itemsSchema);

const task1 = new Item({
  item: "go to the beach"
});

const task2 = new Item({
  item: "coock the food"
});

const task3 = new Item({
  item: "eat the food"
});

const defultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({} ,function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("succes");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
}})});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    item: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req, res){
  const delcheckbox = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndDelete(delcheckbox, function(err){
      if (!err) {
        console.log("deleted succesfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delcheckbox}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);

      }
    });
  }

});

app.get("/:listName", function(req, res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        const list = new List({
          name : listName,
          items: defultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
  const list = new List({
    name : listName,
    items: defultItems
  });
  list.save();
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
