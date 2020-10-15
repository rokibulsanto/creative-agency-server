const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rccbp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('courseImage'));
app.use(fileUpload());

const port = 8080;

app.get('/', (req, res) => {
    res.send('MOngodb is working well');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
    const bookings = client.db("creative").collection("data");
    const book = client.db("creative").collection("feedback");
    const form = client.db("creative").collection("servicedata");

    app.post('/addevent', (req, res) => {
        const newbooking = req.body;
        form.insertOne(newbooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/addservice', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const text= req.body.text;
        const newImg = file.data;
       
      console.log(file);

        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        book.insertOne({ title,text, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })  
    })

    app.post('/ser', (req, res) => {
        const newbooking = req.body;
        bookings.insertOne(newbooking)
       
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });


    app.get('/admin', (req, res) => {
        form.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/event', (req, res) => {
       form.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/ser', (req, res) => {
        bookings.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/service', (req, res) => {
        book.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

app.listen(process.env.PORT || port);
});



