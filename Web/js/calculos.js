/**
 * calculos.js - Fórmulas de consumo e formatação de números.
 */
(function (V) {
  'use strict';

  const DIAS_NO_MES = 30;

  /** consumo mensal (kWh) = potência (W) x horas por dia x 30 / 1000 */
  function consumoMensalKwh(aparelho) {
    return (aparelho.potencia * aparelho.horas * DIAS_NO_MES) / 1000;
  }

  function custoMensal(kwh, tarifa) {
    return kwh * tarifa;
  }

  /** Formata com 2 casas decimais no padrão brasileiro (ex.: 1.234,50). */
  function formatar(numero) {
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  V.calculos = { DIAS_NO_MES, consumoMensalKwh, custoMensal, formatar };
})(window.Voltrack = window.Voltrack || {});
