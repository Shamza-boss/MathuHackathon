var stringSimilarity = require("string-similarity");
let wuzzy = require("wuzzy")
let stringComparison = require('string-comparison')
const DataWarehouse = require('./StructureDB.js');

//this solution is better than using a loop as we have access to all the data globaly as if it where an actual object
//text fuzzy similar jaccard jarowinkler tanimoto levenshtein ngram
var input = ' 6d -9r +2t^{5}d -3t^{5}r ';
let cos = stringComparison.cosine
var filter = [];
//console.log(DataWarehouse[0].Functions);
for(var i = 0; i < DataWarehouse.length; i++){
    
    // var answer = cos.similarity(input, DataWarehouse[i].Functions);
     let answer = wuzzy.ngram(input, DataWarehouse[i].Functions);

    if(answer>0.4){
        console.log(DataWarehouse[i].Functions)
        console.log(DataWarehouse[i].Category)
        console.log(input);
        filter.push({confidence: answer, Func: DataWarehouse[i].Functions, Cat: DataWarehouse[i].Category});
        console.log(answer);
    }
    
}
filter.sort(function (a, b) { return a.confidence > b.confidence ? -1 : 1});
//filter.sort
console.log(filter)


// var matches = stringSimilarity.findBestMatch(input, filter);
// console.log(matches.bestMatch)


