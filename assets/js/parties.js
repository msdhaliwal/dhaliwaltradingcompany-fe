window.addEventListener('load', () => {
	fetch(`http://localhost:3000/api/client/v1/parties`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('login_token')}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			parties = data?.data?.parties;
			RenderParties();
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

let parties = [];

let editingId = null;
let currentTab = 0;

function RenderParties(filteredParties = parties) {
	const tbody = document.getElementById('partyTableBody');
	tbody.innerHTML = '';
	console.log('filteredParties :>> ', filteredParties);
	filteredParties.forEach((party) => {
		const row = document.createElement('tr');
		row.className = 'hover:bg-gray-50';
		row.innerHTML = `
          <td class="px-6 py-5 font-medium">${party.name}</td>
          <td class="px-6 py-5 text-gray-600">${party.phone}</td>
          <td class="px-6 py-5 text-gray-600">${party.email || '-'}</td>
          <td class="px-6 py-5 font-mono text-gray-600">${party.gstin || '-'}</td>
          <td class="px-6 py-5 text-center">${party.state_code}</td>
          <td class="px-6 py-5">
            <span class="inline-flex px-4 py-1 rounded-full text-xs font-medium
                         ${party.type === 'Customer' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}">
              ${party.type}
            </span>
          </td>
          <td class="px-6 py-5 text-center">
            <button onclick="editParty(${party.id})" 
                    class="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-xl hover:bg-blue-50">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        `;
		tbody.appendChild(row);
	});

	if (filteredParties.length === 0) {
		tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-gray-500">No parties found</td></tr>`;
	}
}

function switchTab(tab) {
	currentTab = tab;
	document.querySelectorAll('.tab-button').forEach((btn, index) => {
		btn.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
		btn.classList.add('text-gray-500');
	});
	const selectedTab = document.querySelector(`#${currentTab}`);
	selectedTab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
	selectedTab.classList.remove('text-gray-500');
	filterParties();
}

function filterParties() {
	const searchTerm = document
		.getElementById('searchInput')
		.value.toLowerCase()
		.trim();

	let filtered = parties;
  if(currentTab != 'all'){
    filtered = filtered.filter((p) => p.type === currentTab);
  }

	if (searchTerm) {
		filtered = filtered.filter(
			(p) =>
				p.name.toLowerCase().includes(searchTerm) ||
				(p.phone && p.phone.includes(searchTerm)) ||
				(p.email && p.email.toLowerCase().includes(searchTerm)) ||
				(p.gstin && p.gstin.toLowerCase().includes(searchTerm)),
		);
	}

	RenderParties(filtered);
}

function showAddPartyModal() {
	editingId = null;
	document.getElementById('modalTitle').textContent = 'Add New Party';
	document.getElementById('saveBtn').textContent = 'Add Party';

	document.getElementById('name').value = '';
	document.getElementById('phone').value = '';
	document.getElementById('email').value = '';
	document.getElementById('gstin').value = '';
	document.getElementById('stateCode').value = '';
	document.getElementById('partyType').value = 'Customer';
	document.getElementById('address').value = '';

	document.getElementById('partyModal').classList.remove('hidden');
	document.getElementById('partyModal').classList.add('flex');
}

function hideModal() {
	const modal = document.getElementById('partyModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

function saveParty() {
	const name = document.getElementById('name').value.trim();
	const phone = document.getElementById('phone').value.trim();
	const email = document.getElementById('email').value.trim();
	const gstin = document.getElementById('gstin').value.trim();
	const stateCode = document.getElementById('stateCode').value.trim();
	const type = document.getElementById('partyType').value;
	const address = document.getElementById('address').value.trim();

	if (!name || !phone) {
		alert('Name and Phone Number are required!');
		return;
	}
	if (type && !['customer', 'supplier'].includes(type)) {
		return;
	}

	if (editingId) {
		const party = parties.find((p) => p.id === editingId);
		if (party) {
			party.name = name;
			party.phone = phone;
			party.email = email;
			party.gstin = gstin;
			party.stateCode = stateCode;
			party.type = type;
			party.address = address;
		}
	} else {
		const newParty = {
			name,
			phone,
			email,
			gstin,
			state_code,
			type,
			address,
		};
		console.log('newParty :>> ', newParty);
		fetch(`http://localhost:3000/api/client/v1/parties`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('login_token')}`,
			},
			body: JSON.stringify(newParty),
		})
			.then(() => {
				filterParties();
				hideModal();
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}

function editParty(id) {
	const party = parties.find((p) => p.id === id);
	if (!party) return;

	editingId = id;
	document.getElementById('modalTitle').textContent = 'Edit Party';
	document.getElementById('saveBtn').textContent = 'Save Changes';

	document.getElementById('name').value = party.name;
	document.getElementById('phone').value = party.phone;
	document.getElementById('email').value = party.email || '';
	document.getElementById('gstin').value = party.gstin || '';
	document.getElementById('stateCode').value = party.stateCode || '';
	document.getElementById('partyType').value = party.type;
	document.getElementById('address').value = party.address || '';

	document.getElementById('partyModal').classList.remove('hidden');
	document.getElementById('partyModal').classList.add('flex');
}
