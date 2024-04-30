const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { CreateStakedEthRouter } = require('./routes/steth');
const { ethers } = require('ethers');
const fs = require('fs');

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_API_URI);
const abi = fs.readFileSync('./abi/steth.json').toString();
const contract = new ethers.Contract(process.env.STAKED_ETH_CONTRACT_ADDRESS, abi, provider);
// A simple solution to get the most recent address that deposited into the stETH pool.
contract.on('Submitted', (sender, amount, referral) => {
	// Saving in memory instead of caching in a database for simplicity.
	contract.recentDepositedAddress = sender;
})
app.set('contract', contract);

app.use('/',  require('./routes/index'));
app.use('/staked-eth', CreateStakedEthRouter(contract));
app.use('/txes',  require('./routes/txes'));

module.exports = app;
