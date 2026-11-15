/**
 * storage.js - Guarda e lê os dados no localStorage do navegador.
 * As funções podem lançar erro; quem chama usa try/catch e mostra
 * uma mensagem genérica ao usuário (sem detalhes técnicos).
 */
(function (V) {
  'use strict';

  /** Cada usuário tem suas próprias chaves: voltrack:<id do usuário>:<nome>. */
  function chave(nome) {
    const id = V.auth.idUsuario();
    if (!id) throw new Error('Nenhum usuário logado');
    return 'voltrack:' + id + ':' + nome;
  }
  const TARIFA_PADRAO = 0.9;
  const MAX_LOG = 50; // guarda só as últimas 50 atividades

  function lerJson(chave, padrao) {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  }

  function gravarJson(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  /** Lê os aparelhos e descarta qualquer item inválido. */
  function carregarAparelhos() {
    const lista = lerJson(chave('aparelhos'), []);
    if (!Array.isArray(lista)) throw new Error('Formato de dados inesperado');
    return lista.filter(V.validacao.aparelhoValido);
  }

  function salvarAparelhos(lista) {
    gravarJson(chave('aparelhos'), lista);
  }

  function carregarTarifa() {
    const valor = lerJson(chave('tarifa'), TARIFA_PADRAO);
    return V.validacao.validarTarifa(valor) === '' ? Number(valor) : TARIFA_PADRAO;
  }

  function salvarTarifa(tarifa) {
    gravarJson(chave('tarifa'), tarifa);
  }

  function carregarLog() {
    const lista = lerJson(chave('log'), []);
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (e) {
      return e && typeof e.data === 'string' && typeof e.acao === 'string' &&
        typeof e.resultado === 'string' && typeof e.sucesso === 'boolean';
    }).slice(0, MAX_LOG);
  }

  function salvarLog(lista) {
    gravarJson(chave('log'), lista.slice(0, MAX_LOG));
  }

  V.storage = {
    TARIFA_PADRAO, carregarAparelhos, salvarAparelhos,
    carregarTarifa, salvarTarifa, carregarLog, salvarLog
  };
})(window.Voltrack = window.Voltrack || {});
