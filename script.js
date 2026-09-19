const form = document.querySelector('#registration-form');
const signatureCanvas = document.querySelector('#signature-pad');
const clearSignatureButton = document.querySelector('#clear-signature');
const districtField = document.querySelector('#district');
const blockField = document.querySelector('#block');
const submissionDateTime = document.querySelector('#submissionDateTime');
const successState = document.querySelector('#success-state');
const formStatus = document.querySelector('#form-status');

let drawingContext;
let isDrawing = false;
let hasSignature = false;

function resizeSignatureCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const bounds = signatureCanvas.getBoundingClientRect();
  const previousSignature = hasSignature ? signatureCanvas.toDataURL() : null;
  signatureCanvas.width = bounds.width * ratio;
  signatureCanvas.height = bounds.height * ratio;
  drawingContext = signatureCanvas.getContext('2d');
  drawingContext.scale(ratio, ratio);
  drawingContext.strokeStyle = '#552d38';
  drawingContext.lineWidth = 2.2;
  drawingContext.lineCap = 'round';
  drawingContext.lineJoin = 'round';
  if (previousSignature) {
    const image = new Image();
    image.onload = () => drawingContext.drawImage(image, 0, 0, bounds.width, bounds.height);
    image.src = previousSignature;
  }
}

function pointerPosition(event) {
  const bounds = signatureCanvas.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

function beginSignature(event) {
  isDrawing = true;
  hasSignature = true;
  signatureCanvas.setPointerCapture(event.pointerId);
  const position = pointerPosition(event);
  drawingContext.beginPath();
  drawingContext.moveTo(position.x, position.y);
}

function drawSignature(event) {
  if (!isDrawing) return;
  const position = pointerPosition(event);
  drawingContext.lineTo(position.x, position.y);
  drawingContext.stroke();
}

function endSignature() {
  isDrawing = false;
}

function clearSignature() {
  drawingContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  hasSignature = false;
  clearError('digitalSignature');
}

function setError(fieldName, message) {
  const field = document.querySelector(`#${fieldName}`);
  const wrapper = field ? field.closest('.field') : document.querySelector(`.${fieldName === 'documentationConsent' ? 'consent-panel' : 'signature-panel'}`);
  const error = document.querySelector(`#${fieldName}-error`);
  if (wrapper) wrapper.classList.add('invalid');
  if (error) error.textContent = message;
}

function clearError(fieldName) {
  const field = document.querySelector(`#${fieldName}`);
  const wrapper = field ? field.closest('.field') : document.querySelector(`.${fieldName === 'documentationConsent' ? 'consent-panel' : 'signature-panel'}`);
  const error = document.querySelector(`#${fieldName}-error`);
  if (wrapper) wrapper.classList.remove('invalid');
  if (error) error.textContent = '';
}

function validateForm() {
  const requiredFields = ['fullName', 'designation', 'organisation', 'organisationType', 'district', 'email', 'mobileNumber'];
  let firstInvalid = null;
  requiredFields.forEach((fieldName) => {
    const field = document.querySelector(`#${fieldName}`);
    if (!field.value.trim()) {
      setError(fieldName, 'This field is required.');
      firstInvalid ||= field;
    } else if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
      setError(fieldName, 'Please enter a valid email address.');
      firstInvalid ||= field;
    } else if (fieldName === 'mobileNumber' && !/^[6-9]\d{9}$/.test(field.value.replace(/\D/g, ''))) {
      setError(fieldName, 'Enter a valid 10-digit Indian mobile number.');
      firstInvalid ||= field;
    } else clearError(fieldName);
  });

  const alternate = document.querySelector('#alternateContactNumber');
  if (alternate.value.trim() && !/^[6-9]\d{9}$/.test(alternate.value.replace(/\D/g, ''))) setError('alternateContactNumber', 'Enter a valid 10-digit Indian mobile number.');
  else clearError('alternateContactNumber');

  if (!document.querySelector('input[name="documentationConsent"]:checked')) {
    setError('documentationConsent', 'Please choose one consent option.');
    firstInvalid ||= document.querySelector('input[name="documentationConsent"]');
  } else clearError('documentationConsent');
  if (!hasSignature) {
    setError('digitalSignature', 'Please add your signature before submitting.');
    firstInvalid ||= signatureCanvas;
  } else clearError('digitalSignature');
  if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return !firstInvalid;
}

// FUTURE BACKEND INTEGRATION
// Replace the simulated submission below with a POST request
// to the CINI server/API when the backend endpoint is provided.
async function submitRegistration(data) {
  return new Promise((resolve) => window.setTimeout(() => resolve({ ok: true, data }), 450));
}

function collectFormData() {
  const formData = new FormData(form);
  return {
    fullName: formData.get('fullName').trim(),
    designation: formData.get('designation').trim(),
    organisation: formData.get('organisation').trim(),
    organisationType: formData.get('organisationType'),
    state: formData.get('state'),
    district: formData.get('district'),
    block: formData.get('block') || '',
    email: formData.get('email').trim(),
    mobileNumber: formData.get('mobileNumber').trim(),
    alternateContactNumber: (formData.get('alternateContactNumber') || '').trim(),
    documentationConsent: formData.get('documentationConsent'),
    digitalSignature: signatureCanvas.toDataURL('image/png'),
    submissionDateTime: new Date().toISOString()
  };
}

districtField.addEventListener('change', () => {
  blockField.disabled = !districtField.value;
  blockField.innerHTML = districtField.value
    ? '<option value="">Select block (optional)</option><option>To be confirmed</option>'
    : '<option value="">Select a district first</option>';
});
signatureCanvas.addEventListener('pointerdown', beginSignature);
signatureCanvas.addEventListener('pointermove', drawSignature);
signatureCanvas.addEventListener('pointerup', endSignature);
signatureCanvas.addEventListener('pointercancel', endSignature);
clearSignatureButton.addEventListener('click', clearSignature);
window.addEventListener('resize', resizeSignatureCanvas);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';
  if (!validateForm()) return;
  const submitButton = form.querySelector('.submit-button');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';
  const registration = collectFormData();
  await submitRegistration(registration);
  submissionDateTime.value = new Date(registration.submissionDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  form.hidden = true;
  document.querySelector('.registration-section .section-heading').hidden = true;
  successState.hidden = false;
  successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

resizeSignatureCanvas();