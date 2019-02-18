var blogTemplate =
    '<div class="blog js-blog">' +
    '<h3 class="js-blog-title"><h3>' +
    "<hr>" +
    '<ul class="js-blog-content">' +
    "</ul>" +
    '<ul class="js-blog-author">' +
    "</ul>" +
    '<ul class="js-blog-date">' +
    "</ul>" +
    '<div class="blog-controls">' +
    '<button class="js-blog-delete">' +
    '<span class="button-label">delete</span>' +
    "</button>" +
    "</div>" +
    "</div>";

// var serverBase = "//evening-mesa-72855.herokuapp.com/";
var serverBase = "//localhost:8080/";
var BLOGS_URL = serverBase + "blog-posts";


function getAndDisplayBlog() {
    console.log("Retrieving Blogs");
    $.getJSON(BLOGS_URL, function (blogs) {
        console.log("Rendering Blogs");
        var blogsElement = blogs.map(function (blog) {
            var element = $(blogTemplate);
            element.attr("id", blog.id);
            element.find(".js-blog-title").text(blog.title);
            element.find(".js-blog-content").text(blog.content);
            element.find(".js-blog-author").text(blog.author);
            element.find(".js-blog-date").text(blog.publishDate);
            return element;
        });
        $(".js-blogs").html(blogsElement);
    });
}



function addBlog(blog) {
    console.log("Adding blog: " + blog);
    console.log(blog);
    $.ajax({
        method: "POST",
        url: BLOGS_URL,
        data: JSON.stringify(blog),
        success: function (data) {
            console.log(data, '-------------------------')
            getAndDisplayBlog();
        },
        dataType: "json",
        contentType: "application/json"
    });
}



function deleteBlog(blogId) {
    console.log("Deleting blog `" + blogId + "`");
    $.ajax({
        url: BLOGS_URL + "/" + blogId,
        method: "DELETE",
        success: getAndDisplayBlog
    });
}



function updateBlog(blog) {
    console.log("Updating blog `" + blog.id + "`");
    $.ajax({
        url: BLOGS_URL + "/" + blog.id,
        method: "PUT",
        data: blog,
        success: function (data) {
            getAndDisplayBlog();
        }
    });
}



function handleBlogAdd() {
    $("#js-blog-form").submit(function (e) {
        e.preventDefault();
        addBlog({
            title: $(e.currentTarget)
                .find("#blog-title")
                .val(),
            content: $(e.currentTarget)
                .find("#blog-content")
                .val(),
            author: $(e.currentTarget)
                .find("#blog-author")
                .val(),
            publishDate: $(e.currentTarget)
                .find("#blog-date")
                .val(),
        });
    });
}



function handleBlogDelete() {
    $(".js-blog").on("click", ".js-blog-delete", function(e) {
        e.preventDefault();
        deleteBlog(
            $(e.currentTarget)
                .closest(".js-blog")
                .attr("id")
        );
    });
}


$(function() {
    getAndDisplayBlog();
    handleBlogAdd();
    handleBlogDelete();
});