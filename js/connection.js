import Request from './request.js';
import Config from './config.js';
import Encryption from './encryption.js';

export default class Connection {
    constructor() {
		this.request = new Request();
		this.encryption = new Encryption();
	}
	
	connect(username, password) {
		let params = [
			{Name: "PublicKey", Value: this.encryption.publicKey},
			{Name: "PrimeLength", Value: Config.primeLength},
			{Name: "EncryptionPadding", Value: Config.encryptionPadding.toUpperCase()}
		];
		this.sendCommand('Connect', params, (response) => {this.connectCallback(response, username, password)});
	}
	
	connectCallback(response, username, password) {
		this.connectionId = response.outputParameters.ConnectionId;

		if (response.outputParameters.PublicKey) {
			this.encryption.calculateSharedSecret(response.outputParameters.PublicKey)
		}

		this.login(username, password);
	}
	
	login(username, password) {
		let params = [
			{Name: 'Username', Value: this.encryption.encode(username)},
			{Name: 'Password',  Value: this.encryption.encode(password)}
		];

		this.sendCommand('Login', params, this.loginCallback.bind(this))
	}
	
	loginCallback(response) {
		document.getElementById('message').innerHTML = response.Result;
	}
	
	sendCommand(command, params, callback) {
		params = params || [];
		params.push({Name: "ProcessingMessage", Value: "No"});
		const payload = {
			Command: {
				Type: "Request",
				Name: command,
				InputParams: params
			}
		}
		if(this.connectionId) {
			payload.ConnectionId = this.connectionId;
		}
		this.request.send(payload).then(data => {
			let outputParameters = {}
			data.Command.OutputParams.forEach(function(item){
				outputParameters[item.Name] = item.Value;
			});
			data.Command.outputParameters = outputParameters;
			callback && callback(data.Command);
		});
	}
};