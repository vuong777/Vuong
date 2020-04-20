const express = require('express');
var router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
ObjectId = require('mongodb').ObjectId;
var url = 'mongodb+srv://vuong18068:2932000@cluster0-ngump.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass%20Community&retryWrites=true&ssl=true';
//upload
fs = require('fs-extra');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db('ATN')
});
//
//get product
router.get('/', async (req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('allProduct', { product: results });
})

//edit product
router.get('/edit', async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let result = await dbo.collection("Product").findOne({ "_id": ObjectID(id) });
    res.render('allProduct', { product: result });
})

//update product
router.post('/edit', async (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    let color = req.body.color;
    let price = req.body.price;
    let newValues = { $set: { ProductName: name, Color: color, Price: price } };
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("Product").updateOne(condition, newValues);
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('allProduct', { product: results });
})

//addproduct
router.post('/insert',upload.single('picture'), async (req, res) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');

    var insertProducts = {
        _id: req.body._id,
        ProductName: req.body.productName,
        Color:req.body.Color,
        Price: req.body.Price,
        image: new Buffer(encode_image, 'base64')
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("Product").insertOne(insertProducts, (err, result)=>{
        console.log(result)
        if (err) return console.log(err)
        console.log('saved to database')
    });
    let result = await dbo.collection("Product").find({}).toArray();
    res.render('allProduct', {product: result});
});
router.get('/photos/:id', (req, res) => {
    var filename = req.params.id;
    db.collection('Product').findOne({'_id': ObjectId(filename)}, (err, result) => {
        if (err) return console.log(err);
        res.contentType('image/jpeg');
        res.send(result.image.buffer);
    })
});

//product/search->browser
router.get('/search', (req, res) => {
    res.render('allProduct');
})
//product/search ->post
router.post('/search', async (req, res) => {
    let search = req.body.ProductName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let results = await dbo.collection("Product").find({ "ProductName": search }).toArray();
    res.render('allProduct', { product: results });
})

//delete product
router.get('/delete', async (req, res) => {
    let client = await MongoClient.connect(url);
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let dbo = client.db("ATN");
    let condition = { "_id": ObjectID(id) };
    await dbo.collection("Product").deleteOne(condition);
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('allProduct', { product: results });
})


module.exports = router;