'use strict';

import * as request from 'request';
import * as Links from 'ournet.links';
import * as moment from 'moment';
const Locales = require('../locales.json');
import logger from './logger';
import { createQueryApiClient, executeApiClient } from './data';
import { HoroscopeReport, HoroscopeReportStringFields } from '@ournet/api-client';
import { HoroscopesHelper, HoroscopeSign } from '@ournet/horoscopes-domain';

function sendNotification(apiKey: string, appId: string, notification: Notification, isTest: boolean): Promise<SendResult> {

	const body: any = {
		app_id: appId,
		contents: {},
		headings: {},
		url: notification.url,
		android_accent_color: 'ffc84697',
		// chrome_web_icon: '',
		// in seconds
		ttl: 60 * 60 * 12
	};

	if (isTest) {
		body.included_segments = ['Test Users'];
	} else {
		body.filters = notification.filters;
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

export type TargetPlatform = 'app' | 'web';

export async function send(apiKey: string, appId: string, country: string, lang: string, isTest: boolean, platform: TargetPlatform) {

	const links = Links.sitemap(lang);
	const host = 'https://' + Links.getHost('horoscope', country);
	const locales = Locales[lang];

	const currentDate = moment().locale(lang);
	const currentDayPeriod = 'D' + currentDate.format('YYYYMMDD');

	const api = createQueryApiClient<{ reports: HoroscopeReport[] }>();

	const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
		.map(sign => HoroscopesHelper.createReportId(currentDayPeriod, lang, sign as HoroscopeSign));

	api.horoscopesReportsByIds('reports', { fields: HoroscopeReportStringFields }, { ids });

	const data = await executeApiClient(api);

	let sumRecipients = 0;

	const utmParams = { utm_source: 'horo-notifier-app', utm_campaign: `${platform}-horo-notification`, utm_medium: 'push-notification' };

	const notifications = (data.reports).map<Notification>(report => {
		const filters = [
			{ field: 'last_session', relation: '>', value: 12 },
			{ operator: 'AND' },
			{ field: 'tag', key: 'zodiac-sign', relation: '=', value: report.sign.toString() },
		];

		if (platform === 'app') {
			filters.push({ operator: 'AND' });
			filters.push({ field: 'tag', key: 'lang', relation: '=', value: lang });
		}

		const sign = HoroscopesHelper.getSignName(report.sign as HoroscopeSign, lang);
		const notification: Notification = {
			lang: lang,
			url: host + links.horoscope.sign(sign.slug, utmParams),
			title: sign.name + ': ' + locales.today_horoscope,
			content: report.text.split(/\n+/g)[0].substr(0, 200).trim() + '...',
			signId: report.sign,
			filters,
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
	filters: any[]
}

type SendResult = {
	recipients: number
	errors?: any
}
