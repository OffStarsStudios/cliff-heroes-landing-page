/* ============================================================
   /unsubscribe — self-serve opt-out

   Brevo puts an unsubscribe link in every campaign, but someone who
   confirms and then changes their mind before the first campaign has
   nothing to click. This page is that route.
   ============================================================ */
(function () {
  'use strict';

  var form = document.querySelector('.unsub__form');
  if (!form) return;

  var input = form.querySelector('.unsub__input');
  var submit = form.querySelector('.unsub__submit');
  var note = document.querySelector('.unsub__note');

  // Same rule as the signup form and the API.
  var EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  function setNote(text, cls) {
    note.className = 'unsub__note' + (cls ? ' ' + cls : '');
    note.textContent = text;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = (input.value || '').trim();

    if (!EMAIL_RE.test(value) || value.length > 254) {
      setNote('Enter the email address you signed up with.', 'unsub__note--err');
      input.focus();
      return;
    }
    if (submit.disabled) return;

    submit.disabled = true;
    var rest = submit.textContent;
    submit.textContent = 'WORKING…';

    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: value })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        return { ok: r.ok && data.ok, status: r.status };
      });
    }).catch(function () {
      return { ok: false, status: 0 };
    }).then(function (result) {
      submit.disabled = false;
      submit.textContent = rest;
      if (result.ok) {
        // Deliberately the same wording whether or not the address was on the
        // list. Saying "you weren't subscribed" would turn this into a way to
        // check who is.
        setNote("Done — that address won't hear from us again.", 'unsub__note--ok');
        form.reset();
      } else if (result.status === 429) {
        setNote('Too many attempts — please wait a few minutes and try again.', 'unsub__note--err');
      } else {
        setNote('Something went wrong. Email supportoffstars@gmail.com and we will remove you.',
                'unsub__note--err');
      }
    });
  });
})();
