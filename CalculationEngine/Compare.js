let wuzzy = require("wuzzy");
var mjAPI = require("mathjax-node");
const DataWarehouse = require('../public/DBJSONDATA/Written/StructureDB.js');

//this solution is better than using a loop as we have access to all the data globaly as if it where an actual object
//text fuzzy similar jaccard jarowinkler tanimoto levenshtein ngram
// var input = ' 6d -9r +2t^{5}d -3t^{5}r ';
//console.log(DataWarehouse[0].Functions);
var filter = [];
var search = function(input){
    
    //funtion to retrieve from DBJSONDATA and compare
    for(var i = 0; i < DataWarehouse.length; i++){

       let answer = wuzzy.ngram(input, DataWarehouse[i].Functions);
  
      if(answer>0.4){
          mjAPI.typeset({
            math: DataWarehouse[i].Functions,
            format: "TeX", // or "inline-TeX", "MathML"
            mml:true,      // or svg:true, or html:true
          }, function (data) {
            if (!data.errors) {
              //  console.log(data.mml)
                answer = Math.floor(answer*100)
                //console.log(answer)
                filter.push({confidence: answer, Func: data.mml, Cat: DataWarehouse[i].Category});
              }
          });
      }
  }
  filter.sort(function (a, b) { return a.confidence > b.confidence ? -1 : 1});
  return filter;
};
module.exports = search;


