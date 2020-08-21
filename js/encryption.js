import Config from './config.js';
import BigInteger from './lib/BigInteger.js';
import crypto from './lib/aes.js';

const primeKeys = {
    1024: "0xF488FD584E49DBCD20B49DE49107366B336C380D451D0F7C88B31C7C5B2D8EF6F3C923C043F0A55B188D8EBB558CB85D38D334FD7C175743A31D186CDE33212CB52AFF3CE1B1294018118D7C84A70A72D686C40319C807297ACA950CD9969FABD00A509B0246D3083D66A45D419F9C7CBD894B221926BAABA25EC355E92F78C7",
    2048: "0x87A8E61DB4B6663CFFBBD19C651959998CEEF608660DD0F25D2CEED4435E3B00E00DF8F1D61957D4FAF7DF4561B2AA3016C3D91134096FAA3BF4296D830E9A7C209E0C6497517ABD5A8A9D306BCF67ED91F9E6725B4758C022E0B1EF4275BF7B6C5BFC11D45F9088B941F54EB1E59BB8BC39A0BF12307F5C4FDB70C581B23F76B63ACAE1CAA6B7902D52526735488A0EF13C6D9A51BFA4AB3AD8347796524D8EF6A167B5A41825D967E144E5140564251CCACB83E6B486F6B3CA3F7971506026C0B857F689962856DED4010ABD0BE621C3A3960A54E710C375F26375D7014103A4B54330C198AF126116D2276E11715F693877FAD7EF09CADB094AE91E1A1597"
}

export default class Encryption {
    constructor() {
		this.primeKey = BigInt(primeKeys[Config.primeLength]);
		this.generator = BigInteger(2)
		this.randNumber = BigInteger.randBetween("1e66", "1e67");
		const modPow = this.str2byteArray(this.generator.modPow(this.randNumber, this.primeKey).toString(16));
		modPow.push(0);
		this.publicKey = btoa(String.fromCharCode(...new Uint8Array(modPow)));
	}
	
	calculateSharedSecret(key) {
		const serverKey = atob(key);
		let reversedServerKey = '0x';
		
		for(let i = serverKey.length - 1; i >= 0; i--) {
			const hex = serverKey.charCodeAt(i).toString(16);
			reversedServerKey += (hex.length === 2 ? hex : '0' + hex);
		}
		
		const powMod = BigInteger(BigInt(reversedServerKey)).modPow(this.randNumber, this.primeKey).toString(16);
		this.sharedSecret = this.byteArray2str(this.str2byteArray(powMod));
	}
	
	encode(string) {
		const secretString = this.sharedSecret.substring(0,96);

		const key = crypto.enc.Hex.parse(secretString.substring(32,96));
		const iv = crypto.enc.Hex.parse(secretString.substring(0,32));

		const params = { 'iv': iv };

		if (Config.encryptionPadding && crypto.pad[Config.encryptionPadding]) {
			params.padding = crypto.pad[Config.encryptionPadding];
		}

		return crypto.AES.encrypt(string, key, params).ciphertext.toString(crypto.enc.Base64);
	}
	
	str2byteArray(str) {
		if (str.length == 255 || str.length == 511) {
			str = '0' + str;
		}
		var result = [];
		for(var i=0; i<str.length; i=i+2) {
			result.push(parseInt(str.substring(i,i+2),16));
		}

		result.reverse();
		return result;
	}
	
	byteArray2str(byteArray) {
		return Array.from(byteArray, function(byte) {
			return ('0' + (byte & 0xFF).toString(16)).slice(-2);
		}).join('')
	}
};