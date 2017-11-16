module.exports = {
	plugins: function () { // post css plugins, can be exported to postcss.config.js
		return [
			require('precss'),
			require('autoprefixer')
		];
    }
}