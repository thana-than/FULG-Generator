const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
    if (env.site == undefined)
        env.site = 'index.js';

    if (env.dist == undefined)
        env.dist = 'dist'

    return {
        entry: './src/' + env.site,
        output: {
            path: path.resolve(__dirname, env.dist),
            filename: '[name].[contenthash].js',
            chunkFilename: '[name].[contenthash].js',
            clean: true,
            publicPath: './'
        },
        resolve: {
            alias: {
                'assets': path.resolve(__dirname, 'src/assets/')
            },
            extensions: ['.js', '.jsx']
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": ["@babel/preset-env", "@babel/preset-react"]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                    exclude: /\.module\.css$/
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                modules: true
                            }
                        }
                    ],
                    include: /\.module\.css$/
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[path][name].[contenthash].[ext]',
                                context: 'src'
                            }
                        }
                    ]
                },
                {
                    test: /\.(html|txt)$/,
                    use: 'raw-loader'
                },
                {
                    test: /\.json$/,
                    type: 'json'
                }
            ]
        },
        devServer: {
            static: {
                directory: './dist'
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.TESTMODE': JSON.stringify(process.env.TESTMODE),
                'process.env.TWITCH': JSON.stringify(process.env.TWITCH),
                'process.env.TWITCH_BUILD_TYPE': JSON.stringify(process.env.TWITCH_BUILD_TYPE)
            }),
            new HtmlWebpackPlugin({
                template: './src/index.html',
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/assets', to: 'assets' },
                    { from: 'src/electronApp.js', to: 'electronApp.js' }
                ]
            })
        ],
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        }
    }
};