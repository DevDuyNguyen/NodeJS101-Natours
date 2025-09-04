async function login(email, password){
    try {
        let response=await axios({
            method:'post',
            url:'/api/v1/users/login',
            data:{
                email:email,
                password:password
            }
        })
        console.log(response.data.status);
        
        if(response.data.status==='success'){
            alert('You have logged in');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500)
        }
    } catch (error) {
        alert(error.response.data.message);
    }
}

async function logout(){
    try{
        let response=await axios({
            url:'/api/v1/users/logout',
            method:'get'
        });
        if(response.data.status==='success')
            location.reload();
    }
    catch(error){
        alert(error.message);
    }
}

//DOM element
let logoutBtn=document.querySelector('.nav__el.nav__el--logout');
let loginForm=document.querySelector('.form--login');

//DOM manipulation

if(loginForm)
    loginForm.addEventListener('submit', event=>{
        event.preventDefault();
        let email=document.getElementById('email').value;
        let password=document.getElementById('password').value;
        login(email, password);

    })
if(logoutBtn)
    logoutBtn.addEventListener('click', logout);

