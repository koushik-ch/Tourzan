import axios from 'axios';
import {showAlert} from './alerts';

export const login= async(email,password)=>{
    console.log(email,password);
    try{
        const res=await axios({
            method:'post',
            url:'http://localhost:3000/api/v1/users/login',
            data:{
                email,
                password
            }
        });
        if(res.data.status==='success'){
            showAlert('Login Successful','success');
            window.setTimeout(()=>{
                window.location.href='/';
            },1000);
        }
    }catch(err){
        showAlert("Login Failed, Incorrect email or password","error");
    }

}

export const logout=async()=>{
    try{
        const res=await axios({
            method:'GET',
            url:'http://localhost:3000/api/v1/users/logout'
        });
        if(res.data.status==='success'){
            showAlert('Successfully logged out','success');
            window.setTimeout(()=>{
                window.location.href='/';
            },500);
        }
    }catch(err){
        showAlert("Logout Failed","error");
    }
    
}
    

