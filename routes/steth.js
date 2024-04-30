const express = require('express');
const { FetchData } = require('../utils/fetch');

function CreateStakedEthRouter(contract) {
	const router = express.Router();

	// Returns the "total pooled ETH" and the "total shares" from the stETH token contract.
	router.get('/total', async function (req, res) {
		try {
			const ether = await contract.getTotalPooledEther();
			const shares = await contract.getTotalShares();
			res.json({
				totalPooledEth: ether.toString(),
				totalShares: shares.toString(),
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500);
		}
	});

	// Returns the most recent address that deposited into the stETH pool.
	router.get('/recent-stake', async function (req, res) {
		if (contract.recentDepositedAddress) {
			res.json({ stakeholder: contract.recentDepositedAddress });
		} else {
			console.error('The most recent address that deposited into the stETH pool is not yet determined');
			res.sendStatus(500);
		}
	});

	// Returns the stETH transfers for an address. Delegates the request to Etherscan.
	router.get('/transfers', async function (req, res) {
		try {
			const { address, startblock, endblock, page, offset, sort } = req.body;
			const addressTopic = address.slice(0, 2) + '000000000000000000000000' + address.slice(2);
			const response = await FetchData(process.env.BLOCK_EXPLORER_API_URI + '?module=logs&action=getLogs'
				+ '&apikey=' + process.env.BLOCK_EXPLORER_API_KEY
				+ '&address=' + process.env.STAKED_ETH_CONTRACT_ADDRESS
				+ '&fromBlock=' + startblock
				+ '&toBlock=' + endblock
				+ '&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
				+ '&topic1=' + addressTopic
				+ '&topic2=' + addressTopic
				+ '&topic1_2_opr=or'
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

	return router;
}

module.exports = { CreateStakedEthRouter };
