const submitButton = document.getElementById('subButton');
const newPassword = document.getElementById('textbox1');
const confirmPassword = document.getElementById('textbox2');
const message = document.getElementById('message');

let newpass = '';
let confirmPass = '';

submitButton.addEventListener('click', () => {
    if (newPassword.value.trim() == '') {
        alert('Please fill out this field.');
    } else if (confirmPassword.value.trim() == '') {
        alert('Please fill out this field.');
    } else {
        newpass = newPassword.value;
        confirmPass = confirmPassword.value;
        if (newpass == confirmPass) {
            message.textContent = "Password successfully changed!";
            message.className = "success";
        } else {
            message.textContent = "Passwords do not match. Please try again.";
            message.className = "error";
        }
    }

});