// Smooth scroll for in-page links, with reduced motion respect
(function() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - 12;
    if (prefersReduced) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  // Toggle "Other" interest input
  window.addEventListener('DOMContentLoaded', function() {
    const otherCheckbox = document.getElementById('interest-other');
    const otherWrap = document.getElementById('interest-other-wrap');
    if (!otherCheckbox || !otherWrap) return;
    const sync = () => { otherWrap.hidden = !otherCheckbox.checked; };
    otherCheckbox.addEventListener('change', sync);
    sync();
  });

  // Image modal functionality
  window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.querySelector('.modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const imageButtons = document.querySelectorAll('.result-image-btn');

    if (!modal || !modalImage || !modalClose || !modalBackdrop) return;

    // Open modal
    imageButtons.forEach(button => {
      button.addEventListener('click', function() {
        const imageSrc = this.getAttribute('data-image');
        const imageAlt = this.getAttribute('data-alt');
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      modalImage.src = '';
      modalImage.alt = '';
    };

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
});

// FAQ Accordion functionality
window.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      
      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Keyboard navigation
    question.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
});
})();
