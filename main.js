const { conectar } = require("./db/MongoClient.js");
const Livro = require("./repositories/Livro.js");
const Emprestimo = require("./repositories/Emprestimo.js");

async function executarSistema() {
  try {
    await conectar();

    const livros = new Livro();
    const emprestimos = new Emprestimo();

    const livroInserido = await livros.cadastrarLivro({
      titulo: "Jantar Secreto",
      autor: "Raphael Montes",
      anoPublicacao: 2021,
      genero: "Suspense",
    });

    const idLivro = livroInserido.insertedId;
    const emprestimoInserido = await emprestimos.registrarEmprestimo(
      idLivro,
      "João da Silva",
    );

    const ativos = await emprestimos.listarEmprestimosAtivos();
    console.log("\nempréstimos ativos");
    console.log(ativos);
    console.log("\n");

    const idDoEmprestimo = emprestimoInserido.insertedId;
    await emprestimos.registrarDevolucao(idDoEmprestimo);
  } catch (error) {
    console.error("\n ocorreu um erro na execução", error.message);
  } finally {
    process.exit(0);
  }
}

executarSistema();
