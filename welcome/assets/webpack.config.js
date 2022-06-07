const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = function (env = {}) {

  return {
    entry: {
      index: "./app/src/index.js"
    },
    output: {
      filename: "[name].min.js",
      path: path.resolve(__dirname, "app", "dist"),
      publicPath: '/'
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "app"),
          serveIndex: true,
          watch: true,
        }
      ],
      compress: true,
      port: 9022,
      host: '192.168.1.58',
      devMiddleware: {
        writeToDisk: true
      }
    },
    optimization: {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin()
      ],
    },
    plugins: [
      /*new MiniCssExtractPlugin({
        filename: "[name].min.css",
        chunkFilename: "[id].min.css",
        ignoreOrder: false,
      })*/
    ],
    resolve: {
      modules: ["node_modules", path.resolve(__dirname, "app", "src")],
      alias: {
        appConfig: path.join(__dirname, 'config', env.production ? 'prod' : 'dev')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: "babel-loader",
              options: {
                comments: false,
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: {
                        browsers: ["last 2 versions"],
                      },
                      debug: false,
                    },
                  ]
                ],
                plugins: [
                  ["@babel/plugin-transform-react-jsx", {
                    "pragma": "h",
                    "pragmaFrag": "Fragment",
                  }]
                ],
              },
            },
          ],
        },
        {
          test: /\.ya?ml$/,
          include: path.resolve(__dirname, "app", "src"),
          loader: "yaml-loader",
        },
        {
          test: /\.html$/i,
          use: "raw-loader",
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: "css-loader",
              options: {
                url: false,
                import: false,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    require("postcss-rtl")(),
                    require("autoprefixer")()
                  ]
                }
              }
            },       
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sassOptions: {
                  outputStyle: "expanded",
                  sourceComments: true,
                },
              },
            }
          ],
        },
      ],
    },
  }
}
