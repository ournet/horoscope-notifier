'use strict';

require('dotenv').config({ silent: true });

const logger = require('./logger');
const notifier = require('./notifier');

//--	env
const LANG = process.env.LANG;
const COUNTRY = process.env.COUNTRY;
if (!COUNTRY || !LANG) {
	logger.error('COUNTRY and LANG are required');
	return;
}
const API_KEY = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_API_KEY'];
const APP_ID = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_APP_ID'];

//-- validation

if (!API_KEY || !APP_ID || !COUNTRY || !LANG) {
	logger.error('API_KEY, APP_ID, COUNTRY and LANG are required');
	return;
}

function start() {
	return notifier.send(API_KEY, APP_ID, COUNTRY, LANG);
}

logger.warn('start');

start()
	.then(function() {
		logger.warn('end');
	})
	.catch(function(error) {
		logger.error(error);
	});
