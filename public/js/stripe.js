import axios from 'axios';
import { showAlert } from './alerts';
const stripe=Stripe('pk_test_51KVnPESB43Ul39g9e7ymTcSbCvAHl3nbsYWC7lfriFTqUb7G4umdNztkCwD3dySfHcjLtZ5o9ztKUevVP3wsiQ3O009dqvZbrQ')

exports.bookTour=async tourId=>{
    try{
        //Get checkout session from API
        const session=await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        
        //Create checkout form
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })

    }catch(err){
        console.log(err);
        showAlert('Error, Payment failed', 'error');
    }
}
