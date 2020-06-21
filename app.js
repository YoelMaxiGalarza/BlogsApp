const express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer");
    mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/restful_blog_app", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});
const Blog = mongoose.model("Blog", blogSchema);
//RESTFUL ROUTES
//Index
app.get("/", function (req, res) {
    res.redirect("/blogs");
});
app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { blogs: blogs });
        }
    })
});
//NEW ROUTE
app.get("/blogs/new", function (req, res) {
    res.render("new");
});
//CREATE 
app.post("/blogs", (req, res) => {
    //sanitizing the blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) res.render("new");
        //redirect to index
        else res.redirect("/blogs");
    });
});
//SHOW Route
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) res.send("BLOG NOT FOUND");
        else res.render("show", { blog: foundBlog })
    });
});
//EDIT Route
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) res.redirect("/blogs");
        else res.render("edit", { blog: foundBlog });
    });
});
//UPDATE Route
app.put("/blogs/:id", function (req, res) {
    //sanitizing the blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //update the blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        //redirect to the updated blog
        if (err) res.send(err);
        else res.redirect("/blogs/" + req.params.id);
    });
});
//DESTROY Route
app.delete("/blogs/:id", (req, res) => {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function (err) {
        //redirect somewhere
        if (err) res.send(err);
        else res.redirect("/blogs");
    });
});

app.listen(3000, function () {
    console.log("Blog Server Up");
});