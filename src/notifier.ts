'use strict';

import * as request from 'request';
import * as Links from 'ournet.links';
import * as Data from './data';
import * as moment from 'moment';
const Locales = require('../locales.json');
import logger from './logger';

function sendNotification(apiKey: string, appId: string, notification: Notification, isTest: boolean): Promise<SendResult> {

	const body: any = {
		app_id: appId,
		contents: {},
		headings: {},
		url: notification.url,
		// chrome_web_icon: '',
		// in seconds
		ttl: 60 * 60 * 12
	};

	if (isTest) {
		body.included_segments = ['Test Users'];
	} else {
		body.filters = [
			{ field: 'last_session', relation: '>', value: 12 },
			{ operator: 'AND' },
			{ field: 'tag', key: 'zodiac-sign', relation: '=', value: notification.signId }
		];
	}

	body.contents.en =
		body.contents[notification.lang] = notification.content;
	body.headings.en =
		body.headings[notification.lang] = notification.title;

	// console.log('sending body', body);

	return new Promise(function (resolve, reject) {
		request({
			uri: 'https://onesignal.com/api/v1/notifications',
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + apiKey
			},
			json: true,
			body: body
		}, function (error, _req, rBody) {
			if (error) {
				return reject(error);
			}
			resolve(rBody);
		});
	});
}

export async function send(apiKey: string, appId: string, country: string, lang: string, isTest: boolean) {

	const links = Links.sitemap(lang);
	const host = 'https://' + Links.getHost('horoscope', country);
	const locales = Locales[lang];

	const currentDate = moment().locale(lang);
	const currentDayPeriod = 'D' + currentDate.format('YYYYMMDD');

	const data = await Data.get({
		reports: ['horoscopeReports', {
			where: JSON.stringify({ lang: lang, period: currentDayPeriod }),
			order: 'sign',
			limit: 20
		}],
		signs: ['horoscopeSignsNames']
	});

	if (data.errors) {
		throw new Error('OURNET API error');
	}

	let sumRecipients = 0;

	const notifications = (<any[]>data.reports).map<Notification>(report => {
		const sign = data.signs[report.sign][lang];
		const notification: Notification = {
			lang: lang,
			url: host + links.horoscope.sign(sign.slug, { utm_source: 'horo-notifier-app', utm_campaign: 'horo-notifications', utm_medium: 'push-notification' }),
			title: sign.name + ': ' + locales.today_horoscope,
			content: report.text.split(/\n+/g)[0].substr(0, 200).trim() + '...',
			signId: report.sign
		};

		return notification;
	})

	for (let notification of notifications) {
		const result = await sendNotification(apiKey, appId, notification, isTest);
		sumRecipients += result.recipients;
		logger.warn('For sign ' + notification.signId + ' sent ' + result.recipients, { sign: notification.signId, recipients: result.recipients, errors: result.errors });
	}

	logger.warn('Total recipients: ' + sumRecipients);
}

type Notification = {
	lang: string
	url: string
	title: string
	content: string
	signId: number
}

type SendResult = {
	recipients: number
	errors?: any
}
