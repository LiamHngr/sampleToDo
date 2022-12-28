//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://liam:DeNrom9oHFVOAyu8@cluster0.e0eewdr.mongodb.net", {useNewUrlParser:true})

const itemsSchema = {
  name: String
};

const Items = mongoose.model("Item" , itemsSchema ); 

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const item1 = new Items({
  name: "Welcome to your to do list"
})
const item2 = new Items({
  name: "Hit the + Button to add a new Item"
})
const item3 = new Items({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema)





app.get("/", function(req, res) {

  Items.find({}, function(err, foundItems){
    if(foundItems.length ===0){
      Items.insertMany(defaultItems, function(err){
        if (err){
          console.log(err)
        } else {
          console.log('successfully add the items to ')
        } 
      });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  });
  

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Items({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/")
  }else {
    List.findOne({name: listName}, function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save()
      res.redirect("/"+ listName)
    });
  }

});

app.post("/delete", function(req,res){
  console.log(req.body.checkbox)
  const checkedItemID = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today"){
    Items.findByIdAndRemove(checkedItemID, function(err){
      if (!err){
        console.log("successfully deleted checked item.")
        res.redirect("/")
      } 
    })
  } else {
   List.findOneAndUpdate({name: listName}, {$pull:{items:{ _id:checkedItemID}}} ,function(err, foundList){
    if(!err){
      res.redirect("/"+listName)
    }
   });
  }
});



app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: foundList.name ,newListItems: foundList.items })
      }
        
    }
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
