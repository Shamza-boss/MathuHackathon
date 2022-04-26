const DataWarehouse = require('./StructureDB.js');
const fs = require('fs');
const { typeOf } = require('mathjs');

let myData = [];

for (let i = 0; i < DataWarehouse.length; i++) {

    let func = DataWarehouse[i].Functions;
    
    if (func !== '' && typeof func.Functions !== undefined) {
        func = func.replace(/ +/g, ''); //removes all white space
        func = func.replace(/[/]+/g, " / ");
        func = func.replace(/[-]+/g, " - ");
        func = func.replace(/[+]+/g, " + ");
        func = func.replace(/[*]+/g, " * ");
        func = func.replace(/[\n\r]+/g, "");
    }
    myData.push("{\"Functions\":\" " + func + " \"}\n");
}

console.log(myData);

let outputString = "module.exports = [" + myData.toString() + "]";

fs.writeFile('data.js', outputString , (err) => {
    if (err) {
        //console.error(err);
        return
    }
});