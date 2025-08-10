const express = require("express");
const app = express();
const {MongoClient} = require("mongodb");
const PORT= process.env.PORT || 8000;

//fetch('/api/articles/...',{
  //  method: 'GET',
    //b
//})



//initialize middleware
// we use to have to install body parser but now it is built in middleware
//functition of express. it parses incoming JSON payload
app.use(express.json({extended: false}));
const withDB = async(operations, res) => {
    try{
     
   const client = await MongoClient.connect('mongodb://localhost:27017')
   const db = client.db('mernblog');
   await operations(db);
   client.close();

}catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({message: "Error connecting to the database ",error});
}
}
app.get('/api/articles/:name', async (req, res) => {
    withDB(async(db)=> {

    const articleName = req.params.name;
   const articalInfo = await db.collection("articles").findOne({name: articleName});
   res.status(200).json(articalInfo);

    }, res)

});

app.post('/api/articles/:name/add-comments', (req, res) => {
    const {username, text} =req.body;
    const articleName = req.params.name;
    withDB(async(db)=> {
        const articleInfo = await db.collection("articles").findOne({name: articleName});
        await db.collection("articles").updateOne({name: articleName}, {
            "$set": {
                comments: articleInfo.comments.concat({username, text})
            }
        });
        const updatedArticleInfo = await db.collection("articles").findOne({name: articleName});
        res.status(200).json(updatedArticleInfo);
    }, res)
})


app.listen(8000, ()=>console.log (`Server started at port ${PORT}`));