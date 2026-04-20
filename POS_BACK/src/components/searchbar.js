export function createSearchBar(onInput, onNavigate) {
  const wrapper = document.createElement('div');
  // 'relative' is key for the dropdown positioning
  wrapper.className = "relative flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 w-1/2 ml-6 focus-within:ring-2 focus-within:ring-stone-100 transition-all";

  wrapper.innerHTML = `
    <i class="fa-solid fa-magnifying-glass text-stone-400 text-sm"></i>
    <input 
      type="text" 
      placeholder="Search pages..." 
      class="outline-none border-none text-sm text-stone-600 w-full bg-transparent"
      autocomplete="off"
    />
    <div id="search-results-dropdown" class="hidden absolute top-2 left-0 w-full mt-5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden">
    </div>
  `;

  const input = wrapper.querySelector('input');
  const dropdown = wrapper.querySelector('#search-results-dropdown');

  // Trigger filtering on type
  input.addEventListener("input", (e) => {
    onInput(e.target.value, dropdown);
  });

  // Handle navigation click
  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('[data-route]');
    if (item) {
      const route = item.getAttribute('data-route');
      onNavigate(route); // Calls router.go(route)
      dropdown.classList.add('hidden');
      input.value = ""; 
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) dropdown.classList.add('hidden');
  });

  return wrapper;
}

export function createTopBarIcons() {
  const wrapper = document.createElement('div');
  wrapper.className = "flex items-center gap-1 ml-auto mr-4";

  wrapper.innerHTML = `
    <button class="p-2 rounded-lg hover:bg-[#E8E8E3] transition-colors cursor-pointer text-[#2d2621]">
      <i class="fa-regular fa-bell text-lg"></i>
    </button>
    <button class="p-2 rounded-lg hover:bg-[#E8E8E3] transition-colors cursor-pointer text-[#2d2621]">
      <i class="fa-solid fa-gear text-lg"></i>
    </button>
  `;

  return wrapper;
}
