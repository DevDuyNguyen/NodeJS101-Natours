class appError extends Error{
    constructor(message, statusCode, status){
        super(message);
        this.statusCode=statusCode;
        this.status=status;
        this.isOperationalError=true;
    }
}

module.exports=appError;