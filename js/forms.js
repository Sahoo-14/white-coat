/**
 * ============================================================
 *  Bhanja College of Nursing — forms.js
 *  Form validation, submission handling & modals
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdmissionForm();
  initContactForm();
  initModalCloseHandlers();
});

/* ================================================================
   Generic Validation Helpers
   ================================================================ */

/**
 * Test an email string against a standard regex.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(
    email.trim()
  );
}

/**
 * Test a phone number against 10-digit Indian pattern.
 * Allows an optional +91 or 0 prefix.
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  return /^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/.test(phone.trim());
}

/**
 * Display an inline error message below a form field.
 * @param {HTMLElement} field – the input / select / textarea element
 * @param {string}      message
 */
function showError(field, message) {
  clearError(field); // avoid duplicates

  field.classList.add('error');

  const span = document.createElement('span');
  span.className = 'error-message';
  span.textContent = message;

  // Insert after the field (or after its wrapper if inside one)
  const parent = field.closest('.form-group') || field.parentElement;
  parent.appendChild(span);
}

/**
 * Remove error state & message from a field.
 * @param {HTMLElement} field
 */
function clearError(field) {
  field.classList.remove('error');

  const parent = field.closest('.form-group') || field.parentElement;
  const existing = parent.querySelector('.error-message');
  if (existing) existing.remove();
}

/* ================================================================
   Modal Helpers
   ================================================================ */

/**
 * Show a success / error modal overlay.
 * Creates the modal DOM on first call if it doesn't exist.
 * @param {string} title
 * @param {string} message
 */
function showModal(title, message) {
  let modal = document.querySelector('.form-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML = `
      <div class="form-modal-overlay"></div>
      <div class="form-modal-content">
        <button class="form-modal-close" aria-label="Close">&times;</button>
        <div class="form-modal-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 class="form-modal-title"></h3>
        <p class="form-modal-message"></p>
        <button class="btn btn-primary form-modal-ok">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Attach close handlers to the newly created modal
    attachModalCloseListeners(modal);
  }

  modal.querySelector('.form-modal-title').textContent   = title;
  modal.querySelector('.form-modal-message').textContent  = message;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the modal.
 */
function closeModal() {
  const modal = document.querySelector('.form-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Attach click-to-close listeners on a modal element.
 */
function attachModalCloseListeners(modal) {
  const closeBtn  = modal.querySelector('.form-modal-close');
  const okBtn     = modal.querySelector('.form-modal-ok');
  const overlay   = modal.querySelector('.form-modal-overlay');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (okBtn)    okBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', closeModal);
}

/**
 * Also attach listeners to any modal already in the HTML.
 */
function initModalCloseHandlers() {
  const modal = document.querySelector('.form-modal');
  if (modal) attachModalCloseListeners(modal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ================================================================
   Admission Enquiry Form
   ================================================================ */
function initAdmissionForm() {
  const form = document.querySelector('#admissionForm');
  if (!form) return;

  let hasAttemptedSubmit = false;

  /* ── Field references ──────────────────────────────────── */
  const fields = {
    name:      form.querySelector('[name="name"]'),
    mobile:    form.querySelector('[name="mobile"]'),
    email:     form.querySelector('[name="email"]'),
    course:    form.querySelector('[name="course"]'),
    address:   form.querySelector('[name="address"]'),
    physics:   form.querySelector('[name="physics"]'),
    chemistry: form.querySelector('[name="chemistry"]'),
    biology:   form.querySelector('[name="biology"]'),
  };

  /* ── Per-field validation rules ────────────────────────── */
  const validators = {
    name(value) {
      if (!value.trim()) return 'Name is required.';
      if (value.trim().length < 3) return 'Name must be at least 3 characters.';
      if (!/^[a-zA-Z\s]+$/.test(value.trim()))
        return 'Name can only contain letters and spaces.';
      return '';
    },
    mobile(value) {
      if (!value.trim()) return 'Mobile number is required.';
      if (!validatePhone(value)) return 'Enter a valid 10-digit mobile number.';
      return '';
    },
    email(value) {
      if (!value.trim()) return 'Email is required.';
      if (!validateEmail(value)) return 'Enter a valid email address.';
      return '';
    },
    course(value) {
      if (!value) return 'Please select a course.';
      return '';
    },
    address(value) {
      if (!value.trim()) return 'Address is required.';
      if (value.trim().length < 10) return 'Address must be at least 10 characters.';
      return '';
    },
    physics(value) {
      return validatePercentage(value, 'Physics');
    },
    chemistry(value) {
      return validatePercentage(value, 'Chemistry');
    },
    biology(value) {
      return validatePercentage(value, 'Biology');
    },
  };

  function validatePercentage(value, subject) {
    if (value === '' || value === undefined || value === null)
      return `${subject} percentage is required.`;
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100)
      return `${subject} percentage must be between 0 and 100.`;
    return '';
  }

  /**
   * Validate a single field and show / clear error.
   * @returns {boolean} true if valid
   */
  function validateField(name) {
    const field     = fields[name];
    const validator = validators[name];
    if (!field || !validator) return true;

    const error = validator(field.value);
    if (error) {
      showError(field, error);
      return false;
    }
    clearError(field);
    return true;
  }

  /**
   * Validate all fields. Returns true if all pass.
   */
  function validateAll() {
    let allValid = true;
    for (const name of Object.keys(validators)) {
      if (!validateField(name)) allValid = false;
    }
    return allValid;
  }

  /* ── Real-time validation (blur + input after first submit) */
  Object.keys(fields).forEach((name) => {
    const field = fields[name];
    if (!field) return;

    // Always validate on blur
    field.addEventListener('blur', () => validateField(name));

    // After the first submit attempt, also validate on every input
    field.addEventListener('input', () => {
      if (hasAttemptedSubmit) validateField(name);
    });
  });

  /* ── Form submission ───────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hasAttemptedSubmit = true;

    if (!validateAll()) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build lead object
    const lead = {
      name:      fields.name.value.trim(),
      mobile:    fields.mobile.value.trim(),
      email:     fields.email.value.trim(),
      course:    fields.course.value,
      address:   fields.address.value.trim(),
      physics:   Number(fields.physics.value),
      chemistry: Number(fields.chemistry.value),
      biology:   Number(fields.biology.value),
    };

    // Persist via data.js
    if (typeof addLead === 'function') {
      addLead(lead);
    }

    // Success feedback
    showModal(
      'Application Submitted!',
      `Thank you, ${lead.name}! Your admission enquiry for ${lead.course} has been received. We will contact you shortly at ${lead.mobile}.`
    );

    // Reset
    form.reset();
    hasAttemptedSubmit = false;

    // Clear any lingering error states
    Object.keys(fields).forEach((name) => {
      if (fields[name]) clearError(fields[name]);
    });
  });
}

/* ================================================================
   Contact Form
   ================================================================ */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  let hasAttemptedSubmit = false;

  const fields = {
    name:    form.querySelector('[name="name"]'),
    email:   form.querySelector('[name="email"]'),
    phone:   form.querySelector('[name="phone"]'),
    subject: form.querySelector('[name="subject"]'),
    message: form.querySelector('[name="message"]'),
  };

  const validators = {
    name(value) {
      if (!value.trim()) return 'Name is required.';
      if (value.trim().length < 3) return 'Name must be at least 3 characters.';
      return '';
    },
    email(value) {
      if (!value.trim()) return 'Email is required.';
      if (!validateEmail(value)) return 'Enter a valid email address.';
      return '';
    },
    phone(value) {
      if (!value.trim()) return 'Phone number is required.';
      if (!validatePhone(value)) return 'Enter a valid 10-digit phone number.';
      return '';
    },
    subject(value) {
      if (!value.trim()) return 'Subject is required.';
      return '';
    },
    message(value) {
      if (!value.trim()) return 'Message is required.';
      if (value.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    },
  };

  function validateField(name) {
    const field     = fields[name];
    const validator = validators[name];
    if (!field || !validator) return true;

    const error = validator(field.value);
    if (error) {
      showError(field, error);
      return false;
    }
    clearError(field);
    return true;
  }

  function validateAll() {
    let allValid = true;
    for (const name of Object.keys(validators)) {
      if (!validateField(name)) allValid = false;
    }
    return allValid;
  }

  // Real-time validation
  Object.keys(fields).forEach((name) => {
    const field = fields[name];
    if (!field) return;

    field.addEventListener('blur', () => validateField(name));
    field.addEventListener('input', () => {
      if (hasAttemptedSubmit) validateField(name);
    });
  });

  // Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hasAttemptedSubmit = true;

    if (!validateAll()) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulated send (no backend)
    showModal(
      'Message Sent!',
      `Thank you, ${fields.name.value.trim()}! We have received your message and will get back to you within 24–48 hours.`
    );

    form.reset();
    hasAttemptedSubmit = false;

    Object.keys(fields).forEach((name) => {
      if (fields[name]) clearError(fields[name]);
    });
  });
}
