const { getDatabase, client } = require("../db/MongoClient.js");
const { ObjectId } = require("mongodb");

class Emprestimo {
  constructor() {
    this.colecaoEmprestimos =
      getDatabase("biblioteca").collection("emprestimos");
    this.colecaoLivros = getDatabase("biblioteca").collection("livros");
  }

  async registrarEmprestimo(livroId, usuarioNome) {
    const sessao = client.startSession();
    try {
      await sessao.withTransaction(async () => {
        //withTransaction pra gerenciar automaticamente commit/rollback
        const livro = await this.colecaoLivros.findOne(
          { _id: new ObjectId(livroId) },
          { session: sessao },
        );
        if (!livro) {
          throw new Error(`livro ${livroId} não encontrado.`);
        }
        if (livro.exemplares_disponiveis <= 0) {
          throw new Error(`não há exemplares disponíveis no momento.`);
        }
        await this.colecaoLivros.updateOne(
          { _id: new ObjectId(livroId) },
          { $inc: { exemplares_disponiveis: -1 } },
          { session: sessao },
        );

        const data_devolucao_prevista = new Date();
        data_devolucao_prevista.setDate(data_devolucao_prevista.getDate() + 7);

        const novoEmprestimo = {
          livro_id: new ObjectId(livroId),
          usuario_nome: usuarioNome,
          data_emprestimo: new Date(),
          data_devolucao_prevista: data_devolucao_prevista,
          status: "ativo",
        };

        const resultado = await this.colecaoEmprestimos.insertOne(
          novoEmprestimo,
          {
            session: sessao,
          },
        );
        console.log(
          `\nEmpréstimo registrado\n` +
            `Usuário: ${usuarioNome}\n` +
            `Livro: ${livro.titulo} (${livro.autor})\n` +
            `Devolução prevista: ${data_devolucao_prevista.toLocaleDateString("pt-BR")}\n`,
        );
        return resultado;
      });
    } catch (erro) {
      console.error(`\nerro ao registrar empréstimo,\n  ${erro.message}\n`);
      throw erro;
    } finally {
      await sessao.endSession();
    }
  }
  async devolverLivro(emprestimoId) {
    const sessao = client.startSession();

    try {
      await sessao.withTransaction(async () => {
        const emprestimo = await this.colecaoEmprestimos.findOne(
          { _id: new ObjectId(emprestimoId) },
          { session: sessao },
        );
        if (!emprestimo) {
          throw new Error(`Empréstimo ${emprestimoId} não foi encontrado.`);
        }
        if (emprestimo.status !== "ativo") {
          throw new Error(`Este empréstimo já foi ${emprestimo.status}.`);
        }
        const livro = await this.colecaoLivros.findOne(
          { _id: emprestimo.livro_id },
          { session: sessao },
        );
        await this.colecaoEmprestimos.updateOne(
          { _id: new ObjectId(emprestimoId) },
          {
            $set: {
              status: "devolvido",
              data_devolucao_real: new Date(),
            },
          },
          { session: sessao },
        );
        await this.colecaoLivros.updateOne(
          { _id: emprestimo.livro_id },
          { $inc: { exemplares_disponiveis: +1 } },
          { session: sessao },
        );

        console.log(
          `\nLivro devolvido\n` +
            `Livro: ${livro.titulo}\n` +
            `Usuário: ${emprestimo.usuario_nome}\n` +
            `Data de devolução: ${new Date().toLocaleDateString("pt-BR")}\n`,
        );
      });
    } catch (erro) {
      console.error(`\nerro ao devolver o livro,\n  ${erro.message}\n`);
      throw erro;
    } finally {
      await sessao.endSession();
    }
  }
}

module.exports = Emprestimo;
