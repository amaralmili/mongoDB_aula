const { getDatabase } = require("../db/MongoClient.js");
const { ObjectId } = require("mongodb");

class Emprestimo {
  constructor() {
    this.colecao = getDatabase("biblioteca").collection("emprestimos");
  }

  async registrarEmprestimo(idLivro, nomeUsuario) {
    try {
      const novoEmprestimo = {
        idLivro: new ObjectId(idLivro),
        usuario: nomeUsuario,
        dataEmprestimo: new Date(),
        dataDevolucao: null,
        devolvido: false,
      };

      const resultado = await this.colecao.insertOne(novoEmprestimo);
      console.log(
        `emprestimo para o usuário ${nomeUsuario}, registrado com sucesso`,
      );
      return resultado;
    } catch (error) {
      console.error("falha ao registrar empréstimo", error.message);
      throw error;
    }
  }

  async listarEmprestimosAtivos() {
    try {
      const emprestimos = await this.colecao
        .find({ devolvido: false })
        .toArray();
      return emprestimos;
    } catch (error) {
      console.error("falha ao listar empréstimos ativos", error.message);
      throw error;
    }
  }

  async registrarDevolucao(idEmprestimo) {
    try {
      const resultado = await this.colecao.updateOne(
        { _id: new ObjectId(idEmprestimo) },
        {
          $set: {
            dataDevolucao: new Date(),
            devolvido: true,
          },
        },
      );
      console.log(`devolução concluída`);
      return resultado;
    } catch (error) {
      console.error("falha ao registrar a devolução", error.message);
      throw error;
    }
  }
}

module.exports = Emprestimo;
