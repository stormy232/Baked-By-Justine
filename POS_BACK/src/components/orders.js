import { getOrders, updateOrder } from "../services/OrderRequests.js";



const STATUS_CONFIG = {
  preparing: { label: 'IN PROGRESS', classes: 'bg-orange-100 text-orange-700' },
  pending: { label: 'PENDING', classes: 'bg-stone-100 text-stone-500' },
  finished: { label: 'READY TO SERVE', classes: 'bg-green-100 text-green-700' },
};

export function createFilterBar(onFilterUpdate) {
  const filterContainer = document.createElement("div");
  filterContainer.className = "flex flex-row items-end gap-4 p-4 bg-white border-b border-gray-200";

  // Helper to create labeled inputs
  const createInput = (labelTxt, id, date) => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col gap-1";

    const label = document.createElement("label");
    label.className = "text-[10px] font-bold text-[#6b6661] uppercase tracking-wider";
    label.textContent = labelTxt;

    const input = document.createElement("input");
    input.type = "date";
    input.id = id;
    input.className = "px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none";

    // Default to today's date
    input.value = date;

    wrapper.append(label, input);
    return { wrapper, input };
  };

  // Current Date
  const now = new Date();

  // 1. Start Date (Today)
  const endValue = now.toISOString().split('T')[0];

  // 2. End Date (7 Days Ago)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const startValue = sevenDaysAgo.toISOString().split('T')[0];

  // Your Inputs
  const start = createInput("Start Date", "startDate", startValue);
  const end = createInput("End Date", "endDate", endValue);
  // Filter Button
  const filterBtn = document.createElement("button");
  filterBtn.className = "px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors h-[34px]";
  filterBtn.textContent = "Apply";

  filterBtn.onclick = () => {
    onFilterUpdate(start.input.value, end.input.value);
  };

  filterContainer.append(start.wrapper, end.wrapper, filterBtn);
  return { filterContainer, startValue: start.input.value, endValue: end.input.value };
}

function orderCard(order) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl border border-stone-100 p-4 flex flex-col gap-3';

  const { label, classes } = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  const time = order.date
    ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // items is already an array of { name, quantity, price }
  const itemList = (order.items ?? [])
    .map(i => `<li class="text-sm text-stone-600">${i.quantity}x ${i.name}</li>`)
    .join('');

  let actions = '';
  if (order.status === 'preparing') {
    actions = `
      <button data-id="${order.order_id}" data-action="finished"
        class="action-btn w-full py-2.5 bg-[#3d1f0f] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2a1508] transition-colors">
        <i class="fa-regular fa-circle-check"></i> Mark Ready
      </button>`;
  } else if (order.status === 'finished') {
    actions = `
      <div class="flex">
        <button data-id="${order.order_id}" data-action="complete"
          class="action-btn flex-1 py-2.5 bg-[#3d1f0f] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2a1508] transition-colors">
          <i class="fa-solid fa-cash-register text-xs"></i> Completed
        </button>
      </div>`;
  } else {
    actions = `
      <button class="w-full py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
        <i class="fa-regular fa-eye text-xs"></i> View Details
      </button>`;
  }

  card.innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-2 py-1 rounded-md ${classes}">${label}</span>
        <span class="text-xs text-stone-400">#${order.order_id}</span>
      </div>
      <div class="text-right">
        <div class="text-xs text-stone-400">${time}</div>
        <div class="font-semibold text-stone-800">$${parseFloat(order.total_bill ?? 0).toFixed(2)}</div>
      </div>
    </div>
    <div>
      <p class="font-semibold text-stone-800 mb-2">${order.customer_email}</p>
      <ul class="space-y-0.5 border-l-2 border-stone-100 pl-3">${itemList}</ul>
    </div>
    <div>${actions}</div>
  `;

  // Wire up status update buttons
  card.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const newStatus = btn.dataset.action === 'finished' ? 'finished' : null;
      if (!newStatus) return;
      btn.disabled = true;
      btn.textContent = 'Updating...';
      const result =  updateOrder(id, newStatus);
      result.then(result => {
        const list = document.querySelector('#orders-list');
        if (list) renderOrders(list);
      }).catch(() => {
        btn.disabled = false;
        btn.textContent = 'Retry';
      });
    });
  });

  return card;
}


async function renderOrders(listEl, filter = 'all', start_date = null, end_date = null) {
  listEl.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">Loading...</p>';
  const orders = getOrders(start_date, end_date);
  orders.catch( orders => {
    listEl.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">Could not load orders.</p>';
    return;
  })
  .then( orders => {
  const filtered = filter === 'all'
    ? orders
    : filter === 'active'
      ? orders.filter(o => o.status === 'pending' || o.status === 'preparing')
      : orders.filter(o => o.status === 'finished');

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">No orders.</p>';
    return;
  }
  filtered.forEach(o => listEl.append(orderCard(o)));
});
}

export async function createOrdersPage(container) {
  container.innerHTML = '';

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Format to YYYY-MM-DD for HTML inputs and SQL compatibility
  let currentEnd = today.toISOString().split('T')[0];
  let currentStart = sevenDaysAgo.toISOString().split('T')[0];

  // Initialize Filter Bar
  const filter_date = createFilterBar(async (start, end) => {
    currentStart = start;
    currentEnd = end;
    await renderOrders(list, activeTab, currentStart, currentEnd);
  });

  currentStart = filter_date.startValue;
  currentEnd = filter_date.endValue;
  container.append(filter_date.filterContainer);

  // Tab bar
  let activeTab = 'all';
  const tabs = document.createElement('div');
  tabs.className = 'flex gap-1 bg-white border border-stone-100 rounded-xl p-1';
  tabs.innerHTML = `
    <button data-tab="all"      class="tab-btn flex-1 py-2 rounded-lg text-sm font-medium bg-white shadow-sm text-stone-800">All Orders</button>
    <button data-tab="active"   class="tab-btn flex-1 py-2 rounded-lg text-sm font-medium text-stone-400">Active</button>
    <button data-tab="finished" class="tab-btn flex-1 py-2 rounded-lg text-sm font-medium text-stone-400">Completed</button>
  `;
  container.append(tabs);

  // Order list
  const list = document.createElement('div');
  list.id = 'orders-list';
  list.className = 'flex flex-col gap-3';
  container.append(list);

  // Mobile FAB
  const fab = document.createElement('button');
  fab.className = 'fixed bottom-24 right-4 md:hidden w-12 h-12 bg-[#3d1f0f] text-white rounded-full shadow-lg flex items-center justify-center text-xl z-10';
  fab.innerHTML = '<i class="fa-solid fa-plus"></i>';
  document.body.append(fab);

  // Initial load
  await renderOrders(list, activeTab, currentStart, currentEnd);

  // Tab switching
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      tabs.querySelectorAll('.tab-btn').forEach(b => {
        b.className = 'tab-btn flex-1 py-2 rounded-lg text-sm font-medium text-stone-400';
      });
      btn.className = 'tab-btn flex-1 py-2 rounded-lg text-sm font-medium bg-white shadow-sm text-stone-800';
      renderOrders(list, activeTab, currentStart, currentEnd);
    });
  });

  return () => fab.remove();
}