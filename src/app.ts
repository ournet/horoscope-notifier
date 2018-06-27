
require('dotenv').config({ silent: true });

import logger from './logger';
import * as notifier from './notifier';

//--	env
const LANG = process.env.LANG;
const COUNTRY = process.env.COUNTRY;
if (!COUNTRY || !LANG) {
	logger.error('COUNTRY and LANG are required');
	throw 'COUNTRY and LANG are required';
}
const API_KEY = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_API_KEY'];
const APP_ID = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_APP_ID'];

//-- validation

if (!API_KEY || !APP_ID || !COUNTRY || !LANG) {
	logger.error('API_KEY, APP_ID, COUNTRY and LANG are required');
	throw 'API_KEY, APP_ID, COUNTRY and LANG are required';
}

const IS_TEST = ['true', '1', 'True'].indexOf(process.env.IS_TEST) > -1;

function start() {
	return notifier.send(API_KEY, APP_ID, COUNTRY, LANG, IS_TEST);
}

logger.warn('start');

start()
	.then(function () {
		logger.warn('end');
	})
	.catch(function (error) {
		logger.error(error);
	});
