window.addEventListener('load', () => {
	fetch(`http://localhost:3000/api/client/v1/products`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			products = data?.data?.products;
			RenderProducts();
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		HideModal();
	}
});

/*  */
let products = [];

let editingId = null;
function RenderProducts() {
	const tbody = document.getElementById('productTableBody');
	tbody.innerHTML = '';

	products.forEach((product) => {
		const row = document.createElement('tr');
		row.className = `hover:bg-gray-50 ${!product.active ? 'opacity-60' : ''}`;
		const qty =
			product.quantity > 1000
				? `${parseInt(product.quantity / 1000)}.${product.quantity % 1000} L`
				: `${product.quantity} ml`;
		row.innerHTML = `
      <td class="px-6 py-5 font-medium">${product.name}</td>
      <td class="px-6 py-5 font-medium">${qty}</td>
      <td class="px-6 py-5 font-medium">${product.pieces}</td>
      <td class="px-6 py-5 font-mono text-gray-600">${product.hsn_code}</td>
      <td class="px-6 py-5 font-mono text-gray-600">${product.sku}</td>
      <td class="px-6 py-5">${product.cgst_percent}%</td>
      <td class="px-6 py-5">${product.sgst_percent}%</td>`;
		tbody.appendChild(row);
	});
}

function ShowAddProductModal() {
	editingId = null;
	document.getElementById('modalTitle').textContent = 'Add New Product';
	document.getElementById('saveBtn').textContent = 'Add Product';

	document.getElementById('hsn').value = '';
	document.getElementById('sku').value = '';
	document.getElementById('name').value = '';
	document.getElementById('cgst').value = '9';
	document.getElementById('sgst').value = '9';

	document.getElementById('productModal').classList.remove('hidden');
	document.getElementById('productModal').classList.add('flex');
}

function HideModal() {
	const modal = document.getElementById('productModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

function SaveProduct() {
	const name = document.getElementById('name').value.trim();
	const quantity = document.getElementById('quantity').value.trim();
	const pieces = document.getElementById('pieces').value.trim();
	const hsn_code = document.getElementById('hsn').value.trim();
	const sku = document.getElementById('sku').value.trim();
	const cgst_percent = parseFloat(document.getElementById('cgst').value) || 0;
	const sgst_percent = parseFloat(document.getElementById('sgst').value) || 0;

	if (!name || !sku) {
		alert('Product Name and SKU are required!');
		return;
	}

	if (editingId) {
		// Update existing product
		const product = products.find((p) => p.id === editingId);
		if (product) {
			product.hsn = hsn;
			product.sku = sku;
			product.name = name;
			product.stock = stock;
			product.cgst = cgst;
			product.sgst = sgst;
			product.createdBy = createdBy;
		}
	} else {
		const product = {
			name,
			quantity,
			pieces,
			hsn_code,
			sku,
			cgst_percent,
			sgst_percent,
		};
		fetch(`http://localhost:3000/api/client/v1/products`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('login_token')}`,
			},
			body: JSON.stringify(product),
		})
			.then((response) => response.json())
			.then((data) => {
				products.unshift(newProduct);
				RenderProducts();
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	HideModal();
	RenderProducts();
}

function EditProduct(id) {
	const product = products.find((p) => p.id === id);
	if (!product) return;

	editingId = id;
	document.getElementById('modalTitle').textContent = 'Edit Product';
	document.getElementById('saveBtn').textContent = 'Save Changes';

	document.getElementById('hsn').value = product.hsn;
	document.getElementById('sku').value = product.sku;
	document.getElementById('name').value = product.name;
	document.getElementById('stock').value = product.stock;
	document.getElementById('cgst').value = product.cgst;
	document.getElementById('sgst').value = product.sgst;
	document.getElementById('createdBy').value = product.createdBy;

	document.getElementById('productModal').classList.remove('hidden');
	document.getElementById('productModal').classList.add('flex');
}

function ToggleProductStatus(id, isActive) {
	const product = products.find((p) => p.id === id);
	if (product) {
		product.active = isActive;
		RenderProducts();
	}
}
