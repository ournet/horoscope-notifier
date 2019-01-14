
require('dotenv').config();

import logger from './logger';
import * as notifier from './notifier';
import { getCountryByLang } from './utils';

//--	env
const LANG = process.env.LANG;
const COUNTRY = process.env.COUNTRY;
if (!COUNTRY || !LANG || LANG.length !== 2 || COUNTRY.length > 3 || COUNTRY.length < 2) {
	logger.error('COUNTRY and LANG are required');
	throw 'COUNTRY and LANG are required';
}
const API_KEY = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_API_KEY'];
const APP_ID = process.env[COUNTRY.toUpperCase() + '_ONESIGNAL_APP_ID'];

const IS_APP = COUNTRY.trim().toUpperCase() === 'APP';

//-- validation

if (!API_KEY || !APP_ID || !COUNTRY || !LANG) {
	logger.error('API_KEY, APP_ID, COUNTRY and LANG are required');
	throw 'API_KEY, APP_ID, COUNTRY and LANG are required';
}

const IS_TEST = ['true', '1', 'True'].indexOf(process.env.IS_TEST) > -1;

function start() {
	const country = getCountryByLang(LANG);
	// console.log(API_KEY, APP_ID, country, LANG, IS_TEST, utm);
	return notifier.send(API_KEY, APP_ID, country, LANG, IS_TEST, IS_APP ? 'app' : 'web');
}

logger.warn('start');

start()
	.then(function () {
		logger.warn('end');
	})
	.catch(function (error) {
		logger.error(error);
	});
