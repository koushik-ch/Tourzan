import axios from 'axios';
import {showAlert} from './alerts';

export const signup= async(name,email,password,passwordConfirm)=>{
    console.log(email,password);
    try{
        const res=await axios({
            method:'post',
            url:'http://localhost:3000/api/v1/users/signup',
            data:{
                name,
                email,
                password,
                passwordConfirm,
            }
        });
        if(res.data.status==='success'){
            showAlert('SignupSuccessful','success');
            window.setTimeout(()=>{
                window.location.href='/';
            },1000);
        }
    }catch(err){
        showAlert("Signup failed","error");
    }

}