class ModelDoesNotExist extends Error{
    constructor(message, code){
        super(message);
        this.name="ModelDoesNotExist";
        this.code=code;
    }
}

module.exports.ModelDoesNotExist=ModelDoesNotExist;