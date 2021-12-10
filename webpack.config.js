
const path = require('path');

module.exports = {
    entry:{
        index: "./src/web/index.ts"
    },
    output:{
        filename: "[name].js",
        path: path.resolve(__dirname,"dist")
    }
}