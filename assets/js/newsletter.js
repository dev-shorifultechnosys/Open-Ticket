/* ==========================================================================
   SECTION 07 — NEWSLETTER FORM
   HTML5 validation + progressive API integration. There is intentionally NO
   fake subscriber storage and NO fabricated success message. The actual API
   endpoint must be provided by the Open Tickets development team.
   ========================================================================== */
(() => {
  'use strict';
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailField = form.querySelector('#newsletterEmail');
  const submitButton = form.querySelector('button[type="submit"]');
  const feedback = document.getElementById('newsletterFeedback');

  function message(text, state = 'info') {
    feedback.textContent = text;
    feedback.dataset.state = state;
  }

  emailField.addEventListener('input', () => {
    emailField.removeAttribute('aria-invalid');
    if (feedback.textContent) message('');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    emailField.value = emailField.value.trim();

    if (!emailField.checkValidity()) {
      emailField.setAttribute('aria-invalid', 'true');
      message('Please enter a valid email address.', 'error');
      emailField.focus();
      return;
    }

    // A real HTTP subscription endpoint is required. Do not claim success
    // in a static preview or retain email addresses without client approval.
    const endpoint = form.dataset.subscribeEndpoint?.trim();
    if (!endpoint) {
      message('Newsletter sign-ups are not connected in this design preview.', 'info');
      return;
    }

    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    message('Submitting your subscription request…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: emailField.value }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Subscription endpoint returned ${response.status}`);
      message('Thank you! Your subscription request was received.', 'success');
      form.reset();
    } catch (error) {
      message(error.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : 'We could not submit your request. Please try again later.', 'error');
    } finally {
      clearTimeout(timeout);
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
