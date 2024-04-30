const fetch = require('node-fetch');

const FETCH_TIMEOUT = 30000;
const TIMED_OUT_ERROR = 'timed out';

async function FetchData(url) {
	const timer = new Promise((resolve) =>
		setTimeout(() => {
			resolve({ error: TIMED_OUT_ERROR });
		}, FETCH_TIMEOUT)
	);
	const controller = new AbortController();
	const request = new Promise(async (resolve) => {
		try {
			const response = await fetch(url, {
				method: 'GET',
				signal: controller.signal,
			});
			resolve({ response });
		} catch (error) {
			resolve({ error });
		}
	});

	const result = await Promise.race([timer, request]);

	if (result.error) {
		if (result.error === TIMED_OUT_ERROR) {
			controller.abort();
			throw new Error('Timed out requesting ' + url);
		}

		throw result.error;
	}

	if (!result.response.ok) {
		const responseText = await result.response.text();
		throw new Error(responseText);
	}

	return await result.response.text();
}

module.exports = { FetchData };