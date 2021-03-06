/* @flow */

import webpack from 'webpack';

import ModulesManifestPlugin from './plugins/ModulesManifestPlugin';

import { locations, modules, loacalLoaders } from '../index';

export default {
  entry: {
    app: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=${
        locations.hotServerUrl
      }/__webpack_hmr`,
      './app/shell/client/start.dev',
    ],
  },

  output: {
    path: locations.assets,
    publicPath: `${locations.hotServerUrl}${locations.assetsPublicUrl}`,
    filename: `${modules.devFilename}.js`,
    chunkFilename: `${modules.devChunkFilename}.js`,
  },

  context: locations.src,
  devtool: '#cheap-module-eval-source-map',
  resolve: { extensions: ['.js'] },
  resolveLoader: { alias: loacalLoaders },

  module: {
    noParse: modules.minifiedJs,
    rules: [
      {
        test: modules.jsModule,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            forceEnv: 'client:dev',
            cacheDirectory: true,
          },
        },
      },
      {
        test: modules.cssModule,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: modules.devCssModuleClassName,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: modules.cssModule,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: modules.image,
        use: [
          // must be before any other loader
          {
            loader: 'picture-loader',
            options: {
              presets: modules.imagePresets,
            },
          },
          {
            loader: 'url-loader',
            options: {
              limit: modules.assetInlineLimit,
              name: modules.assetFilename,
            },
          },
        ],
      },
      {
        test: modules.animatedGif,
        use: {
          loader: 'file-loader',
          options: {
            name: modules.assetFilename,
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // required to have consistend module ids
    new webpack.HashedModuleIdsPlugin(),
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'WEB_HOSTNAME',
      'GOOGLE_ANALYTICS_ID',
      'FACEBOOK_APP_ID',
    ]),
    new webpack.DefinePlugin({ __DEV__: true }),
    new ModulesManifestPlugin({
      path: locations.assets,
      filename: modules.modulesManifestFilename,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      // NB: `async` doesn't work, b/c this additional chunk must be sent to the client
      //     along w/ rendered post chunk. It might be possible to track it down
      //     in context of specific app, but it doesn't worth it for _this_ app.
      // async: true,
      minChunks: 2,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module =>
        module.context && module.context.indexOf('node_modules') !== -1,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      minimize: false,
      progress: true,
      options: { context: locations.src },
    }),
  ],
};
