/**
 * log.js - Painel de registro de atividades (data/hora, ação e resultado).
 */
(function (V) {
  'use strict';

  const doisDigitos = (n) => String(n).padStart(2, '0');

  /** Converte a data ISO para o formato 17/11/2026 08:30. */
  function formatarDataHora(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--/--/---- --:--';
    return doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' ' + doisDigitos(d.getHours()) + ':' + doisDigitos(d.getMinutes());
  }

  /** Guarda uma atividade. Uma falha aqui nunca deve travar a operação principal. */
  function registrar(acao, resultado, sucesso) {
    try {
      const lista = V.storage.carregarLog();
      lista.unshift({ data: new Date().toISOString(), acao: acao, resultado: resultado, sucesso: sucesso });
      V.storage.salvarLog(lista);
    } catch (erro) {
      console.error('Não foi possível registrar a atividade:', erro);
    }
  }

  function criarLinha(entrada) {
    const li = document.createElement('li');
    const data = document.createElement('span');
    data.className = 'log-data';
    data.textContent = formatarDataHora(entrada.data);
    const texto = document.createElement('span');
    texto.className = entrada.sucesso ? 'log-ok' : 'log-erro';
    texto.textContent = entrada.acao + ': ' + entrada.resultado; // textContent evita injeção de HTML
    li.append(data, ' — ', texto);
    return li;
  }

  /** Redesenha o painel na tela. */
  function renderizar(lista, aviso) {
    let entradas = [];
    try {
      entradas = V.storage.carregarLog();
    } catch (erro) {
      console.error('Não foi possível ler o registro:', erro);
    }
    lista.replaceChildren(...entradas.map(criarLinha));
    aviso.hidden = entradas.length > 0;
  }

  V.log = { registrar, renderizar, formatarDataHora };
})(window.Voltrack = window.Voltrack || {});
