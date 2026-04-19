export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');

  // Create toast element
  const toast = document.createElement('div');
  
  // Base Styling
  const baseClasses = ['px-6', 'py-3', 'rounded-lg', 'shadow-lg', 'text-white', 'font-medium', 'transform', 'transition-all', 'duration-300', 'translate-x-full'];
  
  // Type-specific Styling
  const typeClasses = type === 'success' ? ['bg-emerald-500'] : ['bg-rose-500'];

  toast.classList.add(...baseClasses, ...typeClasses);
  toast.innerText = message;

  container.appendChild(toast);

  // Trigger Slide-in (Small delay to allow DOM to register the initial state)
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
  }, 10);

  // Auto-remove
  setTimeout(() => {
    // Slide out
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full', 'opacity-0');
    
    // Remove from DOM after animation finishes
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, duration);
}
