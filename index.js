require('dotenv').config();
const app = require('./app');
const http = require('http');

const port = process.env.PORT || '3000';
const server = http.createServer(app);
server.listen(port);
server.on('listening', () => {
	const address = server.address();
	console.log('Listening on port', address.port);
});

async function closeServer(signal) {
	console.log(signal, 'signal received.');

	server.close((err) => {
		console.error('Error closing server', err);
	});

	await app.get('contract').removeAllListeners();

	process.exit(0);
}

process.on('SIGTERM', async () => {
	await closeServer('SIGTERM');
});

process.on('SIGINT', async () => {
	await closeServer('SIGINT');
});
