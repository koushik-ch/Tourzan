const mongoose = require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path:'./config.env'});

process.on('uncaughtException',err=>{
    console.log('uncaughtRejection',err.message);
    process.exit(1);
    
})

const app=require('./app');

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
})
 
const port=process.env.PORT||3000;
const server=app.listen(port,()=>{
    console.log(`listening on port ${port}`);
});

process.on('unhandledRejection',err=>{
    console.log('unhandledRejection',err.message);
    server.close(()=>{
        process.exit(1);
    })
    
})
