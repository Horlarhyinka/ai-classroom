
export default (err: any) =>{
    if(err.code == 11000){
        return [`${Object.keys(err.keyValue)[0]} is taken`]
    }else if(err._message?.includes("validation failed")){
        const errMessage = []
        for(let key of Object.keys(err.errors)){
            errMessage.push(err.errors[key].properties?.message)
        }
        return errMessage
    }else{
        return null
    }
    
}