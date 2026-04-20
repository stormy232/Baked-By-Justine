import { deleteUser, registerUser, updateUser } from "../services/UserRequests";
import { showToast } from "./permissions";

// Single row for the desktop table view
function userRow(user, onEdit) {
  const tr = document.createElement('tr');
  tr.className = 'border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer';

  const statusDot = user.clocked_in
    ? '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Clocked In</span>'
    : '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-stone-300 inline-block"></span>Off Duty</span>';

  tr.innerHTML = `
    <td class="px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          ${user.image ? `<img src="${user.image}" class="w-full h-full object-cover" />` : `<i class="fa-solid fa-user text-stone-300 text-sm"></i>`}
        </div>
        <div>
          <p class="text-sm font-medium text-stone-800">${user.username}</p>
        </div>
      </div>
    </td>
    <td class="px-6 py-4">
      <span class="text-xs font-semibold px-2.5 py-1 rounproduct_idded-full bg-stone-100 text-stone-600 uppercase tracking-wide">${user.privilege}</span>
    </td>
    <td class="px-6 py-4 text-sm text-stone-600">${statusDot}</td>
    <td class="px-6 py-4">
      <button class="delete-btn text-stone-400 hover:text-stone-700 transition-colors p-1">
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  `;

  const deleteBtn = tr.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents the row's 'onSelect' (edit) from triggering
      
      if (confirm(`Are you sure you want to delete ${user.username}?`)) {
        // Use the ID from your product object
        const idToDelete = user.user_id;
        
       const result = await deleteUser(idToDelete);
        if(result){
        showToast(`${product.name} removed user`, "success"); //
        window.router.go('users', null, true); // Refresh the view
      }
    }
    });
  }
  tr.addEventListener('click', () => onEdit(user));
  return tr;
}

// Mobile card view
function userCard(user, onEdit) {
  const card = document.createElement('div');
  card.className = 'flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:shadow-md transition-shadow cursor-pointer';

  const statusLabel = user.shift_status == "on_shift" ? 'CLOCKED IN' : 'OFF DUTY';
  const statusClass = user.shift_status == "on_shift" ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500';
  const startedLabel = user.shift_status == "on_shift" ? `Started ${user.session ?? ''}` : `Last: ${user.last_seen ?? '—'}`;

  card.innerHTML = `
    <div class="w-12 h-12 rounded-full bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-stone-50">
      ${user.image ? `<img src="${user.image}" class="w-full h-full object-cover" />` : `<i class="fa-solid fa-user text-stone-300 text-lg"></i>`}
    </div>
    <div class="flex flex-col gap-0.5 flex-1 min-w-0">
      <p class="font-medium text-sm text-stone-800 truncate">${user.username}</p>
      <p class="text-xs text-stone-400 uppercase tracking-wide">${user.privilege}</p>
    </div>
    <div class="text-right flex-shrink-0">
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${statusClass}">${statusLabel}</span>
      <p class="text-[10px] text-stone-400 mt-0.5">${startedLabel}</p>
    </div>
  `;
  card.addEventListener('click', () => onEdit(user));
  return card;
}

export function createUsersPage(data, onEdit) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-4 w-full';

  // Header stats (desktop only)
  const stats = document.createElement('div');
  stats.className = 'hidden md:grid grid-cols-4 gap-4';
  stats.innerHTML = `
    <div class="bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1">
      <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Now</span>
      <span class="text-3xl font-bold text-stone-800">${data.users.filter(user => user.shift_status === 'on_shift').length ?? '—'}</span>
      <span class="text-xs text-stone-400">On Floor</span>
    </div>
    <div class="bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1">
      <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Staff</span>
      <span class="text-3xl font-bold text-stone-800">${data.users?.length ?? '—'}</span>
      <span class="text-xs text-stone-400">Registered</span>
    </div>
  `;
  wrapper.append(stats);

  // Mobile: section label
  const mobileLabel = document.createElement('p');
  mobileLabel.className = 'md:hidden text-xs font-bold text-stone-400 uppercase tracking-wider px-1';
  mobileLabel.textContent = `Active Staff (${data.users?.length ?? 0})`;
  wrapper.append(mobileLabel);

  // Mobile card list
  const mobileList = document.createElement('div');
  mobileList.className = 'flex flex-col gap-3 md:hidden';
  (data.users ?? []).forEach(u => mobileList.append(userCard(u, onEdit)));
  wrapper.append(mobileList);

  // Desktop table
  const tableWrap = document.createElement('div');
  tableWrap.className = 'hidden md:block bg-white rounded-xl border border-stone-100 overflow-hidden';
  tableWrap.innerHTML = `
    <div class="flex items-center justify-between px-6 py-4 border-b border-stone-50">
      <h3 class="font-semibold text-stone-800">Team Members</h3>
      <div class="flex gap-2">
        <select class="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-600 bg-white">
          <option>All Roles</option>
          <option>Owner</option>undefined
          <option>Employee</option>
        </select>
        <select class="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-600 bg-white">
          <option>All Status</option>
          <option>Clocked In</option>
          <option>Off Duty</option>
        </select>
      </div>
    </div>
    <table class="w-full text-left">
      <thead>
        <tr class="bg-stone-50 border-b border-stone-100">
          <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Staff Member</th>
          <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Role</th>
          <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Shift Status</th>
        </tr>
      </thead>
      <tbody id="users-table-body"></tbody>
    </table>
    <div class="px-6 py-3 border-t border-stone-50 text-xs text-stone-400">
      Showing 1–${data.users?.length ?? 0} of ${data.users?.length ?? 0} Team Members
    </div>
  `;
  const tbody = tableWrap.querySelector('#users-table-body');
  (data.users ?? []).forEach(u => tbody.append(userRow(u, onEdit)));
  wrapper.append(tableWrap);

  return wrapper;
}

export function createUserPage() {
  const container = document.createElement('div');
  container.className = "min-h-screen bg-stone-100 p-6 flex w-full justify-center items-center";
  container.innerHTML = `
    <form class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200" id="addUserForm">
      <h2 class="text-2xl font-bold text-yellow-950 mb-1">Add Staff</h2>
      <p class="text-stone-600 mb-6">Enter user details to create an account.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-amber-900">Username</label>
          <input type="text" name="username" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Username">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Password</label>
          <input type="password" name="password" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Password">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Role</label>
          <select name="privilege" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border bg-white">
            <option value="employee">Employee</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
      <input type="submit" value="Add Staff" class="mt-6 w-full bg-yellow-950 text-white py-2.5 px-4 rounded-md hover:bg-amber-900 transition duration-200 font-semibold text-sm">
    </form>
  `;
  container.querySelector('#addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    registerUser(formData);});
  return container;
}

export function editUserPage(user) {
  const container = document.createElement('div');
  container.className = "min-h-screen bg-stone-100 p-6 flex w-full justify-center items-center";
  container.innerHTML = `
    <form class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200" id="editUserForm">
      <h2 class="text-2xl font-bold text-yellow-950 mb-1">Edit Staff</h2>
      <p class="text-stone-600 mb-6">Update user details below.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-amber-900">Username</label>
          <input type="text" name="username" value="${user.username}" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Role</label>
          <select name="privilege" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border bg-white">
            <option value="employee" ${user.privilege === 'employee' ? 'selected' : ''}>Employee</option>
            <option value="owner" ${user.privilege === 'owner' ? 'selected' : ''}>Owner</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="userid" value="${user.user_id}">
      <input type="submit" value="Save Changes" class="mt-6 w-full bg-yellow-950 text-white py-2.5 px-4 rounded-md hover:bg-amber-900 transition duration-200 font-semibold text-sm">
    </form>
  `;
  container.querySelector('#editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateUser(formData);});
  return container;
}
