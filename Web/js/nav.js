/**
 * nav.js - Completa o menu conforme o usuário esteja logado ou não.
 * Logado: "Olá, nome" e botão Sair. Visitante: links Entrar e Criar conta.
 */
(function (V) {
  'use strict';

  function item(elemento) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.append(elemento);
    return li;
  }

  function criarLink(texto, href, classe) {
    const a = document.createElement('a');
    a.className = classe;
    a.href = href;
    a.textContent = texto;
    if (window.location.pathname.endsWith('/' + href) || window.location.pathname.endsWith(href)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    return a;
  }

  function aoSair() {
    try {
      if (V.log) V.log.registrar('Sair', 'sessão encerrada', true);
    } catch (erro) {
      console.error(erro);
    }
    V.auth.sair();
    window.location.href = 'index.html';
  }

  function montarMenu() {
    const lista = document.getElementById('menu-lista');
    if (!lista || !V.auth) return;
    const usuario = V.auth.usuarioAtual();

    if (usuario) {
      const saudacao = document.createElement('span');
      saudacao.className = 'nav-usuario';
      saudacao.textContent = 'Olá, ' + usuario.nome; // textContent evita injeção de HTML
      const sair = document.createElement('button');
      sair.type = 'button';
      sair.className = 'btn btn-secundario btn-sm btn-sair';
      sair.textContent = 'Sair';
      sair.addEventListener('click', aoSair);
      lista.append(item(saudacao), item(sair));
    } else {
      lista.append(
        item(criarLink('Entrar', 'login.html', 'nav-link')),
        item(criarLink('Criar conta', 'cadastro.html', 'btn btn-destaque btn-sm'))
      );
    }
  }

  document.addEventListener('DOMContentLoaded', montarMenu);
})(window.Voltrack);
