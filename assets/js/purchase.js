let suppliers = [],
	products = [],
	purchaseOrders = [];

window.addEventListener('load', () => {
	fetch(`http://localhost:3000/api/client/v1/purchase`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			suppliers = data?.data?.parties;
			purchaseOrders = data?.data?.purchase_orders;
			products = data?.data?.products.map((product) => ({
				...product,
				cgst_percent: Number(product.cgst_percent) || 0,
				sgst_percent: Number(product.sgst_percent) || 0,
			}));
			renderPOList();
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

function createNewPO() {
	currentPOItems = [];
	document.getElementById('modalTitle').textContent = 'New Purchase Order';
	document.getElementById('orderDate').value = new Date()
		.toISOString()
		.split('T')[0];

	const supplierSelect = document.getElementById('supplierSelect');
	supplierSelect.innerHTML = suppliers
		.map((s) => `<option value="${s.id}">${s.name}</option>`)
		.join('');

	renderItemsTable();
	document.getElementById('poModal').classList.remove('hidden');
	document.getElementById('poModal').classList.add('flex');
}

function addItemRow() {
	currentPOItems.push({
		product_id: products[0].id,
		quantity: 1,
		unit_price: 0,
		total_price: 0,
		cgst_amount: 0,
		sgst_amount: 0,
		cgst_percent: Number(products[0].cgst_percent),
		sgst_percent: Number(products[0].sgst_percent),
	});
	renderItemsTable();
}

function renderItemsTable() {
	const tbody = document.getElementById('itemsTableBody');
	tbody.innerHTML = '';
	currentPOItems.forEach((item, index) => {
		const product = products.find((p) => p.id === item.product_id) || {};

		const total_price = parseFloat(item.total_price) || 0;
		const qty = parseFloat(item.quantity) || 0;

		let unit_price = 0;
		let cgstAmt = 0;
		let sgstAmt = 0;

		if (qty > 0 && total_price > 0) {
			const gstRate = (item.cgst_percent || 0) + (item.sgst_percent || 0);
			unit_price = total_price / (1 + gstRate / 100);
			const baseAmount = unit_price * qty;
			cgstAmt = (baseAmount * (item.cgst_percent || 0)) / 100;
			sgstAmt = (baseAmount * (item.sgst_percent || 0)) / 100;
		}
		const row = document.createElement('tr');
		row.className = 'hover:bg-gray-50';
		row.innerHTML = `
      <td class="px-6 py-4">
        <select onchange="updateItem(${index}, 'product_id', this.value)" class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500">
          ${products.map((p) => `<option value="${p.id}" ${p.id === item.product_id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
      </td>
      <td class="px-6 py-4">
        <input type="number" min="1" value="${item.quantity}" onchange="updateItem(${index}, 'quantity', this.value)" class="w-24 text-right border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500">
      </td>
      <td class="px-6 py-4 text-right font-medium text-gray-600">₹${unit_price.toFixed(2)}</td>
      <td class="px-6 py-4">
        <input type="number" step="0.01" value="${total_price || ''}" placeholder="0.00" onchange="updateFromtotal_price(${index}, this.value)"  class="w-36 text-right border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-semibold">
      </td>
      <td class="px-6 py-4 text-center font-medium">${item.cgst_percent}%</td>
      <td class="px-6 py-4 text-center font-medium">${item.sgst_percent}%</td>
      <td class="px-6 py-4 text-right text-orange-600">₹${cgstAmt.toFixed(2)}</td>
      <td class="px-6 py-4 text-right text-orange-600">₹${sgstAmt.toFixed(2)}</td>
      <td class="px-6 py-4">
        <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700 text-xl">×</button>
      </td>
        `;
		tbody.appendChild(row);
	});

	calculateTotals();
}

function updateFromtotal_price(index, value) {
	currentPOItems[index].total_price = parseFloat(value) || 0;
	renderItemsTable();
}

function updateItem(index, field, value) {
	const item = currentPOItems[index];

	if (field === 'product_id') {
		item.product_id = parseInt(value);
		const prod = products.find((p) => p.id == value);
		if (prod) {
			item.cgst_percent = prod.cgst_percent;
			item.sgst_percent = prod.sgst_percent;
		}
	} else if (field === 'quantity') {
		item.quantity = parseFloat(value) || 0;
	}

	renderItemsTable();
}

function removeItem(index) {
	currentPOItems.splice(index, 1);
	renderItemsTable();
}

function calculateTotals() {
	let subtotal = 0,
		totalCgst = 0,
		totalSgst = 0;

	currentPOItems.forEach((item) => {
		const total_price = parseFloat(item.total_price) || 0;
		const qty = parseFloat(item.quantity) || 0;

		if (qty > 0 && total_price > 0) {
			const gstRate = (item.cgst_percent || 0) + (item.sgst_percent || 0);
			const unit_price = total_price / (1 + gstRate / 100);
			const baseAmount = unit_price * qty;

			const cgst_percent = (baseAmount * (item.cgst_percent || 0)) / 100;
			const sgst_percent = (baseAmount * (item.sgst_percent || 0)) / 100;

			subtotal += baseAmount;
			totalCgst += cgst_percent;
			totalSgst += sgst_percent;
		}
	});

	const grandTotal = subtotal + totalCgst + totalSgst;

	document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
	document.getElementById('totalCgst').textContent = `₹${totalCgst.toFixed(2)}`;
	document.getElementById('totalSgst').textContent = `₹${totalSgst.toFixed(2)}`;
	document.getElementById('grandTotal').textContent =
		`₹${grandTotal.toFixed(2)}`;
}

async function savePurchaseOrder() {
	console.clear();
	const item_rows = document.querySelectorAll('#itemsTableBody > tr');
	if (item_rows.length === 0) {
		alert('Please add at least one item.');
		return;
	}
	const items = [];
	item_rows.forEach((row) => {
		const cgst_percent_str = row.children[4].textContent.replace('%', '');
		const sgst_percent_str = row.children[5].textContent.replace('%', '');
		const cgst_amount_str = row.children[6].textContent.replace('₹', '');
		const sgst_amount_str = row.children[7].textContent.replace('₹', '');
		const unit_amount = Number(row.children[2].textContent.replace('₹', ''));
		const amount = Number(row.children[3].children[0].value);
		const quantity = Number(row.children[1].children[0].value);

		items.push({
			product_id: Number(row.children[0].children[0].value),
			quantity,
			unit_amount,
			amount,
			total_amount: quantity * amount,
			cgst_percent: parseFloat(cgst_percent_str),
			sgst_percent: parseFloat(sgst_percent_str),
			cgst_amount: parseFloat(cgst_amount_str),
			sgst_amount: parseFloat(sgst_amount_str),
		});
	});
	const purchase_order = {
		supplier_id: parseInt(document.getElementById('supplierSelect').value),
		order_date: document.getElementById('orderDate').value,
		share: Number(document.getElementById('sharePercent').value),
		invoice_no: document.getElementById('invoiceNo').value,
		cgst_amount: items.reduce((acc, item) => acc + item.cgst_amount, 0),
		sgst_amount: items.reduce((acc, item) => acc + item.sgst_amount, 0),
		items,
	};
	await SavePurchaseOrderApi(purchase_order);
	closePOModal();
}

function renderPOList() {
	const tbody = document.getElementById('poTableBody');
	tbody.innerHTML =
		purchaseOrders
			.map(
				(po) => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-5 font-mono">#PO${String(po.id).slice(-6)}</td>
          <td class="px-6 py-5">${po.supplier_name}</td>
          <td class="px-6 py-5">${new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(po.order_date))}</td>
          <td class="px-6 py-5 text-right font-semibold">₹${po.total_amount.toLocaleString('en-IN')}</td>
          <td class="px-6 py-5 text-center">
            <span class="px-4 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">${po.status}</span>
          </td>
          <td class="px-6 py-5 text-center">
            <button onclick="viewPO(${po.id})" class="text-blue-600 hover:text-blue-700 px-3 py-1">View</button>
          </td>
        </tr>`,
			)
			.join('') ||
		'<tr><td colspan="6" class="text-center py-12 text-gray-400">No purchase orders yet</td></tr>';
}

function viewPO(id) {
	alert(`Viewing Purchase Order #PO${String(id).slice(-6)}`);
}

function closePOModal() {
	document.getElementById('poModal').classList.add('hidden');
	document.getElementById('poModal').classList.remove('flex');
}

async function SavePurchaseOrderApi(data) {
	try {
		await fetch(`http://localhost:3000/api/client/v1/purchase`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('login_token')}`,
			},
			body: JSON.stringify(data),
		});
		return true;
	} catch (error) {
		return false;
	}
}
