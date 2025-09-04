module.exports.fileterAllowFields=(obj, ...allowFields)=>{
    const newObj={}
    for(let allowField of allowFields){
        if(obj[allowField])
            newObj[allowField]=obj[allowField]
    }
    return newObj;
}
module.exports.removeUnAllowedFields=(obj, ...unAllowedFields)=>{
    for(let field of unAllowedFields){
        delete obj[field];
    }
    return obj;
}

