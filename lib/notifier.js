'use strict';

const Promise = require('bluebird');
const request = require('request');
const Links = require('ournet.links');
const Data = require('./data');
const moment = require('moment');
const Locals = require('./locals.json');
const logger = require('./logger');

function sendNotification(apiKey, appId, notification) {

	const body = {
		app_id: appId,
		filters: [
			{ field: 'last_session', relation: '>', value: 12 },
			{ operator: 'AND' },
			{ field: 'tag', key: 'zodiac-sign', relation: '=', value: notification.signId }
		],

		contents: {},
		headings: {},
		url: notification.url,
		// chrome_web_icon: '',
		// in seconds
		ttl: 60 * 60 * 12
	};

	body.contents.en =
		body.contents[notification.lang] = notification.content;
	body.headings.en =
		body.headings[notification.lang] = notification.title;

	// console.log('sending body', body);

	return new Promise(function(resolve, reject) {
		request({
			uri: 'https://onesignal.com/api/v1/notifications',
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + apiKey
			},
			json: true,
			body: body
		}, function(error, req, rBody) {
			if (error) {
				return reject(error);
			}
			resolve(rBody);
		});
	});
}

exports.send = function(apiKey, appId, country, lang) {

	const links = Links.country(country, lang);
	const host = 'https://' + links.horoscope.host;
	const locals = Locals[lang];

	const currentDate = moment().locale(lang);
	const currentDayPeriod = 'D' + currentDate.format('YYYYMMDD');

	return Data.get({
			reports: ['horoscopeReports', {
				where: JSON.stringify({ lang: lang, period: currentDayPeriod }),
				order: 'sign',
				limit: 20
			}],
			signs: ['horoscopeSignsNames']
		})
		.then(function(data) {
			if (data.errors) {
				return Promise.reject(new Error('OURNET API error'));
			}
			let sumRecipients = 0;
			return Promise.each(data.reports, function(report) {
					// if (report.sign === 12) {
					// 	return null;
					// }
					const sign = data.signs[report.sign][lang];
					const notification = {
						lang: lang,
						url: host + links.horoscope.sign(sign.slug, { utm_source: 'notifier-app', utm_campaign: 'notifications', utm_medium: 'notification' }),
						title: sign.name + ': ' + locals.today_horoscope,
						content: report.text.split(/\n+/g)[0].trim() + '..',
						signId: report.sign
					};

					return sendNotification(apiKey, appId, notification)
						.then(function(result) {
							sumRecipients += result.recipients;
							logger.warn('For sign ' + report.sign + ' sent ' + result.recipients, { sign: report.sign, recipients: result.recipients, errors: result.errors });
						});
				})
				.then(function() {
					logger.warn('Total recipients: ' + sumRecipients);
				});
		});
};
