module.exports = {
	apps: [
		{
			name: "taiq-annotation",
			script: "node_modules/next/dist/bin/next",
			args: "start -p 8499",
			watch: false,
		},
	],
};
