window.addEventListener('load', () => {
	document.getElementById("btn_login").addEventListener("click", async (event) => {
		document.getElementById('message').innerHTML = "";
		const connectionModule = await import('./connection.js');
		const connection = new connectionModule.default();
		connection.connect(document.getElementById('input_username').value, document.getElementById('input_password').value);
	});
});