function sendMail(){

    let parms={

        name:document.getElementById('name').value,
        email:document.getElementById('email').value,
        subject:"Rezervacia",
        message:document.getElementById('message').value,


        
    
    };

    emailjs.send("service_aqrklk3","template_8jp5xrn",parms).then(alert("Dakujeme za vasu rezervaciu!"));


}
