/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: Implements a toast notification popup for when userPermissions aren't met or db changes
 */
 
/**
 * Displays a temporary toast notification in the bottom-right corner of the screen.
 * Creates a shared toast container if one does not already exist.
 *
 * @param {String} message - The text message to display inside the toast
 * @param {String} type - The type of toast; 'success' shows green styling, any other value shows red; defaults to 'success'
 * @param {Number} duration - How long (in milliseconds) the toast remains visible before auto-dismissing; defaults to 3000
 * @returns {void}
 */
export function showToast(message, type = 'success', duration = 3000) {
  // 1. Ensure a container exists to hold the toasts
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    // Position it in the bottom-right corner
    container.className = "fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(container);
  }

  // 2. Create toast element
  const toast = document.createElement('div');
  
  // Base Styling: Added 'pointer-events-auto' so you could click them if needed
  const baseClasses = ['px-6', 'py-3', 'rounded-lg', 'shadow-2xl', 'text-white', 'font-medium', 'transform', 'transition-all', 'duration-300', 'translate-x-[120%]'];
  
  // Type-specific Styling (Matching your Stone/Rose/Emerald theme)
  const typeClasses = type === 'success' ? ['bg-emerald-600'] : ['bg-rose-600'];

  toast.classList.add(...baseClasses, ...typeClasses);
  
  // Added an icon based on type for a more professional look
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon} mr-2"></i> ${message}`;

  container.appendChild(toast);

  // 3. Trigger Slide-in
  // Use requestAnimationFrame for smoother entry than setTimeout
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-[120%]');
    toast.classList.add('translate-x-0');
  });

  // 4. Auto-remove
  setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-[120%]', 'opacity-0');
    
    toast.addEventListener('transitionend', () => {
      toast.remove();
      // Clean up container if it's empty to keep DOM light
      if (container.childNodes.length === 0) container.remove();
    });
  }, duration);
}