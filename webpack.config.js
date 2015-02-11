module.exports = {
    entry: {
        app: ['webpack/hot/dev-server', './app/main.jsx']
    },
    output: {
        publicPath: 'http://localhost:8090/assets',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?harmony'
            },
            { test: /\.js$/, exclude: /node_modules/, loader: '6to5-loader'}
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}
