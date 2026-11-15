/**
 * monitor.js - Página "Meu monitor" (monitor.html).
 * Operações: adicionar, listar, editar e remover aparelhos,
 * sempre atualizando a página pelo DOM e registrando cada ação.
 */
(function (V) {
  'use strict';

  const CAMPOS = ['nome', 'comodo', 'potencia', 'horas'];
  const MSG_CARREGAR = 'Não foi possível carregar os dados. Tente novamente.';
  const MSG_SALVAR = 'Não foi possível salvar os dados. Tente novamente.';

  let aparelhos = [];
  let tarifa = V.storage.TARIFA_PADRAO;

  const $ = (id) => document.getElementById(id);
  const el = {
    form: $('form-aparelho'), id: $('item-id'), titulo: $('titulo-form'),
    btnSalvar: $('btn-salvar'), btnCancelar: $('btn-cancelar'), mensagem: $('mensagem-form'),
    lista: $('lista-aparelhos'), listaVazia: $('lista-vazia'),
    log: $('log-atividades'), logVazio: $('log-vazio'),
    qtd: $('resumo-qtd'), kwh: $('resumo-kwh'), custo: $('resumo-custo'),
    tarifa: $('tarifa'), erroTarifa: $('erro-tarifa')
  };

  /* ---------- Mensagens e erros na tela ---------- */

  function mostrarMensagem(texto, sucesso) {
    el.mensagem.textContent = texto;
    el.mensagem.className = 'mensagem-form ' + (sucesso ? 'sucesso' : 'falha');
  }

  function limparMensagem() {
    el.mensagem.textContent = '';
    el.mensagem.className = 'mensagem-form';
  }

  function mostrarErroCampo(campo, texto) {
    const entrada = $(campo);
    $('erro-' + campo).textContent = texto;
    entrada.classList.toggle('invalido', texto !== '');
    entrada.setAttribute('aria-invalid', texto !== '' ? 'true' : 'false');
  }

  function registrar(acao, resultado, sucesso) {
    V.log.registrar(acao, resultado, sucesso);
    V.log.renderizar(el.log, el.logVazio);
  }

  /* ---------- Desenho da tela (DOM) ---------- */

  function criarBotao(texto, acao, id, classe) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = texto;
    botao.dataset.acao = acao;
    botao.dataset.id = String(id);
    if (classe) botao.className = classe;
    return botao;
  }

  function criarItem(aparelho) {
    const kwh = V.calculos.consumoMensalKwh(aparelho);
    const custo = V.calculos.custoMensal(kwh, tarifa);

    const nome = document.createElement('span');
    nome.className = 'item-nome';
    nome.textContent = aparelho.nome;

    const info = document.createElement('span');
    info.className = 'item-info';
    info.textContent = aparelho.comodo + ' · ' + aparelho.potencia + ' W · ' +
      String(aparelho.horas).replace('.', ',') + ' h/dia · ' +
      V.calculos.formatar(kwh) + ' kWh/mês · R$ ' + V.calculos.formatar(custo);

    const texto = document.createElement('div');
    texto.className = 'item-texto';
    texto.append(nome, info);

    const acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    acoes.append(
      criarBotao('Editar', 'editar', aparelho.id),
      criarBotao('Remover', 'remover', aparelho.id, 'btn-remover')
    );

    const li = document.createElement('li');
    li.append(texto, acoes);
    return li;
  }

  function renderizarLista() {
    el.lista.replaceChildren(...aparelhos.map(criarItem));
    el.listaVazia.hidden = aparelhos.length > 0;
  }

  function renderizarResumo() {
    const totalKwh = aparelhos.reduce((soma, a) => soma + V.calculos.consumoMensalKwh(a), 0);
    el.qtd.textContent = String(aparelhos.length);
    el.kwh.textContent = V.calculos.formatar(totalKwh);
    el.custo.textContent = V.calculos.formatar(V.calculos.custoMensal(totalKwh, tarifa));
  }

  function renderizarTudo() {
    renderizarLista();
    renderizarResumo();
  }

  /* ---------- Formulário ---------- */

  function lerFormulario() {
    return {
      id: el.id.value,
      nome: $('nome').value.trim(),
      comodo: $('comodo').value,
      potencia: $('potencia').value,
      horas: $('horas').value
    };
  }

  function entrarModoEdicao(aparelho) {
    el.id.value = String(aparelho.id);
    $('nome').value = aparelho.nome;
    $('comodo').value = aparelho.comodo;
    $('potencia').value = aparelho.potencia;
    $('horas').value = aparelho.horas;
    el.titulo.textContent = 'Editar aparelho';
    el.btnSalvar.textContent = 'Salvar alterações';
    el.btnCancelar.hidden = false;
  }

  function sairModoEdicao() {
    el.form.reset();
    el.id.value = '';
    CAMPOS.forEach((campo) => mostrarErroCampo(campo, ''));
    el.titulo.textContent = 'Cadastrar aparelho';
    el.btnSalvar.textContent = 'Adicionar aparelho';
    el.btnCancelar.hidden = true;
  }

  /* ---------- Operações sobre os dados ---------- */

  function adicionarAparelho(dados) {
    const novo = {
      id: Date.now(), nome: dados.nome.trim(), comodo: dados.comodo,
      potencia: Number(dados.potencia), horas: Number(dados.horas)
    };
    const novaLista = [...aparelhos, novo];
    V.storage.salvarAparelhos(novaLista); // só atualiza a memória se salvar funcionou
    aparelhos = novaLista;
    registrar('Adicionar', 'item "' + novo.nome + '" adicionado com sucesso', true);
    mostrarMensagem('Aparelho adicionado com sucesso.', true);
  }

  function atualizarAparelho(dados) {
    const id = Number(dados.id);
    if (!aparelhos.some((a) => a.id === id)) throw new Error('Item não encontrado');
    const novaLista = aparelhos.map(function (a) {
      return a.id !== id ? a : {
        id: id, nome: dados.nome.trim(), comodo: dados.comodo,
        potencia: Number(dados.potencia), horas: Number(dados.horas)
      };
    });
    V.storage.salvarAparelhos(novaLista);
    aparelhos = novaLista;
    registrar('Editar', 'item "' + dados.nome.trim() + '" atualizado com sucesso', true);
    mostrarMensagem('Aparelho atualizado com sucesso.', true);
  }

  function removerAparelho(id) {
    const alvo = aparelhos.find((a) => a.id === id);
    if (!alvo) return;
    if (!window.confirm('Remover "' + alvo.nome + '"?')) return;
    try {
      const novaLista = aparelhos.filter((a) => a.id !== id);
      V.storage.salvarAparelhos(novaLista);
      aparelhos = novaLista;
      if (el.id.value === String(id)) sairModoEdicao();
      registrar('Remover', 'item "' + alvo.nome + '" removido com sucesso', true);
      mostrarMensagem('Aparelho removido.', true);
      renderizarTudo();
    } catch (erro) {
      console.error(erro);
      registrar('Remover', 'falha ao remover o item', false);
      mostrarMensagem(MSG_SALVAR, false);
    }
  }

  /* ---------- Eventos ---------- */

  function aoEnviar(evento) {
    evento.preventDefault();
    limparMensagem();
    const dados = lerFormulario();
    const acao = dados.id !== '' ? 'Editar' : 'Adicionar';
    const erros = V.validacao.validarAparelho(dados);

    CAMPOS.forEach((campo) => mostrarErroCampo(campo, erros[campo] || ''));
    const invalidos = Object.keys(erros);
    if (invalidos.length > 0) {
      mostrarMensagem('Corrija os campos destacados.', false);
      registrar(acao, 'dados inválidos, nada foi salvo', false);
      $(invalidos[0]).focus();
      return;
    }

    try {
      if (dados.id !== '') atualizarAparelho(dados); else adicionarAparelho(dados);
      sairModoEdicao();
      renderizarTudo();
    } catch (erro) {
      console.error(erro); // detalhe técnico só no console
      registrar(acao, 'falha ao salvar o item', false);
      mostrarMensagem(MSG_SALVAR, false);
    }
  }

  function aoClicarNaLista(evento) {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao) return;
    const id = Number(botao.dataset.id);
    if (botao.dataset.acao === 'remover') {
      removerAparelho(id);
    } else if (botao.dataset.acao === 'editar') {
      const alvo = aparelhos.find((a) => a.id === id);
      if (!alvo) return;
      limparMensagem();
      entrarModoEdicao(alvo);
      el.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('nome').focus();
    }
  }

  function aoCancelarEdicao() {
    sairModoEdicao();
    limparMensagem();
    registrar('Editar', 'edição cancelada', true);
  }

  function aoAlterarTarifa() {
    const erro = V.validacao.validarTarifa(el.tarifa.value);
    el.erroTarifa.textContent = erro;
    el.tarifa.classList.toggle('invalido', erro !== '');
    if (erro !== '') {
      registrar('Atualizar tarifa', 'valor inválido, tarifa mantida', false);
      return;
    }
    try {
      const nova = Number(el.tarifa.value);
      V.storage.salvarTarifa(nova);
      tarifa = nova;
      registrar('Atualizar tarifa', 'tarifa alterada para R$ ' + V.calculos.formatar(nova) + '/kWh', true);
      renderizarTudo();
    } catch (erroTecnico) {
      console.error(erroTecnico);
      mostrarMensagem(MSG_SALVAR, false);
    }
  }

  /** Valida o campo quando o usuário sai dele (feedback imediato). */
  function aoSairDoCampo(evento) {
    const campo = evento.target.id;
    const validadores = {
      nome: V.validacao.validarNome, comodo: V.validacao.validarComodo,
      potencia: V.validacao.validarPotencia, horas: V.validacao.validarHoras
    };
    if (validadores[campo]) mostrarErroCampo(campo, validadores[campo](evento.target.value));
  }

  /* ---------- Início ---------- */

  function iniciar() {
    if (!V.auth.exigirLogin()) return; // página só para usuários logados
    try {
      aparelhos = V.storage.carregarAparelhos();
      tarifa = V.storage.carregarTarifa();
    } catch (erro) {
      console.error(erro);
      aparelhos = [];
      mostrarMensagem(MSG_CARREGAR, false);
    }
    el.tarifa.value = tarifa;
    renderizarTudo();
    V.log.renderizar(el.log, el.logVazio);

    el.form.addEventListener('submit', aoEnviar);
    el.form.addEventListener('focusout', aoSairDoCampo);
    el.btnCancelar.addEventListener('click', aoCancelarEdicao);
    el.lista.addEventListener('click', aoClicarNaLista);
    el.tarifa.addEventListener('change', aoAlterarTarifa);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})(window.Voltrack);
