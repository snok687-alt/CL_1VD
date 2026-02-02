require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });

const fetch = require('node-fetch');

console.log('TRON API KEY:', process.env.TRONGRID_API_KEY);

const WALLET_ADDRESS = 'TUxW6pYAXygoTQV99dts59BgZEsCF2j4t9';

async function test() {
  const url = `https://api.trongrid.io/v1/accounts/${WALLET_ADDRESS}/transactions/trc20?limit=1`;
  const res = await fetch(url, {
    headers: { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY }
  });
  const data = await res.json();
  console.log(data);
}

test();
