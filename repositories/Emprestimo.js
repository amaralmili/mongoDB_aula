const { getDatabase } = require("../db/MongoClient.js");
const { ObjectId } = require("mongodb");

class Emprestimo {
  constructor() {
    this.colecao = getDatabase("biblioteca").collection("emprestimos");
  }

  async registrarEmprestimo(livro_id, usuario_nome, data_devolucao_prevista) {
    try {
      const novoEmprestimo = {
        livro_id: new ObjectId(livro_id),
        usuario_nome,
        data_emprestimo: new Date(),
        data_devolucao_prevista,
        status: "emprestado",
      };

      const resultado = await this.colecao.insertOne(novoEmprestimo);
      console.log(
        `emprestimo para o usuário ${usuario_nome}, registrado com sucesso`,
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
        .find({ status: "emprestado" })
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
            data_devolucao_efetiva: new Date(),
            status: "devolvido",
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
