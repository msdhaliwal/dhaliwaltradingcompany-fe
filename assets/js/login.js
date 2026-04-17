const loginForm = document.querySelector('#loginForm');
if (loginForm) {
	loginForm.addEventListener('submit', HandleLoginAction);
}

function GetBaseUrl() {
	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1'
	) {
		return 'http://localhost:3000';
	}
	return 'https://your-production-server.com';
}

function HandleLoginAction(e) {
	e.preventDefault();

	const email = document.querySelector('#email')?.value;
	const password = document.querySelector('#password')?.value;

	if (email && password) {
		console.log('sending request');
		fetch(`http://localhost:3000/api/client/v1/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('data :>> ', data);
				const login_token = data?.data?.login_token;
				console.log('login_token :>> ', login_token);
				localStorage.setItem('login_token', login_token);
				window.location.href = 'dashboard.html';
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}
//
