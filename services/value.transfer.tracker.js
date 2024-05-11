const { ethers } = require("ethers");

// Tracks all transfers of value on Ethereum by tracing each transaction in each block in the chain.
// Requires connection to a fully archived node with tracing enabled.
//
// Note: this is a basic prototype with no error handling.
class ValueTransferTracker {
	constructor(provider, db) {
		this.provider = provider;
		this.db = db;
	}

	async start() {
		// Scan past blocks.
		let fromBlock = await this.db.getLastScannedBlock() + 1;
		let toBlock = await this.provider.getBlockNumber();
		for (let blockNum = fromBlock; blockNum <= toBlock && !this.stopped; ++blockNum) {
			const block = await this.provider.getBlock(blockNum);
			await this.scanBlock(block);
		}

		// Scan new blocks.
		let blockNum = toBlock + 1;
		while (!this.stopped) {
			const block = await this.provider.waitForBlock(blockNum);
			await this.scanBlock(block);
		}
	}

	stop() {
		this.stopped = true;
	}

	async scanBlock(block) {
		for (let txHash of block.transactions) {
			const call = await this.provider.send('debug_traceTransaction', [txHash, {tracer: 'callTracer'}]);
			await this.processCall(call, txHash, block.number);
		}

		await this.db.saveLastScannedBlock(block.number);
	}

	async processCall(call, txHash, blockNum) {
		if (this.stopped)
			return;

		let value = ethers.getBigInt(call.value);
		if (value > 0)
			await this.db.saveValueTransfer(call.from, call.to, call.value, txHash, blockNum);

		for (let subCall of call.calls)
			await this.processCall(subCall, txHash, blockNum);
	}
}

// A stub implementation of db engine.
class DbWrapper {
	async getLastScannedBlock() {
		// TODO: implement reading of the last scanned block from a database.
		return 1;
	}

	async saveLastScannedBlock(blockNum) {
		// TODO: implement saving of the last scanned block to a database.
	}

	async saveValueTransfer(from, to, value, blockNum) {
		// TODO: implement saving transfer of value to a database.
	}
}

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_API_URI);
const db = new DbWrapper();
const tracker = new ValueTransferTracker(provider, db);
tracker.start();

process.on('SIGTERM', async () => {
	console.log('SIGTERM signal received.');
	tracker.stop();
});

process.on('SIGINT', async () => {
	console.log('SIGINT signal received.');
	tracker.stop();
});