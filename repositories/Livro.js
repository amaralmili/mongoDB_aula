const { getDatabase } = require("../db/MongoClient.js");
const { ObjectId } = require("mongodb");

class Livro {
  constructor() {
    this.colecao = getDatabase("biblioteca").collection("livros"); // Conecta à coleção "livros" do banco "biblioteca"
  }

  async cadastrarLivro(
    titulo,
    autor,
    isbn,
    exemplares_total,
    exemplares_disponiveis,
  ) {
    try {
      const livro = {
        titulo,
        autor,
        isbn,
        exemplares_total,
        exemplares_disponiveis,
      };
      const resultado = await this.colecao.insertOne(livro);
      console.log(`livro Cadastrado com sucesso`);
      return resultado;
    } catch (error) {
      console.error("falha ao cadastrar o livro", error.message);
      throw error;
    }
  }

  async listarLivros() {
    try {
      const livros = await this.colecao.find({}).toArray();
      return livros;
    } catch (error) {
      console.error("falha ao listar os livros", error.message);
      throw error;
    }
  }

  async atualizarLivro(id, dadosAtualizados) {
    try {
      const resultado = await this.colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosAtualizados },
      );
      console.log(`livro atualizado com sucesso`);
      return resultado;
    } catch (error) {
      console.error("falha ao atualizar o livro", error.message);
      throw error;
    }
  }

  async deletarLivro(id) {
    try {
      const resultado = await this.colecao.deleteOne({ _id: new ObjectId(id) });
      console.log(`livro deletado com sucesso`);
      return resultado;
    } catch (error) {
      console.error("falha ao deletar o livro", error.message);
      throw error;
    }
  }
}

module.exports = Livro;
