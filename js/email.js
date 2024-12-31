function sendMail(){

    let parms={

        name:document.getElementById('name').value,
        email:document.getElementById('email').value,
        subject:"Rezervacia",
        message:document.getElementById('message').value,
        date : new Date().toLocaleString(),
        reply_to: document.getElementById('email').value,
    };

    if(parms.name=="" || parms.email=="" || parms.message==""){
        alert("Vyplňte všetky údaje!");
        return;
    }else{
        emailjs.send("service_aqrklk3","template_8jp5xrn",parms).then(alert("Ďakujeme za vašu rezerváciu!"));
    }

}
