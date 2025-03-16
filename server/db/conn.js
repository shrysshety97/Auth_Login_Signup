const mongoose = require("mongoose");


const DB = "mongodb+srv://ShreyasBase:kHTZVDJDrkH7qx62@cluster0.d5ovbqi.mongodb.net/Authusers?retryWrites=true&w=majority"

mongoose.connect(DB).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})