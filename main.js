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

// FAQ Accordion functionality + Zapier webhook integration
window.addEventListener('DOMContentLoaded', function() {
  // ===== Zapier webhook integration for forms =====
  const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24820964/u968d0g/';

  function serializeForm(form) {
    const data = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (data[key] !== undefined) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    return data;
  }

  async function postToZapier(payload) {
    // Use no-cors to bypass browser CORS restrictions. We cannot read the response,
    // but Zapier will still receive the payload.
    await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return {};
  }

  function handleSubmit(form, meta) {
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : '';

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Senda...';
      }

      const data = serializeForm(form);
      const payload = {
        source: 'karbon.is',
        page: window.location.pathname,
        submittedAt: new Date().toISOString(),
        formMeta: meta,
        data
      };

      try {
        await postToZapier(payload);
        form.innerHTML = '<div class="form-success">Takk! Við höfum móttekið innsendinguna þína. Við höfum samband fljótlega.</div>';
      } catch (err) {
        alert('Ekki tókst að senda. Reyndu aftur á eftir.');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  }

  // Unified form submit
  const simpleFormWrap = document.getElementById('form-simple');
  const simpleFormEl = simpleFormWrap ? simpleFormWrap.querySelector('form.form-card') : null;
  handleSubmit(simpleFormEl, { id: 'unified-signup', name: 'Skráning' });
  // ===== End Zapier webhook integration =====

  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherQ = otherItem.querySelector('.faq-question');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
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
  // ===== End FAQ Accordion =====
});

// Program Selection and Form Switching
window.addEventListener('DOMContentLoaded', function() {
  const programOptions = document.querySelectorAll('#skraning .program-option');
  const inquiryOptions = document.querySelectorAll('.inquiry-option');
  const programSelector = document.querySelector('#skraning .program-selector');
  const inquiryButtons = document.querySelector('.inquiry-buttons');
  const karbonPerformanceForm = document.getElementById('form-karbon-performance');
  const karbonPremiumForm = document.getElementById('form-karbon-premium');
  const simpleForm = document.getElementById('form-simple');
  const inquiryForm = document.getElementById('form-inquiry');
  const simpleFormTitle = document.getElementById('simple-form-title');
  const inquiryFormTitle = document.getElementById('inquiry-form-title');
  const backButtons = document.querySelectorAll('.back-to-selection');

  // Handle program option clicks
  programOptions.forEach(option => {
    option.addEventListener('click', function() {
      const program = this.getAttribute('data-program');
      
      // Hide program selector with fade out
      programSelector.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      programSelector.style.opacity = '0';
      programSelector.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        programSelector.style.display = 'none';
        
        if (program === 'karbon-performance') {
          // Show comprehensive form
          karbonPerformanceForm.style.display = 'block';
          setTimeout(() => {
            karbonPerformanceForm.classList.add('show');
          }, 50);
        } else if (program === 'karbon-premium') {
          // Show comprehensive form
          karbonPremiumForm.style.display = 'block';
          setTimeout(() => {
            karbonPremiumForm.classList.add('show');
          }, 50);
        } else if (program === 'fyrirtækjanámskeið' || program === 'karbon-premium-inquiry') {
          // Show inquiry form
          inquiryForm.style.display = 'block';
          setTimeout(() => {
            inquiryForm.classList.add('show');
          }, 50);
        } else {
          // Show simple form with appropriate title
          let title = '';
          switch(program) {
            case 'fjarþjálfun':
              title = 'Fjarþjálfun - Skráning';
              break;
            case 'næringarráðgjöf':
              title = 'Næringarráðgjöf - Skráning';
              break;
          }
          simpleFormTitle.textContent = title;
          simpleForm.style.display = 'block';
          setTimeout(() => {
            simpleForm.classList.add('show');
          }, 50);
        }
      }, 300);
    });
  });

  // Handle inquiry option clicks
  inquiryOptions.forEach(option => {
    option.addEventListener('click', function() {
      const program = this.getAttribute('data-program');
      const select = document.getElementById('program-select');
      if (select && program) {
        select.value = program;
        select.dispatchEvent(new Event('change'));
        // Smooth scroll to the form top
        const formWrap = document.getElementById('form-simple');
        if (formWrap) {
          const top = formWrap.getBoundingClientRect().top + window.pageYOffset - 12;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Handle back to selection buttons
  backButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Hide current form
      const currentForm = this.closest('.signup-form');
      currentForm.classList.remove('show');
      
      setTimeout(() => {
        currentForm.style.display = 'none';
        
        // Determine which selector to show based on the form
        if (currentForm === inquiryForm) {
          // Show inquiry buttons with fade in
          inquiryButtons.style.display = 'grid';
          inquiryButtons.style.opacity = '0';
          inquiryButtons.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            inquiryButtons.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            inquiryButtons.style.opacity = '1';
            inquiryButtons.style.transform = 'translateY(0)';
          }, 50);
        } else {
          // Show program selector with fade in
          programSelector.style.display = 'grid';
          programSelector.style.opacity = '0';
          programSelector.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            programSelector.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            programSelector.style.opacity = '1';
            programSelector.style.transform = 'translateY(0)';
          }, 50);
        }
      }, 300);
    });
  });

  // Handle "Other" checkbox functionality for comprehensive forms
  const interestOtherHt = document.getElementById('interest-other-ht');
  const interestOtherWrapHt = document.getElementById('interest-other-wrap-ht');
  
  if (interestOtherHt && interestOtherWrapHt) {
    interestOtherHt.addEventListener('change', function() {
      if (this.checked) {
        interestOtherWrapHt.hidden = false;
      } else {
        interestOtherWrapHt.hidden = true;
        document.getElementById('interest-other-text-ht').value = '';
      }
    });
  }

  // Handle "Other" checkbox functionality for Premium form
  const interestOtherPremium = document.getElementById('interest-other-premium');
  const interestOtherWrapPremium = document.getElementById('interest-other-wrap-premium');
  
  if (interestOtherPremium && interestOtherWrapPremium) {
    interestOtherPremium.addEventListener('change', function() {
      if (this.checked) {
        interestOtherWrapPremium.hidden = false;
      } else {
        interestOtherWrapPremium.hidden = true;
        document.getElementById('interest-other-text-premium').value = '';
      }
    });
  }
});

// Hamburger Menu Functionality
window.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const body = document.body;

  if (hamburgerBtn && mobileMenu) {
    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', function() {
      const isOpen = hamburgerBtn.classList.contains('active');
      
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking on nav links
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        closeMobileMenu();
      });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && hamburgerBtn.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    function openMobileMenu() {
      hamburgerBtn.classList.add('active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('active');
      mobileMenu.setAttribute('aria-hidden', 'false');
      body.classList.add('menu-open');
      
      // Focus management
      mobileMenu.querySelector('.mobile-nav-link').focus();
    }

    function closeMobileMenu() {
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      body.classList.remove('menu-open');
      
      // Return focus to hamburger button
      hamburgerBtn.focus();
    }
  }
});

})();
