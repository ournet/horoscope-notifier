
require('dotenv').config();

import logger from './logger';
import * as notifier from './notifier';

//--	env
const LANG = process.env.LANG;
if (!LANG || LANG.length !== 2) {
	logger.error('LANG are required');
	throw 'LANG are required';
}

const API_KEY = process.env['MOBILE_ONESIGNAL_API_KEY'];
const APP_ID = process.env['MOBILE_ONESIGNAL_APP_ID'];

//-- validation

if (!API_KEY || !APP_ID || !LANG) {
	logger.error('API_KEY, APP_ID and LANG are required');
	throw 'API_KEY, APP_ID and LANG are required';
}

const IS_TEST = ['true', '1', 'True'].indexOf(process.env.IS_TEST) > -1;

function start() {
	return notifier.send(API_KEY, APP_ID, '', LANG, IS_TEST, 'mobile');
}

logger.warn('start');

start()
	.then(function () {
		logger.warn('end');
	})
	.catch(function (error) {
		logger.error(error);
	});
