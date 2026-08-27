const { withGradleProperties } = require('expo/config-plugins');

/**
 * Config plugin: garante as propriedades de Gradle que o build Android
 * precisa nesta máquina, e que de outra forma se perderiam a cada
 * `expo prebuild` (que regenera a pasta android/ inteira).
 *
 * Duas propriedades, e as duas têm motivo (ver DECISOES.md):
 *
 * 1. `org.gradle.java.installations.paths` — o `@react-native/gradle-plugin`
 *    compila com languageVersion 17. Sem apontar os JDKs do Homebrew, o
 *    Gradle não acha um JDK 17 e o build falha antes de começar.
 *
 * 2. `org.gradle.java.installations.auto-download=false` — o plugin que
 *    baixaria o JDK sozinho (foojay-resolver) é incompatível com o Gradle 9
 *    que o Expo SDK 55 usa. Desligado, o Gradle usa o JDK local.
 */
const JDKS = [
  '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home',
  '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
].join(',');

const PROPRIEDADES = [
  ['org.gradle.java.installations.auto-download', 'false'],
  ['org.gradle.java.installations.paths', JDKS],
];

module.exports = function withPropriedadesGradle(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of PROPRIEDADES) {
      const existente = cfg.modResults.find((i) => i.type === 'property' && i.key === key);
      if (existente) existente.value = value;
      else cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
};
