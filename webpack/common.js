const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { execSync } = require("child_process");

///
var exports = module.exports = {}

var camelToUnderscore = function(str) {
	return str.split(/(?=[A-Z])/).join('_');
}
///


exports.JSONStringifyValues = function(obj) {
	let ret = Object.assign({}, obj);
	for (key in ret)
		ret[key] = JSON.stringify(ret[key])
	return ret;
}

exports.getRules = function(config) {
	return [
		{
			test: /\.(js)$/,
			use: [{
				loader: 'babel-loader',
				options: { presets: [['@babel/env'],['@babel/react']], plugins: ["transform-object-rest-spread"] }
			}]
		},
		{
			test: /\.(css)$/,
			use: ExtractTextPlugin.extract({fallback: 'style-loader', use:'css-loader'})
		},
		{
			test: /\.(scss|sass)$/,
			use: ExtractTextPlugin.extract({fallback: 'style-loader', use:['css-loader', 'sass-loader']}),
		},
		{
			test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?.*)?$/,
			use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[hash].[ext]',
						publicPath: '../',
						outputPath: 'assets/',
					}
			}]
		},
	]
}

exports.convertKeysForHtml = function(obj){
	var ret = {}
	Object.keys(obj).map(function(k){
		ret["__"+camelToUnderscore(k).toUpperCase()+"__"] = obj[k];
	})
	// TODO: remove trailing slash from URLs
	return ret;
}

exports.getVersion = function(){
	try {
		const { stdout } = execSync("git describe --abbrev=7 --tags --dirty=+dirty --always", { encoding: 'utf8' }).toString();
		return stdout;
	} catch (e) {
		console.log("Something has happend when trying to get version");
		console.error(e);
		return "local";
	}
}
