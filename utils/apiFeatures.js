
class APIFeatures{
    constructor(query,queryReq){
        this.query=query;
        this.queryReq=queryReq;
    }
    filter(){
        const queryObj={...this.queryReq};
        const excludedFields=['page','sort','limit','fields'];
        excludedFields.forEach(el=>delete queryObj[el]);
        
        //Advanced filtering
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`); 
        //regex to match the string and add $ before it

        this.query= this.query.find(JSON.parse(queryStr)); 
        return this;
    }
    sort(){
        if(this.queryReq.sort){
            const sortBy=this.queryReq.sort.split(',').join(' ');
            this.query=this.query.sort(sortBy);
        }else{
            this.query=this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(){
        if(this.queryReq.fields){
            const fields=this.queryReq.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }else{
            this.query=this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        const page=this.queryReq.page*1||1;
        const limit=this.queryReq.limit*1||100;
        const skip=(page-1)*limit;
        this.query=this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports=APIFeatures;