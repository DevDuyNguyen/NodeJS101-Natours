async function updateUserSetting(name, email){
    try {
        let response=await axios({
            method:'patch',
            url:'/api/v1/users/updateMe',
            data:{
                name:name,
                email:email
            }
        });
        if(response.data.status==='success'){
            alert('You have successfully update your account');
            window.setTimeout(()=>{
                location.reload()
            },1500);
        }

    } catch (error) {
        alert(error.message);
    }
}

async function updatePassword(oldPass, newPass, confirmPass){
    try {
        let response=await axios({
            method:'patch',
            url:'/api/v1/users/updatePassword',
            data:{
                postedPassword:oldPass,
                newPassword:newPass,
                passwordConfirm:confirmPass
            }
        });
        if(response.data.status==='success'){
            alert('You have successfully update your password');
        }

    } catch (error) {
        alert(error.message);
    }
}


let updateUserDataForm=document.querySelector('.form-user-data');
let updatePasswordForm=document.querySelector('.form-user-settings');


if(updateUserDataForm){
    updateUserDataForm.addEventListener('submit', event=>{
        event.preventDefault();
        let email=document.getElementById('email').value;
        let name=document.getElementById('name').value;
        updateUserSetting(name, email);
    });
}
if(updatePasswordForm){
    updatePasswordForm.addEventListener('submit', async (event)=>{
        event.preventDefault();
        let oldPass=document.getElementById('password-current').value;
        let newPass=document.getElementById('password').value;
        let confirmPass=document.getElementById('password-confirm').value;
        let saveBtn=document.querySelector('.btn--save-user');
        const oldStr=saveBtn.innerHTML;
        saveBtn.innerHTML='Updating...';
        await updatePassword(oldPass, newPass,confirmPass);
        saveBtn.innerHTML=oldStr;
        document.getElementById('password-current').value='';
        document.getElementById('password').value='';
        document.getElementById('password-confirm').value='';
    })
}


