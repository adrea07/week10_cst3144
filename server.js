const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express(); 

app.use(express.json());
app.set('port', 6001);
//configure cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, Accept, X-Requested-With, Content-Type');
 
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
 
    next();
});

const uri = 'mongodb+srv://adrea18856_db_user:slimpitu2007@cluster0.vehldun.mongodb.net/'

const client = new MongoClient(uri);
let db;
async function startServer() {
    try{
        await client.connect();
        console.log('connected successfully to mongooodb');

        db = client.db('webstore');

        //root path
        app.get('/',(req,res) => {
            res.send('select a collection, e.g., /collection/messages');
        });

        app.param('collectionName', (req,res,next,collectionName) => {
            req.collection = db.collection(collectionName);
            next();
        });

        //retrieve all objects
        app.get('/collection/:collectionName', async (req,res,next) => {
            try {
                const results = await req.collection.find({}).toArray();
                res.send(results);
            } catch (err) {
                next(err);
            }
        });
        //insert new object
        app.post('/collection/:collectionName', async (req,res,next) => {
            try {
                const result = await req.collection.insertOne(req.body);
                res.status(201).send({
                    msg: 'success',
                    insertedId: result.insertedId
                });
            } catch (err) {
                next(err);
            }
        });

      //get one object using its object id
        app.get('/collection/:collectionName/:id', async (req,res,next) => {
            try{
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'invalid output'});
                }

                const result = await req.collection.findOne({
                    _id: new ObjectId(req.params.id)
                });
                res.send(result);
            } catch(err) {
                next(err);
            }
        });

        //update one object using its object id
        app.put('/collection/:collectionName/:id', async (req,res,next) => {
            try{
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'invalid object id'});
                }

                const result = await req.collection.updateOne(
                    {_id: new ObjectId(req.params.id)},
                    { $set: req.body}
                );
                res.send(result.matchedCount === 1 ? { msg: 'success'} : { msg: 'error'});
            } catch(err) {
                next(err);
            }
        });

        //delete one object
         app.delete('/collection/:collectionName/:id', async (req,res,next) => {
            try{
                if (!ObjectId.isValid(req.params.id)) {
                    return res.status(400).send({ msg: 'invalid object id'});
                }

                const result = await req.collection.deleteOne(
                    {_id: new ObjectId(req.params.id)}
                );
                res.send(result.deletedCount === 1 ? { msg: 'success'} : { msg: 'error'});
            } catch(err) {
                next(err);
            }
        });
            

        const port = process.env.PORT || 6001;

        app.listen(port,() => {
            console.log(`express js running at ${port}`);
        });
    

    } catch (error) {
        console.log('mongo db connection error:',error.message);

    } 
    //dont keep the await close for constant connection
}
startServer();
    
    

