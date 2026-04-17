window.addEventListener('load', () => {
	const login_token = localStorage.getItem('login_token');
	if (!login_token) {
		window.location.href = 'index.html';
	}
  /* confirm login token valadity, call user details API */
});
