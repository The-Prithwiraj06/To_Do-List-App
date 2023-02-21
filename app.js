const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");


mongoose.set('strictQuery', true);

const app=express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://adim-Prithwiraj:Prithwi-123@cluster0.8lrduie.mongodb.net/todolistDB");

const itemsSchema=new mongoose.Schema({
    name:String,
});
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Welcmome"
});
const item2=new Item({
    name:"Add new item"
});
const item3=({
    name:"Hit this button to delete item"
});
const defaultitems=[item1, item2, item3];

const listSchema={
    name:String,
    items:[itemsSchema],
};

const List=mongoose.model("List",listSchema);


// var tasks=["Jogging","Gym/Meditation","Reading"];
// let workItems=[];

app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length==0){
           Item.insertMany(defaultitems,function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Successfully saved default items to DB.");
    }
  });
 res.render("lists", {kindOfDay:"Today",NewListTasks:foundItems});
        }else{
            res.render("lists", {kindOfDay:"Today",NewListTasks:foundItems});
        }
    });

//     var today= new Date();
// var options={
//     weekday:"long",
//     day:"numeric",
//     month:"long",
// };

//     var day=today.toLocaleDateString("en-US",options);
  
    // res.render("lists", {kindOfDay: day,NewListTasks:tasks});
   
 
});

app.get("/:customListName",function(req,res){
    const customeListName= _.capitalize(req.params.customListName);

    List.findOne({name:customeListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customeListName,
                    items:defaultitems,
                });
                list.save();
                res.redirect("/"+customeListName);
            }else{
                res.render("lists",{kindOfDay:foundList.name,NewListTasks:foundList.items});
            }
        }
    })
    
});

app.get("/work",function(req,res){
    res.render("lists",{kindOfDay:"Work",NewListTasks:workItems})
})



app.post("/", function(req,res){

    const itemName=req.body.newtask;
    const list_name=req.body.list;

    const item = new Item({
        name:itemName,
    });
    if(list_name=="Today"){
        
    item.save();
    res.redirect("/");
    }else{
        List.findOne({name:list_name},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ list_name);
        });
    }
    // task = req.body.newtask;
    // if(req.body.list == "Work"){
    //     workItems.push(task);
    //     res.redirect("/work");
    // }
    // else{
    //     tasks.push(task);
    //     res.redirect("/");
    // }
    //console.log(req.body);
    
    
  //  console.log(task);
}); 

app.post("/delete",function(req,res){
    const itemId=req.body.checkbox;
    const list_name=req.body.listName;

    if(list_name=="Today"){

        Item.findByIdAndDelete(itemId,function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");        
            }
        });
    }else{
        List.findOneAndUpdate({name:list_name},{$pull:{items:{_id:itemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+list_name);
            }
        })
    }

})
//mongoose.connection.close();

app.listen(3000,function(){
    console.log(" Server running at 3000.");
});