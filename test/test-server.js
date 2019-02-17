const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Blog List", function() {
    // before tests run we activate server. Our runserver 
    // function returns a promise and we return that promise by
    // doing return runServer.  If we didn't return a promise here
    // there is a possibility of a race condition whre our tests start
    // running before our server has started
    before(function() {
        return runServer();
    });

    // although we gave one test module at the moment, we'll close our server at the end of these tests. 
    // Otherwise if we add another test module that also has a before block
    // that starts our server, it will cause an error because the server would still 
    // be running from the previous tests 

    after(function() {
        return closeServer();
    });

    // test strategy:
    // 1. make a request to /blog-posts
    // 2. inspect the response object and verify correct code and keys
    it("Should list items on GET", function() {
        // for mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a done callback
        // at the end of the test.  The chai.request(app)).get... call is asynchronous
        // and returns a Promise, so we just return it
        return chai.request(app)
        .get("/blog-posts")
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a("array");
            // becasue we created two items on app load
            expect(res.body.length).to.be.at.least(1);
            // each item should be an object with key/valuepair
            // for id, title, author, content, and publishDate
            const expectedKeys = ["id", "title", "content", "author", "publishDate"];
            res.body.forEach(function(item) {
                expect(item).to.be.a("object");
                expect(item).to.include.keys(expectedKeys);
            });
        });
    });
    it("Should add an item on POST", function() {
        const newItem = {
            title: "Planets",
            content: "Planets are round...and large",
            author: "Nam",
            publishDate: "2/16/2019"
         };
         return chai.request(app)
         .post("/blog-posts")
         .send(newItem)
         .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a("object")
            expect(res.body).to.include.keys("id", "title", "content", "author", "publishDate")
            expect(res.body.id).to.not.equal(null);
            // reponse whould be deep equal to newItem from above if we assign id to it from re.body.id
            Object.assign(newItem, { id: res.body.id })
            expect(res.body.id).to.deep.equal(newItem.id)
            expect(res.body.title).to.deep.equal(newItem.title)
            expect(res.body.content).to.deep.equal(newItem.content)
            expect(res.body.author).to.deep.equal(newItem.author) 
         });
    });
    // test strategy
    // 1. intialize some update data (we won't have an id yet)
    // 2. make a GET request so we can get an item to update
    // 3. add the id to updateData
    // 4. Make a PUT request with updateData
    // 5. inspect the response object to ensure it has right status code and item with correct data
    it("Should update items on PUT", function() {
        const updateData = {
            title: "My First Blog Post",
            content: "Mellow World",
            author: "Nam",
            publishDate: "2/10/2019"
        };
        return chai.request(app)
        // first we ge the id of an obejct to update
        .get("/blog-posts")
        .then(function(res) {
            updateData.id = res.body[0].id;
            // this will return a promise whose value will be the response
            // object, which we can inspect in the next `then` block. Note
            // that we could have used a nested callback here instead of
            // returning a promise and chaining with `then`, but we find
            // this approach cleaner and easier to read and reason about.
            return chai.request(app)
            .put(`/blog-posts/${updateData.id}`)
            .send(updateData);
        })
        // prove the PUT request has right status code and returns updated data
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a("object");
            expect(res.body).to.deep.equal(updateData);
        })
    })
    // test strategy:
  //  1. GET shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it("should delete items on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get so we have an `id` of item
        // to delete
        .get("/blog-posts")
        .then(function(res) {
          return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
})