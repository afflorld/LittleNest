document.getElementById('contact_form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submit_btn');
  const resultDiv = document.getElementById('result');
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Odosielanie...</span>';
  
  // Get form data
  const formData = new FormData(form);
  
  // Send POST request
  fetch(form.action, {
    method: 'POST',
    body: new URLSearchParams(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      resultDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      form.reset();
    } else {
      resultDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    }
  })
  .catch(error => {
    resultDiv.innerHTML = `<div class="alert alert-danger">Nastala chyba pri odosielaní: ${error.message}</div>`;
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Odoslať správu</span>';
  });
});
