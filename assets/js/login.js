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
		fetch(`http://localhost:3000/api/client/v1/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		})
			.then((response) => response.json())
			.then((data) => {
				const { login_token, employee } = data?.data ?? {};
				localStorage.setItem('login_token', login_token);
				localStorage.setItem('employee', JSON.stringify(employee));
				window.location.href = 'dashboard.html';
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}
//
