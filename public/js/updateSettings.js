import axios from 'axios';
import {showAlert} from './alerts'

export const updateData=async(data)=>{
    try{
        const res=await axios({
            method:'patch',
            url:'/api/v1/users/updateMe',
            data
        });
        if(res.data.status==='success'){
            showAlert('Successfully updated','success');
            window.setTimeout(()=>{
                window.location.href='/me';
            }
            ,500);
        }
    }catch(err){
        showAlert("Update Failed","error");
    }

}