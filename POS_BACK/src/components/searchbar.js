export function createSearchBar(onChange) {
const wrapper = document.createElement('div');
wrapper.className = "flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-1/2 ml-6";

wrapper.innerHTML = `
  <i class="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
  <input 
    type="text" 
    placeholder="Search staff or roles..." 
    class="outline-none border-none text-sm text-gray-500 w-full bg-transparent"
  />
`;
wrapper.addEventListener("change", onChange);
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
