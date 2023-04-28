const ignore_watch = [
	'node_modules',
	'logs',
	'data',
	'.git',
	'config'
];

module.exports = {
	apps: [
		{
			name: 'graphql-pingator',
			script: 'src/entry.js',
			max_memory_restart: process.env.MAX_MEMORY_RESTART || '4096M',
			watch: '.',
			exec_interpreter: 'babel-node',
			ignore_watch,
			error_file: '/dev/null',
			out_file: 'dev/null'
			// 'node_args': '--max-old-space-size=8192'
		}
	
	]
};
