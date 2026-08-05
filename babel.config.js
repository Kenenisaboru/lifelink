module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@stores': './src/stores',
            '@services': './src/services',
            '@firebase': './src/firebase',
            '@utils': './src/utils',
            '@types': './src/types',
            '@theme': './src/theme',
            '@navigation': './src/navigation',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
