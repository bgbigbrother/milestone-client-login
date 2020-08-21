import Config from './config.js';

const url = Config.host + Config.path;
const params = {
	headers: {
		'content-type': 'application/json; charset=UTF-8'
	},
	method: 'POST',
	redirect: 'follow'
}

export default class Request {
    constructor() {
	}
	
	async send(data) {
		params.body = JSON.stringify(data);
		const response = await fetch(url, params);
		return response.json();
	}
};