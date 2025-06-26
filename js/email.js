document.getElementById('contact_form').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submit_btn');
    const resultDiv = document.getElementById('result');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Odosielanie...</span>';

 grecaptcha.ready(function() {
    grecaptcha.execute('6Lfxq24rAAAAADfe75STwdPZYbbMj2tb5goP141o', { action: 'submit' }).then(function(token) {
      const formData = new FormData(form);
      formData.append('token', token);

    fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
 });
});
