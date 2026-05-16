// --- Global State ---
let authToken = null;
let currentUser = null;

// --- API Client ---
const api = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    
    try {
        const res = await fetch(`/api/v1${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
        return await res.json();
    } catch (err) {
        showToast('Network connection error', 'error');
        throw err;
    }
};

// --- UI Utilities ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showView(viewId) {
    document.querySelectorAll('.view-screen').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    document.getElementById(viewId).classList.add('active');
}

function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`[data-target="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
}

// --- Auth System ---
async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    
    const res = await api('/auth/login', 'POST', { username: u, password: p });
    if (res.success) {
        authToken = res.data.token;
        currentUser = res.data;
        showToast(`Welcome back, ${currentUser.username}!`);
        routeUser();
    } else {
        showToast(res.message, 'error');
    }
}

function logout() {
    authToken = null; currentUser = null;
    posCart = []; storeCart = []; pendingOrderId = null;
    showView('login-view');
    showToast('Logged out successfully');
}

function routeUser() {
    const role = currentUser.role.toLowerCase();
    
    if (role === 'customer') {
        document.getElementById('store-user').textContent = `Hi, ${currentUser.fullName || currentUser.username}`;
        showView('store-view');
        loadStoreProducts();
    } else {
        // Setup SaaS layout
        document.getElementById('nav-user-name').textContent = currentUser.fullName || currentUser.username;
        document.getElementById('nav-user-role').textContent = role;
        showView('app-view');
        
        const nav = document.getElementById('sidebar-nav');
        if (role === 'manager') {
            nav.innerHTML = `
                <button class="nav-item active" data-target="mgr-dashboard" onclick="loadDashboard()"><i class="fa-solid fa-chart-pie w-6"></i> Overview</button>
                <button class="nav-item" data-target="mgr-inventory" onclick="loadInventory()"><i class="fa-solid fa-boxes-stacked w-6"></i> Inventory</button>
                <button class="nav-item" data-target="mgr-staff" onclick="loadStaff()"><i class="fa-solid fa-users w-6"></i> Staff</button>
                <button class="nav-item" data-target="mgr-promotions" onclick="showPage('mgr-promotions'); document.getElementById('page-title').textContent = 'Promotions'"><i class="fa-solid fa-tag w-6"></i> Promotions</button>
            `;
            loadDashboard();
        } else if (role === 'cashier') {
            nav.innerHTML = `
                <button class="nav-item active" data-target="pos-terminal" onclick="showPage('pos-terminal'); clearPOS()"><i class="fa-solid fa-cash-register w-6"></i> POS Terminal</button>
            `;
            showPage('pos-terminal');
            clearPOS();
        } else if (role === 'supplier') {
            nav.innerHTML = `
                <button class="nav-item active" data-target="supplier-portal" onclick="showPage('supplier-portal')"><i class="fa-solid fa-truck-field w-6"></i> Deliveries</button>
            `;
            showPage('supplier-portal');
        }
    }
}

// ==========================================
// STOREFRONT (CUSTOMER)
// ==========================================
let storeProducts = [];
let storeCart = [];
let currentCategory = 'All';

async function loadStoreProducts() {
    const search = document.getElementById('store-search') ? document.getElementById('store-search').value : '';
    const res = await api(`/inventory?category=${currentCategory}&search=${search}`);
    if (res.success) {
        storeProducts = res.data;
        const categoryColors = {
            'PRODUCE': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'DAIRY': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            'BAKERY': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'MEAT': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'BEVERAGES': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            'SNACKS': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
        };

        document.getElementById('store-grid').innerHTML = storeProducts.map(p => {
            const bg = categoryColors[p.category.toUpperCase()] || 'linear-gradient(135deg, #475569 0%, #334155 100%)';
            return `
            <div class="product-card" style="padding: 0; overflow: hidden;">
                <div style="height: 140px; background: ${bg}; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-basket-shopping text-white text-5xl opacity-30"></i>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <span class="text-xs font-bold text-accent mb-2 uppercase tracking-wider">${p.category}</span>
                    <h3 class="text-lg font-bold text-white mb-4 flex-1">${p.name}</h3>
                    <div class="flex justify-between align-center">
                        <span class="text-xl font-bold text-white">$${p.price.toFixed(2)}</span>
                        <button onclick="addToStoreCart('${p.id}')" class="btn btn-primary btn-sm"><i class="fa-solid fa-cart-plus"></i> Add</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}

function filterStore(cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-chip').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === cat);
    });
    loadStoreProducts();
}

function toggleStoreCart() {
    document.getElementById('store-cart-drawer').classList.toggle('open');
    document.getElementById('drawer-overlay').classList.toggle('hidden');
}

function addToStoreCart(id) {
    const p = storeProducts.find(x => x.id === id);
    const item = storeCart.find(x => x.id === id);
    if (item) {
        if (item.qty < p.stockLevel) item.qty++;
        else return showToast('Not enough stock', 'error');
    } else {
        storeCart.push({ id, name: p.name, price: p.price, qty: 1 });
    }
    showToast(`Added ${p.name} to cart`);
    renderStoreCart();
}

function renderStoreCart() {
    document.getElementById('store-cart-badge').textContent = storeCart.reduce((s, i) => s + i.qty, 0);
    const total = storeCart.reduce((s, i) => s + (i.price * i.qty), 0);
    document.getElementById('store-cart-total').textContent = `$${total.toFixed(2)}`;
    
    document.getElementById('store-cart-items').innerHTML = storeCart.map((i, idx) => `
        <div class="flex justify-between align-center mb-4 pb-4 border-b border-divider">
            <div>
                <h4 class="font-semibold text-white">${i.name}</h4>
                <span class="text-sm text-secondary">$${i.price.toFixed(2)} x ${i.qty}</span>
            </div>
            <button onclick="storeCart.splice(${idx}, 1); renderStoreCart()" class="icon-btn text-danger"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

async function submitStoreOrder() {
    if (storeCart.length === 0) return showToast('Cart is empty', 'error');
    
    const payload = {
        orderDetails: { items: storeCart.map(i => ({ productId: i.id, quantity: i.qty })) }
    };
    
    const res = await api('/orders/submit', 'POST', payload);
    if (res.success) {
        showToast('Order sent to cashier for checkout!', 'success');
        storeCart = [];
        renderStoreCart();
        toggleStoreCart();
        loadStoreProducts();
        loadStoreOrders();
    } else showToast(res.message, 'error');
}

async function loadStoreOrders() {
    document.getElementById('store-orders').classList.remove('hidden');
    const res = await api('/orders/history');
    if (res.success) {
        document.getElementById('store-orders-list').innerHTML = res.data.map(o => `
            <tr>
                <td class="font-medium text-white">#${o.id.split('-')[0]}</td>
                <td class="text-secondary">${new Date(o.createdAt).toLocaleDateString()}</td>
                <td><span class="badge ${o.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                <td class="font-bold text-white">$${o.totalAmount.toFixed(2)}</td>
            </tr>
        `).join('');
    }
}


// ==========================================
// POS TERMINAL (CASHIER)
// ==========================================
let posCart = [];
let pendingOrderId = null;

async function addPOSItem() {
    const input = document.getElementById('pos-barcode');
    const barcode = input.value.trim();
    if (!barcode) return;
    
    const res = await api('/cashier/scan', 'POST', { barcodes: [barcode] });
    if (res.success && res.data.items.length) {
        const item = res.data.items[0];
        const existing = posCart.find(i => i.productId === item.productId);
        if (existing) existing.quantity++;
        else posCart.push({ ...item, quantity: 1 });
        
        input.value = '';
        renderPOS();
    } else showToast('Barcode not found', 'error');
}

async function loadPendingOrders() {
    const res = await api('/orders/pending');
    if (res.success) {
        const panel = document.getElementById('pos-pending-panel');
        const list = document.getElementById('pos-pending-list');
        
        if (res.data.length === 0) return showToast('No online orders pending', 'error');
        
        panel.classList.remove('hidden');
        list.innerHTML = res.data.map(o => `
            <div class="flex justify-between align-center p-3 bg-base rounded border border-divider hover:border-primary transition">
                <div>
                    <strong class="text-white">#${o.id.split('-')[0]}</strong> <span class="text-secondary ml-2">$${o.totalAmount.toFixed(2)}</span>
                    <div class="text-xs text-secondary mt-1">${o.items.length} items • ${o.customer?.fullName || 'Guest'}</div>
                </div>
                <button class="btn btn-secondary text-sm py-1" onclick='selectPendingOrder(${JSON.stringify(o)})'>Load</button>
            </div>
        `).join('');
    }
}

function selectPendingOrder(order) {
    pendingOrderId = order.id;
    posCart = order.items.map(i => ({
        productId: i.productId, barcode: i.product.barcode, name: i.product.name,
        effectivePrice: i.priceAt, quantity: i.quantity
    }));
    document.getElementById('pos-pending-panel').classList.add('hidden');
    renderPOS();
    showToast(`Loaded Order #${order.id.split('-')[0]}`);
}

function renderPOS() {
    const total = posCart.reduce((s, i) => s + (i.effectivePrice * i.quantity), 0);
    document.getElementById('pos-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('pos-total').textContent = `$${total.toFixed(2)}`;
    
    document.getElementById('pos-cart-items').innerHTML = posCart.map((i, idx) => `
        <tr>
            <td><div class="font-medium text-white">${i.name}</div><div class="text-xs text-secondary">${i.barcode}</div></td>
            <td>$${i.effectivePrice.toFixed(2)}</td>
            <td><input type="number" min="1" value="${i.quantity}" onchange="posCart[${idx}].quantity=parseInt(this.value); renderPOS()" class="w-16 bg-transparent border border-divider text-white p-1 rounded text-center outline-none"></td>
            <td class="font-medium text-white">$${(i.effectivePrice * i.quantity).toFixed(2)}</td>
            <td><button onclick="posCart.splice(${idx}, 1); renderPOS()" class="icon-btn text-danger"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function clearPOS() {
    posCart = []; pendingOrderId = null;
    document.getElementById('pos-barcode').value = '';
    renderPOS();
}

async function processPOS() {
    if (!posCart.length) return showToast('Cart is empty', 'error');
    const method = document.querySelector('input[name="pay_method"]:checked').value;
    const total = posCart.reduce((s, i) => s + (i.effectivePrice * i.quantity), 0);
    
    const payload = {
        cartData: { items: posCart, amountTotal: total },
        paymentDetails: { method, amount: total }
    };
    if (pendingOrderId) payload.orderId = pendingOrderId;
    
    const res = await api('/cashier/checkout', 'POST', payload);
    if (res.success) {
        showToast('Payment successful!');
        
        // Show Receipt
        const r = res.data.receipt;
        document.getElementById('receipt-date').textContent = new Date(r.date).toLocaleString();
        document.getElementById('receipt-total').textContent = `$${r.totalPaid.toFixed(2)}`;
        document.getElementById('receipt-method').textContent = r.paymentMethod;
        
        document.getElementById('receipt-items').innerHTML = r.items.map(i => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>${i.quantity || 1}x ${i.name || 'Item'}</span>
                <span>$${((i.effectivePrice || 0) * (i.quantity || 1)).toFixed(2)}</span>
            </div>
        `).join('');
        
        document.getElementById('receipt-modal').classList.remove('hidden');
        clearPOS();
    } else showToast(res.message, 'error');
}

// ==========================================
// MANAGER DASHBOARD
// ==========================================
let revenueChartInstance = null;

async function loadDashboard() {
    showPage('mgr-dashboard');
    document.getElementById('page-title').textContent = "Business Overview";
    
    const res = await api('/sales/report');
    if (res.success) {
        document.getElementById('stat-revenue').textContent = `$${res.data.netRevenue.toFixed(2)}`;
        document.getElementById('stat-transactions').textContent = res.data.transactionCount;
        
        const txs = res.data.transactions;
        document.getElementById('mgr-recent-orders').innerHTML = txs.slice(0, 10).map(t => `
            <tr>
                <td class="font-medium text-white">#${t.orderId.split('-')[0]}</td>
                <td class="text-secondary">${new Date(t.date).toLocaleString()}</td>
                <td><span class="badge ${t.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
                <td class="font-bold text-white">$${t.amount.toFixed(2)}</td>
            </tr>
        `).join('');
        
        // Render Chart
        const ctx = document.getElementById('revenueChart').getContext('2d');
        if (revenueChartInstance) revenueChartInstance.destroy();
        
        // Group transactions by date
        const grouped = {};
        [...txs].reverse().forEach(t => {
            const date = new Date(t.date).toLocaleDateString();
            grouped[date] = (grouped[date] || 0) + t.amount;
        });
        
        const labels = Object.keys(grouped);
        const data = Object.values(grouped);
        
        if (labels.length === 0) {
            labels.push(new Date().toLocaleDateString());
            data.push(0);
        }
        
        revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Daily Revenue ($)',
                    data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8', callback: (v) => '$' + v } }
                }
            }
        });
    }
    
    // Quick metric for products
    const pRes = await api('/inventory');
    if (pRes.success) document.getElementById('stat-products').textContent = pRes.data.length;
}

function exportToCSV() {
    const rows = [];
    const table = document.querySelector('#mgr-recent-orders');
    const headers = ['Order ID', 'Date', 'Status', 'Amount'];
    rows.push(headers.join(','));
    
    for (const tr of table.children) {
        const rowData = Array.from(tr.children).map(td => `"${td.textContent}"`);
        rows.push(rowData.join(','));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VibeMarket_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export complete!');
}

async function loadInventory() {
    showPage('mgr-inventory');
    document.getElementById('page-title').textContent = "Product Catalog";
    const res = await api('/inventory');
    if (res.success) {
        document.getElementById('mgr-products-list').innerHTML = res.data.map(p => `
            <tr>
                <td><div class="font-medium text-white">${p.name}</div><div class="text-xs text-secondary">${p.barcode}</div></td>
                <td>${p.category}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td class="font-bold ${p.stockLevel <= p.minStock ? 'text-danger' : 'text-success'}">${p.stockLevel}</td>
                <td><span class="badge ${p.isActive ? 'badge-success' : 'badge-warning'}">${p.isActive ? 'Active' : 'Draft'}</span></td>
                <td>
                    <div class="flex gap-2">
                        <button onclick='editProduct(${JSON.stringify(p)})' class="btn btn-secondary text-xs"><i class="fa-solid fa-pen"></i></button>
                        <button onclick='deleteProduct("${p.id}")' class="btn btn-secondary text-xs text-danger"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

async function loadStaff() {
    showPage('mgr-staff');
    document.getElementById('page-title').textContent = "Team Members";
    const res = await api('/auth/staff');
    if (res.success) {
        document.getElementById('mgr-staff-list').innerHTML = res.data.map(s => `
            <tr>
                <td class="font-medium text-white">${s.fullName || '-'}</td>
                <td class="text-secondary">@${s.username}</td>
                <td class="uppercase text-xs font-bold tracking-wider">${s.role}</td>
                <td><span class="badge ${s.isActive ? 'badge-success' : 'badge-warning'}">${s.isActive ? 'Active' : 'Disabled'}</span></td>
                <td><button onclick="toggleStaff('${s.id}')" class="btn ${s.isActive ? 'btn-danger' : 'btn-success'} text-xs">${s.isActive ? 'Revoke' : 'Grant'} Access</button></td>
            </tr>
        `).join('');
    }
}

// Manager Modals
function openProductModal() {
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-title').textContent = 'New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').classList.remove('hidden');
}
function closeProductModal() { document.getElementById('product-modal').classList.add('hidden'); }
function editProduct(p) {
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-barcode').value = p.barcode;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stockLevel;
    document.getElementById('modal-title').textContent = 'Update Product';
    document.getElementById('product-modal').classList.remove('hidden');
}
async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const body = {
        barcode: document.getElementById('prod-barcode').value,
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stockLevel: parseInt(document.getElementById('prod-stock').value)
    };
    
    const res = await api(id ? `/inventory/${id}` : '/inventory', id ? 'PUT' : 'POST', body);
    if (res.success) {
        showToast('Product saved successfully');
        closeProductModal();
        loadInventory();
    } else showToast(res.message, 'error');
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to deactivate this product?")) return;
    const res = await api(`/inventory/${id}`, 'DELETE');
    if (res.success) {
        showToast('Product deactivated successfully');
        loadInventory();
    } else showToast(res.message, 'error');
}

async function toggleStaff(id) {
    const res = await api(`/auth/staff/${id}/toggle`, 'PATCH');
    if (res.success) {
        showToast('User access updated');
        loadStaff();
    }
}

// ==========================================
// MANAGER STAFF MODAL
// ==========================================
function openStaffModal() {
    document.getElementById('staff-form').reset();
    document.getElementById('staff-modal').classList.remove('hidden');
}

async function saveStaff(e) {
    e.preventDefault();
    const body = {
        fullName: document.getElementById('staff-name').value,
        username: document.getElementById('staff-user').value,
        password: document.getElementById('staff-pass').value,
        role: document.getElementById('staff-role').value
    };
    
    const res = await api('/auth/register', 'POST', body);
    if (res.success) {
        showToast('Team member added successfully');
        document.getElementById('staff-modal').classList.add('hidden');
        loadStaff();
    } else showToast(res.message, 'error');
}

function openPromoModal() {
    document.getElementById('promo-form').reset();
    document.getElementById('promo-modal').classList.remove('hidden');
}

async function savePromo(e) {
    e.preventDefault();
    const body = {
        productId: document.getElementById('promo-barcode').value || null,
        discountPct: parseInt(document.getElementById('promo-discount').value),
        startDate: document.getElementById('promo-start').value,
        endDate: document.getElementById('promo-end').value
    };
    const res = await api('/inventory/promotions', 'POST', body);
    if (res.success) {
        showToast('Promotion created successfully');
        document.getElementById('promo-modal').classList.add('hidden');
        // A real app would refresh the promo list here, but we are using dummy UI data for that table
    } else showToast(res.message, 'error');
}

// ==========================================
// SUPPLIER PORTAL
// ==========================================
async function submitDelivery(e) {
    e.preventDefault();
    const payload = {
        invoice: document.getElementById('sup-invoice').value,
        items: [{
            barcode: document.getElementById('sup-barcode').value,
            quantity: parseInt(document.getElementById('sup-qty').value),
            unitCost: parseFloat(document.getElementById('sup-cost').value)
        }]
    };
    
    const res = await api('/supplier/procurement', 'POST', payload);
    if (res.success) {
        showToast('Inventory replenished successfully!');
        e.target.reset();
    } else showToast(res.message, 'error');
}
