export function createButton(container, placeholder, onClick) {
  const parent = container;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button class="flex items-center gap-2 px-4 py-2.5 bg-[#6F3D1F] hover:bg-[#5a3019] transition-colors cursor-pointer text-[#fdf6f0] text-sm font-medium rounded-xl">
      <i class="fa-regular fa-plus text-sm"></i>
      ${placeholder}
    </button>
  `;
  wrapper.addEventListener("click", onClick);
  parent.append(wrapper);
}