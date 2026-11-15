# Voltrack

**Acompanhe o consumo dos aparelhos da sua casa e descubra onde sua energia está sendo desperdiçada.**

Protótipo funcional de uma solução de **Tecnologia Cidadã**, desenvolvido como atividade avaliativa de Desenvolvimento Web I.

- **Tema:** uso consciente de recursos, com foco na redução do desperdício de energia elétrica
- **ODS relacionado:** ODS 7, Energia limpa e acessível
- **Repositório:** https://github.com/Luiz-HenriqueSV/Voltrack

---

## Objetivo

O Voltrack ajuda moradores a entender quais aparelhos pesam mais na conta de luz. O usuário cadastra os aparelhos da casa (nome, cômodo, potência e horas de uso por dia) e o site calcula o consumo mensal em kWh e o custo estimado em reais. Com esses números, fica mais fácil decidir onde mudar um hábito, trocar um equipamento ou fazer uma manutenção.

## Problema e cidadão

**Cidadão afetado:** moradores de residências urbanas que recebem a conta de luz todo mês sem saber o que causa o valor cobrado, especialmente famílias para as quais a conta pesa no orçamento.

**Problema:** o desperdício de energia dentro de casa passa despercebido. As principais causas são:

- luzes acesas em ambientes desocupados;
- equipamentos ligados sem necessidade;
- uso de lâmpadas pouco eficientes;
- aparelhos antigos com elevado consumo;
- uso inadequado do ar-condicionado;
- falta de manutenção dos equipamentos.

**Evidência (dado público):** o Programa Nacional de Conservação de Energia Elétrica (Procel) promove iniciativas de eficiência energética no Brasil e registrou, em 2023, uma economia de aproximadamente 23,9 bilhões de kWh. O número mostra o tamanho do que pode ser poupado quando a eficiência energética vira prioridade.

## Funcionalidades

- **Cadastrar** aparelhos com nome, cômodo, potência (W) e horas de uso por dia.
- **Listar** os aparelhos cadastrados, atualizando a página pelo DOM.
- **Editar** e **remover** itens a qualquer momento.
- **Resumo do mês** com quantidade de aparelhos, consumo estimado (kWh) e custo estimado (R$), com tarifa ajustável.
- **Registro de atividades** na tela, com data/hora, ação e resultado de cada operação.
- **Validação em duas camadas:** atributos nativos do HTML5 e validação em JavaScript, com mensagens claras na tela.
- **Layout responsivo**, pensado primeiro para celular (Mobile First).
- **Página de análise:** consumo por cômodo, ranking dos 3 maiores consumidores e simulador de economia ("e se eu usar duas horas a menos?").
- **Dados guardados no navegador** (`localStorage`): os aparelhos, a tarifa e o registro de atividades continuam ao recarregar a página.
- Página com **dicas de economia**, explicação do ODS 7 e aviso de privacidade.

**Cálculo do consumo:**

```
consumo mensal (kWh) = potência (W) × horas por dia × 30 ÷ 1000
custo estimado (R$)  = consumo mensal (kWh) × tarifa (R$/kWh)
```

## Tecnologias usadas

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica (`header`, `nav`, `main`, `section`, `footer`) |
| CSS3 | Estilos em arquivo externo, Flexbox, Grid, variáveis CSS e media queries |
| JavaScript (ES6+) | Validação, operações sobre os dados, manipulação do DOM e registro de atividades |
| Bootstrap 5.3 | Navbar, grid e cards (carregado por CDN) |
| Git e GitHub | Controle de versão e hospedagem do código |

## Como executar

Não é preciso instalar nada além de um editor e um navegador.

1. Baixe o projeto (`.zip`) ou clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/voltrack.git
   ```
2. Abra a pasta `voltrack` no **VS Code**.
3. Instale a extensão **Live Server**, se ainda não tiver.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Também é possível abrir o `index.html` direto no navegador. O Bootstrap é carregado por CDN, então é necessária conexão com a internet.

## Estrutura de pastas

```
voltrack/
├── index.html        # Página inicial: apresentação, causas do desperdício, como funciona
├── monitor.html      # Página principal: formulário, resumo, lista e registro de atividades
├── analise.html      # Consumo por cômodo, ranking e simulador de economia
├── sobre.html        # Dicas de economia, sobre o projeto, ODS 7 e privacidade
├── css/
│   └── style.css     # Estilos do site (Mobile First)
├── js/
│   ├── validacao.js  # Regras de validação de toda entrada do usuário
│   ├── calculos.js   # Fórmulas de consumo e formatação de números
│   ├── storage.js    # Leitura e gravação no localStorage
│   ├── log.js        # Painel de registro de atividades
│   ├── monitor.js    # Página do monitor: adicionar, listar, editar e remover
│   └── analise.js    # Página de análise: gráficos de barras, ranking e simulador
├── img/              # Prints das telas usados neste README
└── README.md
```

## Modelo de dados

Cada aparelho cadastrado é um objeto com os campos abaixo. O consumo e o custo são calculados na hora, não são guardados.

| Campo | Tipo | Regra de validação |
|---|---|---|
| `id` | número | gerado automaticamente |
| `nome` | texto | obrigatório, de 2 a 40 caracteres |
| `comodo` | texto | obrigatório, escolhido de uma lista fixa |
| `potencia` | número | obrigatório, de 1 a 10000 (W) |
| `horas` | número | obrigatório, de 0,1 a 24 (horas por dia) |

## Segurança e privacidade

- **Validação de toda entrada:** campo vazio, tamanho, formato e tipo são verificados antes do uso, tanto pelo HTML5 quanto pelo JavaScript.
- **Mensagens de erro sem detalhes internos:** em caso de falha, o usuário vê uma mensagem genérica (por exemplo, "Não foi possível carregar os dados. Tente novamente."). O erro técnico vai apenas para o console do desenvolvedor.
- **Escrita segura no DOM:** textos digitados pelo usuário são inseridos com `textContent`, e não com `innerHTML`, para evitar injeção de código (XSS).
- **Coleta mínima de dados (LGPD):** o site não pede nome, e-mail, endereço ou qualquer dado pessoal. Só são coletados nome do aparelho, cômodo, potência e horas de uso.
- **Dados fictícios:** o formulário traz um aviso de privacidade e orienta o uso de dados fictícios.
- **Sem segredos no repositório:** o projeto não usa chaves, senhas nem servidor. Tudo roda no navegador.

## Testes realizados

- **Larguras de tela:** layout verificado em celular (375 px), tablet (768 px) e desktop (1200 px).
- **Entradas inválidas:** campos vazios, nome com 1 caractere ou acima de 40, potência zero, negativa ou acima de 10000, horas acima de 24, texto no lugar de número e tarifa inválida.
- **Operações:** adicionar, listar, editar, cancelar edição e remover, conferindo se resumo e registro de atividades são atualizados a cada ação.
- **Navegação:** links entre as 4 páginas e menu (inclusive o botão de hambúrguer no celular) em todas elas.
- **Persistência:** recarregar a página e conferir se aparelhos, tarifa e registro de atividades continuam lá.
- **Dados adulterados:** alterar o `localStorage` à mão e conferir que itens inválidos são descartados.
- **Simulador:** reduzir mais horas do que o aparelho usa, deixar campos vazios e não escolher aparelho.


## Como o Voltrack se sustentaria como negócio de impacto

A versão gratuita para moradores é a base da solução. Para ser sustentável e escalável, o serviço poderia:

- oferecer um plano para **condomínios, escolas e pequenos negócios**, com acompanhamento de vários locais e relatórios mensais;
- fazer **parcerias com distribuidoras e programas de eficiência energética**, que têm interesse em reduzir o desperdício;
- gerar **relatórios agregados e anônimos** por bairro, úteis para o poder público e para campanhas de conscientização.

## Limitações

- O consumo é uma **estimativa** baseada na potência informada e nas horas de uso. Não substitui a medição real da conta nem de um medidor.
- Os dados ficam apenas no navegador do usuário. Não há login nem sincronização entre dispositivos.
- Não há integração com a conta de luz nem com a tarifa da distribuidora, que o usuário informa manualmente.

## Créditos e uso de IA

- **Bootstrap 5.3** (licença MIT): https://getbootstrap.com
- **Dado do Procel:** Programa Nacional de Conservação de Energia Elétrica.
- **IA generativa:** o Claude (Anthropic) foi usado como apoio para estudar e organizar o código do projeto, conforme declarado também no relatório. O código foi revisado e é explicado por mim.

## Autoria

Projeto individual desenvolvido por **Luiz Henrique Souza Ventura** para a disciplina de Desenvolvimento Web I.