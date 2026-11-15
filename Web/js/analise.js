/**
 * analise.js - Página "Análise" (analise.html).
 * Lê os aparelhos guardados no monitor e mostra: consumo por cômodo,
 * ranking dos maiores consumidores e um simulador de economia.
 */
(function (V) {
  'use strict';

  const MSG_CARREGAR = 'Não foi possível carregar os dados. Tente novamente.';
  const $ = (id) => document.getElementById(id);

  let aparelhos = [];
  let tarifa = V.storage.TARIFA_PADRAO;

  const kwhDe = (a) => V.calculos.consumoMensalKwh(a);

  /* ---------- Consumo por cômodo ---------- */

  /** Soma o consumo de cada cômodo e ordena do maior para o menor. */
  function somarPorComodo(lista) {
    const mapa = new Map();
    lista.forEach((a) => mapa.set(a.comodo, (mapa.get(a.comodo) || 0) + kwhDe(a)));
    return [...mapa.entries()].sort((x, y) => y[1] - x[1]);
  }

  function criarLinhaComodo(comodo, kwh, total) {
    const percentual = total > 0 ? (kwh / total) * 100 : 0;

    const rotulo = document.createElement('span');
    rotulo.className = 'barra-rotulo';
    rotulo.textContent = comodo;

    const preenchimento = document.createElement('span');
    preenchimento.className = 'barra-preenchimento';
    preenchimento.style.width = percentual.toFixed(1) + '%';
    const barra = document.createElement('span');
    barra.className = 'barra';
    barra.setAttribute('aria-hidden', 'true');
    barra.append(preenchimento);

    const valor = document.createElement('span');
    valor.className = 'barra-valor';
    valor.textContent = V.calculos.formatar(kwh) + ' kWh (' + Math.round(percentual) + '%)';

    const li = document.createElement('li');
    li.className = 'linha-barra';
    li.append(rotulo, barra, valor);
    return li;
  }

  function renderizarComodos() {
    const total = aparelhos.reduce((soma, a) => soma + kwhDe(a), 0);
    const linhas = somarPorComodo(aparelhos).map(([comodo, kwh]) => criarLinhaComodo(comodo, kwh, total));
    $('lista-comodos').replaceChildren(...linhas);
  }

  /* ---------- Ranking ---------- */

  function renderizarRanking() {
    const top = [...aparelhos].sort((a, b) => kwhDe(b) - kwhDe(a)).slice(0, 3);
    const itens = top.map(function (a) {
      const kwh = kwhDe(a);
      const li = document.createElement('li');
      li.textContent = a.nome + ' (' + a.comodo + '): ' + V.calculos.formatar(kwh) +
        ' kWh/mês · R$ ' + V.calculos.formatar(V.calculos.custoMensal(kwh, tarifa));
      return li;
    });
    $('lista-top').replaceChildren(...itens);
  }

  /* ---------- Simulador de economia ---------- */

  function preencherSelect() {
    const opcoes = aparelhos.map(function (a) {
      const opcao = document.createElement('option');
      opcao.value = String(a.id);
      opcao.textContent = a.nome + ' (' + a.comodo + ')';
      return opcao;
    });
    $('sim-aparelho').append(...opcoes);
  }

  const aparelhoEscolhido = () => aparelhos.find((a) => String(a.id) === $('sim-aparelho').value);

  function mostrarErro(campo, texto) {
    $('erro-' + campo).textContent = texto;
    $(campo).classList.toggle('invalido', texto !== '');
  }

  /** O limite de horas a menos depende do aparelho escolhido. */
  function aoEscolherAparelho() {
    const alvo = aparelhoEscolhido();
    $('sim-reducao').max = alvo ? alvo.horas : 24;
    $('resultado-sim').hidden = true;
  }

  function aoSimular(evento) {
    evento.preventDefault();
    const alvo = aparelhoEscolhido();
    const erroAparelho = alvo ? '' : 'Selecione um aparelho da lista.';
    const erroReducao = V.validacao.validarReducao($('sim-reducao').value, alvo ? alvo.horas : 24);
    mostrarErro('sim-aparelho', erroAparelho);
    mostrarErro('sim-reducao', erroReducao);
    if (erroAparelho || erroReducao) {
      $('resultado-sim').hidden = true;
      return;
    }

    const horasAMenos = Number($('sim-reducao').value);
    const kwh = (alvo.potencia * horasAMenos * V.calculos.DIAS_NO_MES) / 1000;
    const porMes = V.calculos.custoMensal(kwh, tarifa);
    $('sim-kwh').textContent = V.calculos.formatar(kwh);
    $('sim-mes').textContent = V.calculos.formatar(porMes);
    $('sim-ano').textContent = V.calculos.formatar(porMes * 12);
    $('resultado-sim').hidden = false;
  }

  /* ---------- Início ---------- */

  function iniciar() {
    if (!V.auth.exigirLogin()) return; // página só para usuários logados
    try {
      aparelhos = V.storage.carregarAparelhos();
      tarifa = V.storage.carregarTarifa();
    } catch (erro) {
      console.error(erro);
      $('analise-erro').textContent = MSG_CARREGAR;
      $('analise-erro').hidden = false;
      return;
    }
    if (aparelhos.length === 0) {
      $('analise-vazio').hidden = false;
      return;
    }
    renderizarComodos();
    renderizarRanking();
    preencherSelect();
    $('analise-conteudo').hidden = false;
    $('sim-aparelho').addEventListener('change', aoEscolherAparelho);
    $('form-simulador').addEventListener('submit', aoSimular);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})(window.Voltrack);
