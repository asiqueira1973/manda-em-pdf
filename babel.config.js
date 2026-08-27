/**
 * Configuração do Babel.
 * `inline-import` embute os arquivos .sql das migrations do Drizzle no bundle —
 * é obrigatório porque não há como rodar migration por CLI dentro do aparelho
 * (seção 7.4 do spec).
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
