/**
 * validacao.js - Regras de validação de toda entrada do usuário.
 * Cada função devolve uma string: '' quando o valor é válido,
 * ou a mensagem de erro (amigável, sem detalhes internos) quando não é.
 */
(function (V) {
  'use strict';

  const COMODOS = ['Cozinha', 'Sala', 'Quarto', 'Banheiro', 'Área de serviço', 'Outro'];
  // Letras (com acento), números, espaço e pontuação simples
  const PADRAO_NOME = /^[\p{L}\p{N} .,'()\/-]+$/u;

  /** Troca ponto por vírgula para mostrar números no padrão brasileiro. */
  function virgula(numero) {
    return String(numero).replace('.', ',');
  }

  function validarNome(valor) {
    const nome = String(valor).trim();
    if (nome === '') return 'Informe o nome do aparelho.';
    if (nome.length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
    if (nome.length > 40) return 'O nome deve ter no máximo 40 caracteres.';
    if (!PADRAO_NOME.test(nome)) return 'Use apenas letras, números e pontuação simples.';
    return '';
  }

  function validarComodo(valor) {
    if (String(valor) === '') return 'Selecione o cômodo.';
    if (!COMODOS.includes(valor)) return 'Escolha um cômodo da lista.';
    return '';
  }

  /** Validação genérica de número: vazio, tipo, inteiro e faixa de valores. */
  function validarNumero(valor, regras) {
    const texto = String(valor).trim();
    if (texto === '') return 'Informe ' + regras.rotulo + '.';
    const numero = Number(texto);
    if (!Number.isFinite(numero)) return 'Digite apenas números.';
    if (regras.inteiro && !Number.isInteger(numero)) return 'Use um número inteiro.';
    if (numero < regras.min || numero > regras.max) {
      return 'Digite um valor entre ' + virgula(regras.min) + ' e ' + virgula(regras.max) + '.';
    }
    return '';
  }

  const validarPotencia = (v) => validarNumero(v, { rotulo: 'a potência', min: 1, max: 10000, inteiro: true });
  const validarHoras = (v) => validarNumero(v, { rotulo: 'as horas de uso', min: 0.1, max: 24 });
  const validarTarifa = (v) => validarNumero(v, { rotulo: 'a tarifa', min: 0.1, max: 5 });
  const validarReducao = (v, max) => validarNumero(v, { rotulo: 'as horas a menos', min: 0.1, max: max });

  /** Valida o formulário inteiro. Devolve só os campos com erro. */
  function validarAparelho(dados) {
    const resultado = {
      nome: validarNome(dados.nome),
      comodo: validarComodo(dados.comodo),
      potencia: validarPotencia(dados.potencia),
      horas: validarHoras(dados.horas)
    };
    Object.keys(resultado).forEach(function (campo) {
      if (resultado[campo] === '') delete resultado[campo];
    });
    return resultado;
  }

  /** Confere um item vindo do localStorage (que pode ter sido alterado à mão). */
  function aparelhoValido(item) {
    return Boolean(item) && typeof item === 'object' &&
      Number.isFinite(item.id) &&
      typeof item.nome === 'string' && validarNome(item.nome) === '' &&
      validarComodo(item.comodo) === '' &&
      typeof item.potencia === 'number' && validarPotencia(item.potencia) === '' &&
      typeof item.horas === 'number' && validarHoras(item.horas) === '';
  }

  V.validacao = {
    COMODOS, validarNome, validarComodo, validarNumero, validarPotencia,
    validarHoras, validarTarifa, validarReducao, validarAparelho, aparelhoValido
  };
})(window.Voltrack = window.Voltrack || {});
