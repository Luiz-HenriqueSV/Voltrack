/**
 * login.js - Página de login (login.html).
 */
(function (V) {
  'use strict';

  const $ = (id) => document.getElementById(id);

  function mostrarErro(campo, texto) {
    $('erro-' + campo).textContent = texto;
    $(campo).classList.toggle('invalido', texto !== '');
  }

  function mostrarMensagem(texto) {
    $('mensagem-form').textContent = texto;
    $('mensagem-form').className = 'mensagem-form falha';
  }

  /** Traduz o código do erro para uma mensagem sem detalhes técnicos. */
  function mensagemDoErro(erro) {
    if (erro.codigo === 'CREDENCIAIS') return 'Usuário ou senha incorretos.';
    if (erro.codigo === 'BLOQUEADO') return 'Muitas tentativas. Aguarde ' + erro.segundos + ' segundos e tente de novo.';
    return 'Não foi possível entrar. Tente novamente.';
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    $('mensagem-form').textContent = '';
    const usuario = $('usuario').value.trim().toLowerCase();
    const senha = $('senha').value;

    const erroUsuario = V.validacao.validarUsuario(usuario);
    const erroSenha = senha === '' ? 'Informe a senha.' : '';
    mostrarErro('usuario', erroUsuario);
    mostrarErro('senha', erroSenha);
    if (erroUsuario || erroSenha) return;

    const botao = $('btn-entrar');
    botao.disabled = true; // evita enviar duas vezes enquanto o hash é calculado
    try {
      await V.auth.entrar(usuario, senha);
      V.log.registrar('Entrar', 'login realizado com sucesso', true);
      window.location.href = 'monitor.html';
    } catch (erro) {
      if (!erro.codigo) console.error(erro);
      mostrarMensagem(mensagemDoErro(erro));
      $('senha').value = '';
      botao.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    V.auth.redirecionarSeLogado();
    $('form-login').addEventListener('submit', aoEnviar);
  });
})(window.Voltrack);
