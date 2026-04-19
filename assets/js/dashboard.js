// const productsWidget = document.querySelector('#products_widget');
// const purchaseOrderWidget = document.querySelector('#purhcase_widget');

// window.addEventListener('load', () => {
// 	fetch(`http://localhost:3000/api/client/v1/dashboard`, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
// 		},
// 	})
// 		.then((response) => response.json())
// 		.then((data) => {
// 			UpdateWidgets(data.data);
// 		})
// 		.catch((error) => {
// 			console.error('Error:', error);
// 		});
// });

// const UpdateWidgets = (data = { products: 0 }) => {
// 	productsWidget.textContent = data.products;
// 	purchaseOrderWidget.textContent = data.purchase_orders;
// };

// Sample Stock Data
window.addEventListener('load', () => {
	fetch(`http://localhost:3000/api/client/v1/dashboard/stock`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			// console.log(data.data);
			const stockData = data.data?.stock
			renderStockTable(stockData)
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

function renderStockTable(data) {
	const tbody = document.getElementById('stockTableBody');
	tbody.innerHTML = '';

	data.forEach((item) => {
		let statusHTML = '';
		const row = document.createElement('tr');
		row.className = 'hover:bg-gray-50';
		row.innerHTML = `
          <td class="px-6 py-5 font-medium">${item.name}</td>
          <td class="px-6 py-5 text-left font-semibold ${item.available_stock === 0 ? 'text-red-600' : item.available_stock <= 20 ? 'text-orange-600' : 'text-green-600'}">
            ${item.available_stock}
          </td>
        `;
		tbody.appendChild(row);
	});
}

function filterStock() {
	const searchTerm = document
		.getElementById('stockSearch')
		.value.toLowerCase()
		.trim();

	const filtered = stockData.filter((item) =>
		item.name.toLowerCase().includes(searchTerm),
	);

	renderStockTable(filtered);
}
