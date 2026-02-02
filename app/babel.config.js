module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@types': './src/types',
            '@store': './src/store',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};
