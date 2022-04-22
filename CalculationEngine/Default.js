
var Boilerplate = ()=>{
    var datar = "Input data so we can search";
    //array holding data
    var filter = 
    [{confidence: 0, Func: `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
    <mfrac>
    <mrow>
    <mi>y</mi>
    <mo>−</mo>
    <mn>3</mn>
    </mrow>
    <mn>3</mn>
    </mfrac>
    </math>`, Cat: 'linear'}];

    obj = {
        "query": datar,
        "boiler": filter    
    }
    return obj;
}
module.exports = Boilerplate;