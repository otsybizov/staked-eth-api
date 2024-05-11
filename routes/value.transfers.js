const express = require('express');
const router = express.Router();

// A stub implementation of db engine.
class DbWrapper {
	async getValueTransfers(page, offset, sort, filter) {
		// TODO: implement reading of value transfers from a database.
		return [];
	}
}

const db = new DbWrapper();

// Returns all transfers of value on Ethereum.
router.get('/', async function(req, res) {
	try {
		const { page, offset, sort, filter } = req.body;
		const response = db.getValueTransfers(page, offset, sort, filter);
		res.json(response);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

module.exports = router;
