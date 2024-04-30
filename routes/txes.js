const express = require('express');
const router = express.Router();
const { FetchData } = require('../utils/fetch');

// Returns all the transactions that went to or from any given address. Delegates the request to Etherscan.
router.get('/', async function(req, res) {
	try {
		const { address, startblock, endblock, page, offset, sort } = req.body;
		const response = await FetchData(process.env.BLOCK_EXPLORER_API_URI + '?module=account&action=txlist'
			+ '&apikey=' + process.env.BLOCK_EXPLORER_API_KEY
			+ '&address=' + address
			+ '&startblock=' + startblock
			+ '&endblock=' + endblock
			+ '&page=' + page
			+ '&offset=' + offset
			+ '&sort=' + sort
		);

		res.send(response)

	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

module.exports = router;
