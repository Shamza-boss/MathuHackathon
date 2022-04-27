var mjAPI = require("mathjax-node");

var dataConverter = function(input){
      let datar = "";
      
      mjAPI.typeset({
        math: input,
        format: "TeX", // or "inline-TeX", "MathML"
        mml:true,      // or svg:true, or html:true
      }, function (data) {
        if (!data.errors) {
            // console.log(data.mml)
            //pushing collected data to global array... datar
            datar = data.mml;
          }
      });
    //  console.log(datar)
    return datar;
};

module.exports = dataConverter;



