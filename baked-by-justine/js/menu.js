

const tabBtns = document.querySelectorAll('.tab-btn');
const menuSections = document.querySelectorAll('.menu-section');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.getAttribute('data-cat');

    // Update active tab
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide sections
    menuSections.forEach(section => {
      const sectionCat = section.getAttribute('data-cat');
      if (cat === 'all' || sectionCat === cat) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    // Scroll to top of menu main area smoothly
    const menuMain = document.querySelector('.menu-main');
    if (menuMain) {
      const offset = 130; // account for sticky nav + tabs
      const top = menuMain.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
