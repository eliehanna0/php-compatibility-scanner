const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      admin: './assets/src/js/admin.js'
    },
    output: {
      path: path.resolve(__dirname, 'assets/dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: [
                      '> 1%',
                      'last 2 versions',
                      'not dead'
                    ]
                  },
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ]
            }
          }
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  outputStyle: isProduction ? 'compressed' : 'expanded'
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    devtool: isProduction ? false : 'source-map',
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendor: false,
          // Bundle all JavaScript into a single file
          bundle: {
            name: 'admin',
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    resolve: {
      extensions: ['.js', '.scss']
    },
    externals: {
      jquery: 'jQuery'
    }
  };
};
