'use strict';

require('dotenv').config({ silent: true });

const notifier = require('./notifier');

//--	env
const API_KEY = process.env.ONESIGNAL_API_KEY;
const APP_ID = process.env.ONESIGNAL_APP_ID;
const LANG = process.env.LANG;
const COUNTRY = process.env.COUNTRY;

//-- validation

if (!API_KEY || !APP_ID || !COUNTRY || !LANG) {
	console.error('API_KEY, APP_ID, COUNTRY and LANG are required');
	return;
}

function start() {
	return notifier.send(API_KEY, APP_ID, COUNTRY, LANG);
}


return start()
	.catch(function(error) {
		console.error(error);
	});
