var multer = require("multer");

//store uploaded images on the server
var storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/images');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
})

module.exports = storage;