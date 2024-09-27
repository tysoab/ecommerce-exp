// mongodb connection
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

// create a connector
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://tysoab:Tysoabolutee@cluster0.ugql4.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0"
  )
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// get db
const getDb = () => {
  if (_db) {
    return _db;
  }

  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
