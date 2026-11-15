/**
 * cadastro.js - Página de criação de conta (cadastro.html).
 */
(function (V) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CAMPOS = ['usuario', 'senha', 'confirmar', 'aceite'];

  function mostrarErro(campo, texto) {
    $('erro-' + campo).textContent = texto;
    $(campo).classList.toggle('invalido', texto !== '');
    $(campo).setAttribute('aria-invalid', texto !== '' ? 'true' : 'false');
  }

  function mostrarMensagem(texto) {
    $('mensagem-form').textContent = texto;
    $('mensagem-form').className = 'mensagem-form falha';
  }

  function mensagemDoErro(erro) {
    if (erro.codigo === 'USUARIO_EXISTE') return 'Esse nome de usuário já está em uso. Escolha outro.';
    return 'Não foi possível criar a conta. Tente novamente.';
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    $('mensagem-form').textContent = '';
    const usuario = $('usuario').value.trim().toLowerCase();
    const senha = $('senha').value;

    const erros = {
      usuario: V.validacao.validarUsuario(usuario),
      senha: V.validacao.validarSenha(senha),
      confirmar: V.validacao.validarConfirmacao(senha, $('confirmar').value),
      aceite: V.validacao.validarAceite($('aceite').checked)
    };
    CAMPOS.forEach((campo) => mostrarErro(campo, erros[campo]));
    const primeiroComErro = CAMPOS.find((campo) => erros[campo] !== '');
    if (primeiroComErro) {
      $(primeiroComErro).focus();
      return;
    }

    const botao = $('btn-cadastrar');
    botao.disabled = true;
    try {
      await V.auth.cadastrar(usuario, senha);
      V.log.registrar('Cadastro', 'conta criada com sucesso', true);
      window.location.href = 'monitor.html';
    } catch (erro) {
      if (!erro.codigo) console.error(erro);
      mostrarMensagem(mensagemDoErro(erro));
      botao.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    V.auth.redirecionarSeLogado();
    $('form-cadastro').addEventListener('submit', aoEnviar);
  });
})(window.Voltrack);
