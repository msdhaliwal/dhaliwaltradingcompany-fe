const productsWidget = document.querySelector('#products_widget');
const purchaseOrderWidget = document.querySelector('#purhcase_widget')

window.addEventListener('load', () => {
	fetch(`http://localhost:3000/api/client/v1/dashboard`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data.data);
			UpdateWidgets(data.data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

const UpdateWidgets = (data = { products: 0 }) => {
	productsWidget.textContent = data.products;
	purchaseOrderWidget.textContent = data.purchase_orders
};
