/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: Implements a customized styled button component
 */
 
/**
 * Creates a styled button and appends it to the specified container element.
 *
 * @param {HTMLElement} container - The parent DOM element to append the button to
 * @param {String} placeholder - The label text displayed inside the button
 * @param {Function} onClick - Callback function invoked when the button is clicked
 * @returns {void}
 */
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