const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

async function conectar() {
  try {
    await client.connect();
    console.log("MongoDB Conectado.");
    return client;
  } catch (error) {
    console.log("Erro ao conectar com o banco de dados.");
  }
}

function getDatabase(nomeBanco) {
  return client.db(nomeBanco);
}

module.exports = { conectar, getDatabase, client };
