/**
 * auth.js - Cadastro, login e sessão de usuário (somente no navegador).
 *
 * ATENÇÃO: sem servidor, isto é um protótipo. As contas ficam no localStorage
 * do navegador e quem tem acesso ao aparelho consegue ver ou alterar esses dados.
 * Autenticação de verdade exige um back-end (veja "Limitações" no README).
 * Mesmo assim, a senha nunca é guardada em texto: guardamos só um hash PBKDF2 com salt.
 */
(function (V) {
  'use strict';

  const CHAVE_USUARIOS = 'voltrack:usuarios';
  const CHAVE_SESSAO = 'voltrack:sessao';      // fica no sessionStorage (some ao fechar a aba)
  const CHAVE_TENTATIVAS = 'voltrack:tentativas';
  const ITERACOES = 100000;
  const MAX_TENTATIVAS = 5;
  const BLOQUEIO_MS = 60 * 1000;

  /** Cria um erro com um código que o controlador traduz para uma mensagem amigável. */
  function criarErro(codigo) {
    const erro = new Error(codigo);
    erro.codigo = codigo;
    return erro;
  }

  /* ---------- Funções de apoio para criptografia ---------- */

  const bytesAleatorios = (n) => crypto.getRandomValues(new Uint8Array(n));
  const paraHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const deHex = (hex) => Uint8Array.from(hex.match(/.{2}/g), (h) => parseInt(h, 16));

  /** Gera o hash PBKDF2-SHA256 da senha com o salt informado. */
  async function gerarHash(senha, saltHex) {
    if (!(window.crypto && crypto.subtle)) throw criarErro('SEM_CRIPTO');
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: deHex(saltHex), iterations: ITERACOES, hash: 'SHA-256' }, material, 256);
    return paraHex(new Uint8Array(bits));
  }

  /** Compara dois textos sem parar no primeiro caractere diferente. */
  function iguais(a, b) {
    if (a.length !== b.length) return false;
    let diferenca = 0;
    for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diferenca === 0;
  }

  /* ---------- Contas guardadas ---------- */

  function lerUsuarios() {
    const lista = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
    if (!Array.isArray(lista)) throw criarErro('DADOS');
    return lista.filter((u) => u && typeof u.id === 'string' && typeof u.nome === 'string' &&
      typeof u.salt === 'string' && typeof u.hash === 'string');
  }

  /* ---------- Proteção contra tentativas repetidas ---------- */

  function lerBloqueio() {
    try {
      const t = JSON.parse(localStorage.getItem(CHAVE_TENTATIVAS) || '{}');
      return { n: Number(t.n) || 0, ate: Number(t.ate) || 0 };
    } catch (erro) {
      return { n: 0, ate: 0 };
    }
  }

  function registrarFalha() {
    const t = lerBloqueio();
    t.n += 1;
    if (t.n >= MAX_TENTATIVAS) { t.ate = Date.now() + BLOQUEIO_MS; t.n = 0; }
    localStorage.setItem(CHAVE_TENTATIVAS, JSON.stringify(t));
  }

  /* ---------- Sessão ---------- */

  function abrirSessao(usuario) {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id: usuario.id, nome: usuario.nome }));
  }

  /** Devolve {id, nome} do usuário logado ou null. Confere se a conta ainda existe. */
  function usuarioAtual() {
    try {
      const sessao = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
      if (!sessao || typeof sessao.id !== 'string') return null;
      const conta = lerUsuarios().find((u) => u.id === sessao.id);
      return conta ? { id: conta.id, nome: conta.nome } : null;
    } catch (erro) {
      return null;
    }
  }

  const idUsuario = () => { const u = usuarioAtual(); return u ? u.id : null; };

  function sair() {
    sessionStorage.removeItem(CHAVE_SESSAO);
  }

  /** Para páginas protegidas: manda para o login quando não há sessão. */
  function exigirLogin() {
    if (usuarioAtual()) return true;
    window.location.replace('login.html');
    return false;
  }

  /** Para login e cadastro: quem já está logado vai direto ao monitor. */
  function redirecionarSeLogado() {
    if (usuarioAtual()) window.location.replace('monitor.html');
  }

  /* ---------- Cadastro e login ---------- */

  async function cadastrar(nome, senha) {
    const usuarios = lerUsuarios();
    if (usuarios.some((u) => u.nome === nome)) throw criarErro('USUARIO_EXISTE');
    const salt = paraHex(bytesAleatorios(16));
    const novo = {
      id: paraHex(bytesAleatorios(8)), nome: nome, salt: salt,
      hash: await gerarHash(senha, salt), criadoEm: new Date().toISOString()
    };
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([...usuarios, novo]));
    abrirSessao(novo);
  }

  async function entrar(nome, senha) {
    const bloqueio = lerBloqueio();
    if (bloqueio.ate > Date.now()) {
      const erro = criarErro('BLOQUEADO');
      erro.segundos = Math.ceil((bloqueio.ate - Date.now()) / 1000);
      throw erro;
    }
    const usuario = lerUsuarios().find((u) => u.nome === nome);
    // O hash é calculado mesmo se o usuário não existir, para o tempo de resposta
    // não revelar se o nome de usuário está cadastrado.
    const hash = await gerarHash(senha, usuario ? usuario.salt : paraHex(bytesAleatorios(16)));
    if (!usuario || !iguais(hash, usuario.hash)) {
      registrarFalha();
      throw criarErro('CREDENCIAIS');
    }
    localStorage.removeItem(CHAVE_TENTATIVAS);
    abrirSessao(usuario);
  }

  V.auth = { cadastrar, entrar, sair, usuarioAtual, idUsuario, exigirLogin, redirecionarSeLogado };
})(window.Voltrack = window.Voltrack || {});
