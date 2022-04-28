var Jimp = require("jimp")

function clarifyImage(directory, filename = '')
{
    var filestring = directory.concat(filename);
    Jimp.read(filestring).then(function (image) 
    {
        image
        .color([{apply: 'desaturate', params: [90]}])
        .contrast(1)
        //.greyscale() <------ Desaturation works better than the greyscale, brightening images causes issues
        .write("OCR_Ready_Image.png");
    })
}

module.exports = clarifyImage;