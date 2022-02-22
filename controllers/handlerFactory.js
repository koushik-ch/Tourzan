const AppError=require('../utils/appError');
const APIFeatures=require('../utils/apiFeatures');

exports.deleteOne= Model=>async (req,res,next)=>{
    try{
        const doc=await Model.findByIdAndDelete(req.params.id);
        if(!doc){
            return next(new AppError('No document found with that ID',404));
        }
    
        res.status(204).json({
            status:'success',
            data:null,
        })
    }catch(err){
    next(err);
    }
}

exports.updateOne=Model=>async (req,res,next)=>{
    try{
        const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true, //Return the updated document after updating
            runValidators:true //Runs the validators on the updated document
        });

        if(!doc){
            return next(new AppError(`No document found with id ${req.params.id}`,404));
        }

        res.status(200).json({
            status:'success',
            data:{
                doc
            }
        })

    }catch(err){
        next(err);
    }
}

exports.createOne=Model=>async (req,res,next)=>{
    try{
        const doc=await Model.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                data:doc
            }
        })
    }catch(err){
        next(err);
    }
}

exports.getOne=(Model,popOptions)=>async (req,res,next)=>{
    try{
        let query=Model.findById(req.params.id);
        if(popOptions){
            query=query.populate(popOptions);
        }
        const doc=await query;

        if(!doc){
            return next(new AppError(`No document found with id ${req.params.id}`,404));
        }
        res.status(200).json({
            status:'success',
            data:{
                data:doc
            }
        })
    }catch(err){
        next(err);
    }
}

exports.getAll=Model=>async (req,res,next)=>{
    try{
        // To allow nested GET requests for tour reviews
        let filter={};
        if(req.params.tourId) filter.tour=req.params.tourId
        const queryObj=new APIFeatures(Model.find(filter),req.query)
        .filter().
        sort().
        limitFields().
        paginate();

        const doc=await queryObj.query;

        res.status(200).json({
            status:'success',
            results:doc.length,
            data:{
                data:doc
            }
        })
    }catch(err){
        next(err);
    }
}