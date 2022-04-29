const math = require('mathjs');
const { performance } = require('perf_hooks');
//mathml 
//const { create, all } = require('mathjs');
//const math = create(all);
//const { cMathMLHandler } = require('mathjs-mathml');

const wuzzy = require("wuzzy");
var Normalize = require('./NormalizeInput.js');
var convertM  = require('./dataC.js')
//const DataWarehouse = require('../public/DBJSONDATA/Written/data.js');
const DataWarehouse = require('../public/DBJSONDATA/Written/StructureDB.js');


function treeToArray(node)
{
    let arr = []

    node.traverse(function(node, path, parent)
    {
        arr.push(node);
    });

    return arr;
}
//where we compare nodes, their type and value
function compareArray(nodes1,nodes2,order = false)
{
    var matches = [];
    let len = Math.min(nodes1.length,nodes2.length);

    if(order)
    {
        //console.log(nodes1[0].toString())

        //console.log("b1: ",nodes1);
        //console.log("b2: "+nodes2);

        nodes1 = nodes1.sort((a, b)=> 
        {
            if (a.type === b.type)
            {         
                switch(a.type)
                {
                    case 'OperatorNode':
                        return a.op < b.op ? -1 : 1;                      
                    case 'ConstantNode':
                        return a.value < b.value ? -1 : 1;                   
                    case 'SymbolNode':
                        return a.name < b.name ? -1 : 1;                    
                    case 'FunctionNode':
                        return a.name < b.name ? -1 : 1;                    
                    default:
                        //console.log('Undefined type in sort');           
                }
                //if we reach this something is broken
                return 0;      
            }
            else 
            {
              return a.type < b.type ? -1 : 1;
            }
        });

        
        nodes2 = nodes2.sort((a, b)=> 
        {
            if (a.type === b.type)
            {         
                switch(a.type)
                {
                    case 'OperatorNode':
                        return a.op < b.op ? -1 : 1;                      
                    case 'ConstantNode':
                        return a.value < b.value ? -1 : 1;                   
                    case 'SymbolNode':
                        return a.name < b.name ? -1 : 1;                    
                    case 'FunctionNode':
                        return a.name < b.name ? -1 : 1;                    
                    default:
                        //console.log('Undefined type in sort');           
                }
                //if we reach this something is broken
                return 0;
            }
            else 
            {
              return a.type < b.type ? -1 : 1;
            }
        });
    }

      
    for(let i = 0; i < len; i++)
    {   
        let Type = 
        {
            Operator:false,Constant:false,Symbol:false,Function:false,       

            isAnyMatch:false  
        };
        let match = {Type: Type, Value: false,stringValueSearch:'',stringValueItem:''};
          
        if(nodes1[i].type === nodes2[i].type)
        {
            match.Type.isAnyMatch = true;

            switch(nodes1[i].type)
            {            
                case 'OperatorNode':                                          
                        match.Type.Operator = true;
                        if(nodes1[i].op === nodes2[i].op)
                        {
                            match.Value = true;                           
                        }
                        match.stringValueSearch = nodes1[i].op;

                    break;
                case 'ConstantNode':                        
                        match.Type.Constant = true;   
                                         
                        if(nodes1[i].value === nodes2[i].value)
                        {
                            match.Value = true;                           
                        }
                        match.stringValueSearch = nodes1[i].value;
                        
                    break;
                case 'SymbolNode':                      
                        match.Type.Symbol = true;                   
                        
                        if(nodes1[i].name === nodes2[i].name)
                        {
                            match.Value = true;              
                        }
                        match.stringValueSearch = nodes1[i].name;

                    break;
                case 'FunctionNode':                         
                        match.Type.Function = true;                
                        
                        if(nodes1[i].name === nodes2[i].name)  
                        {              
                            match.Value = true;                        
                        }
                        match.stringValueSearch = nodes1[i].name;
                        
                    break;
                default:
                    //console.log('Undefined node: ' + nodes1[i].toString());                     
            }
        }




        switch(nodes1[i].type)
        {            
            case 'OperatorNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].op)  
                match.stringValueSearch = nodes1[i].op;
                break;
            case 'ConstantNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].value)  
                match.stringValueSearch = nodes1[i].value;                 
                break;
            case 'SymbolNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].name) 
                match.stringValueSearch = nodes1[i].name;                 
                break;
            case 'FunctionNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].name)    
                match.stringValueSearch = nodes1[i].name;                 
                break;
            default:
                //console.log('Undefined node: ' + nodes1[i].toString());                     
        }


        switch(nodes2[i].type)
        {            
            case 'OperatorNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].op)  
                match.stringValueItem = nodes2[i].op;
                break;
            case 'ConstantNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].value)  
                match.stringValueItem = nodes2[i].value;                 
                break;
            case 'SymbolNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].name) 
                match.stringValueItem = nodes2[i].name;                 
                break;
            case 'FunctionNode':
                //console.log(nodes2[i].type + '  ' + nodes2[i].name)    
                match.stringValueItem = nodes2[i].name;                 
                break;
            default:
                //console.log('Undefined node: ' + nodes2[i].toString());                     
        }


        matches.push(match);
               
    } 
    return matches;  
}

function nodeArrayToStr(arr)
{
    let result = [];

    for(let i = 0; i < arr.length; i++)
    {
        //console.log(arr[i].type)
        result.push(arr[i].type);
    }
    return result;
}

function replaceAll(str, find, replace) 
{
    return str.replace(new RegExp(find, 'g'), replace);
}

{
    /*
    README
    String.replaceAll does not work, instead use a global flag "/myString/g" as a parameter in a String.replace() function
    In a global flag strings are used without quotation marks /search/g will work, /"search"/g will not
    
    Order of Conversion:
    1. Roots
    2. Fractions
    3. Common Operators (+,-,/,*,...)
    4. Any leftover LaTEX operators or phrases which have no impact on the ASCIImath
    5. Overlines for infinitely repeating decimals

    
    // Examples of complex expressions that work correctly:
    //  var expression = "\frac{m^2+11m+18}{4(m^2-4)} \div \frac{3m^2+27m}{24m^2-48m}";
    //  var expression = "\dfrac{4x^2 -1}{3x^2 + 10x + 3} \div \dfrac{6x^2 + 5x + 1}{4x^2 - 7x + 3} \times \dfrac{9x^2 + 6x + 1}{8x^2 - 6x + 1}";
    //  var expression = "\left(\dfrac{x}{3} - \dfrac{3}{x}\right)\left(\dfrac{x}{4} + \dfrac{4}{x}\right)";
    //  var expression = "5,\overline{31}";
    //  var expression = "72b^{2}q - 18b^{3}q^{2}";
    //  var expression = "\sqrt[3]{4}";
    //  var expression = "{0,11414541454145 \ldots}";
    //  var expression = "\dfrac{\sqrt[3]{4}}{5}";
    //  var expression = "\dfrac{5}{\sqrt[3]{4}}";

    var mystring = toASCII("\dfrac{4x^2 -1}{3x^2 + 10x + 3} \div \dfrac{6x^2 + 5x + 1}{4x^2 - 7x + 3} \times \dfrac{9x^2 + 6x + 1}{8x^2 - 6x + 1}");
    console.log(mystring);

    // TODO
    //  -summation
    //  -test log base and other trig operators more
    */
}
function toASCII(latexExpression)
{
    var expression = latexExpression;  // Put latex expression here
    if(expression.includes("sqrt")) //Handle roots if any are present in the expression, doing so when no roots are present will cause issues
    {   
        var root = expression.slice(expression.indexOf("sqrt"),expression.indexOf("}{"));   //In this case the root is on the top of the fraction
        if(root == "")  //In this case the root is in the bottom of the fraction
        {
            root = expression.slice(expression.indexOf("sqrt")).slice(0, -1);   //Slice last character, missing brackets
        }
        var substring = root.substr(root.indexOf('sqrt[')+4, root.indexOf("}")); 
        var n = substring.substr(substring.indexOf("[")+1,substring.indexOf("]")-1).replace("[","").replace("]","");
        var x = substring.substr(substring.indexOf("{")+1,substring.indexOf("}")-1).replace(/{/g,"").replace(/}/g,"");

        if(n == 2)
        {
            expression = expression.replace(root, "sqrt("+ x +")" );
        }
        else 
        { 
            expression = expression.replace(root, "nthRoot(" + x + "," + n + ")" );
        }
    }

    if(expression.includes("frac") || expression.includes("\frac")) //replacing variations of \frac will cause issues, need to check before running
    {
        expression = expression.replace(/tfrac/g,"\frac").replace(/dfrac/g,"\frac").replace(/\frac/g, "").replace(/\\frac/g, "").replace(/}{/g, ")/(").replace(/\frac{/g, "(").replace(/}/g, ")"); 
    }

    expression = expression    //These replacements will not cause issues if none of them are present in the expression
        .replace(/\times/g,"*").replace(/div/g,"/").replace(/\ldots/,"...").replace("dot",".").replace(/{/g,"(").replace(/}/g,")")
        .replace(/\left/g,"").replace(/\right/g,"").replace("\displaystyle","").replace(/\mathbb/g,"")
        .replace(/mathrm/g,"").replace(/\text/g,"").replace(/\circ/g,"").replace(/_/g,"").replace(/ /g, ""); 
        
        if(expression.includes("overline")) //Overlines should only be added last, if any are present
        {
            var overline = expression.substr(expression.indexOf('overline'), expression.indexOf(")")+1);
            var substring = overline.substr(overline.indexOf('overline')+9, overline.indexOf(")")).replace("(","").replace(")","").toString();
            var k = substring.toString().length;
            for(let i = 0; i < k; i++)
            {
                substring = substring + "_";
            }
            expression = expression.replace(overline, substring);
        }
    return expression;
}

function toMathJs(str)
{  
    let expression = {original:'', simplified:''};

    let original,simplified;

  // console.log('in:'+ str);

   //str = toASCII(str);

   //console.log('out:'+ str);
 
   try
   {
        //convert math string to mathjs object and simplifies the expression
        //console.log(math.parse(str));
        original = math.parse(str);
        simplified =  math.simplify(original);
   }
   catch
   {
    //    console.log('Error, Could not parse:'+str); 
       
       return null;
   }
        
   expression.original = original;
   expression.simplified = simplified;

  // console.log(expression.original);

    return expression;
}

function StringParse(search, item)
{
    //search.replace(/ /g, ""), item.replace(/ /g, "")
    let answer = wuzzy.ngram(search, item);
    return answer;
}

function TestMathJs(str1,str2)
{   
    let expressions1 = toMathJs(str1);
    let expressions2 = toMathJs(str2);


    let simplifiedNodeArr1 = treeToArray(expressions1.simplified);
    let simplifiedNodeArr2 = treeToArray(expressions2.simplified);

    let NodeArr1 = treeToArray(expressions1.original);
    let NodeArr2 = treeToArray(expressions2.original);



    SortedimplifiedNodeArr1 = simplifiedNodeArr1.sort((a, b)=> 
    {
        if (a.type === b.type)
        {         
            switch(a.type)
            {
                case 'OperatorNode':
                    return a.op < b.op ? -1 : 1;                      
                case 'ConstantNode':
                    return a.value < b.value ? -1 : 1;                   
                case 'SymbolNode':
                    return a.name < b.name ? -1 : 1;                    
                case 'FunctionNode':
                    return a.name < b.name ? -1 : 1;                    
                default:
                    console.log('Undefined type in sort');           
            }
            //if we reach this something is broken
            return 0;      
        }
        else 
        {
          return a.type < b.type ? -1 : 1;
        }
    });
    SortedimplifiedNodeArr2 = simplifiedNodeArr2.sort((a, b)=> 
    {
        if (a.type === b.type)
        {         
            switch(a.type)
            {
                case 'OperatorNode':
                    return a.op < b.op ? -1 : 1;                      
                case 'ConstantNode':
                    return a.value < b.value ? -1 : 1;                   
                case 'SymbolNode':
                    return a.name < b.name ? -1 : 1;                    
                case 'FunctionNode':
                    return a.name < b.name ? -1 : 1;                    
                default:
                    console.log('Undefined type in sort');           
            }
            //if we reach this something is broken
            return 0;      
        }
        else 
        {
          return a.type < b.type ? -1 : 1;
        }
    });







    console.log('\n\nOriginal:\n');

    console.log('\nnode array 1:');
    console.log(expressions1.original.toString())
    for(let i = 0;i<NodeArr1.length;i++)
        console.log(NodeArr1[i].type);

    console.log('\nnode array 2:');
    console.log(expressions2.original.toString())
    for(let i = 0;i<NodeArr2.length;i++)
        console.log(NodeArr2[i].type);




    console.log('\n\nSimplified:\n');

    console.log('\nnode array 1:');
    console.log(expressions1.simplified.toString())
    for(let i = 0;i<simplifiedNodeArr1.length;i++)
        console.log(simplifiedNodeArr1[i].type);

    console.log('\nnode array 2:');
    console.log(expressions2.simplified.toString())
    for(let i = 0;i<simplifiedNodeArr2.length;i++)
        console.log(simplifiedNodeArr2[i].type);


   

    console.log("\nOriginal:\n")
    console.log(compareArray(NodeArr1,NodeArr2));
    console.log("\nSimplified:\n")
    console.log(compareArray(simplifiedNodeArr1,simplifiedNodeArr2));

}

//hanno
function MathParse(search, item)
{
    let nodes_arr1 = search;
    let nodes_arr2 = item;

    //console.log('search');
    //console.log(search[0].toString());
    //console.log('item');
    //console.log(item[0].toString());

    //console.log('search: ',input.toString() /*, nodeArrayToStr(nodes_arr1)*/);
    //console.log('item: ',item.toString() /*, nodeArrayToStr(nodes_arr2)*/);


    //let uplen = Math.max(nodes_arr1.length, nodes_arr2.length);

    //let totalop = nodes_arr1.


    var matches = compareArray(nodes_arr1,nodes_arr2); 
    var Orderedmatches = compareArray(nodes_arr1,nodes_arr2,true); 

    let len = matches.length;

    let OperatorMatch = 0;
    let FunctionMatch = 0;

    let OrderedOperatorMatch = 0;
    let OrderedFunctionMatch = 0;

    let TokenMatch = 0;//number, function, variable or operator
    let ValueMatch = 0;//actual value e.g. 12 or the variable x

    let OrderedTokenMatch = 0;//for when the tokens are ordered
    let OrderedValueMatch = 0;//for when the values are ordered

    //loop through one expression
    for(let i = 0; i < len; i++)
    {
        //unordered
        if(matches[i].Type.isAnyMatch)//on token match
            TokenMatch++; 
        if(matches[i].Value)//on value match
            ValueMatch++;
        if(matches[i].Type.Operator)//on operator match
            OperatorMatch++;
        if(matches[i].Type.Function)//on function match
            FunctionMatch++;

        //ordered
        if(Orderedmatches[i].Type.isAnyMatch)//on token match
            OrderedTokenMatch++; 
        if(Orderedmatches[i].Value)//on value match
            OrderedValueMatch++;
        if(Orderedmatches[i].Type.Operator)//on operator match
            OrderedOperatorMatch++;
        if(Orderedmatches[i].Type.Function)//on function match
            OrderedFunctionMatch++;
    }
    

    TokenMatch = TokenMatch / len,                         ValueMatch = ValueMatch / len;
    OperatorMatch = OperatorMatch / len,                   FunctionMatch = FunctionMatch / len;

    OrderedTokenMatch = OrderedTokenMatch / len,           OrderedValueMatch = OrderedValueMatch / len;
    OrderedOperatorMatch = OrderedOperatorMatch / len,     OrderedFunctionMatch = OrderedFunctionMatch / len;

    
     let Overall = 
     (TokenMatch        * 0.30 + ValueMatch        * 0.40 +
     OrderedTokenMatch * 0.20 + OrderedValueMatch * 0.10) * 0.5 + OrderedOperatorMatch * 0.5;


    // let Overall =
    //     TokenMatch           * 0.05 + ValueMatch           * 0.15 + //20%
    //     OrderedTokenMatch    * 0.02 + OrderedValueMatch    * 0.08 + //10%

    //     OperatorMatch        * 0.20 + FunctionMatch        * 0.20 + //40%
    //     OrderedOperatorMatch * 0.15 + OrderedFunctionMatch * 0.15;  //30%

   
{

    // let ExpressionBeforeSimplify = 
    // {
    //     //asscii
    //     //SearchPlain:searchOriginal.toString({implicit:'show',parenthesis: 'auto'}),
    //     //ItemPlain:itemOriginal.toString({implicit:'show',parenthesis: 'auto'}),

    //     //latex
    //     //SearchLatex:searchOriginal.toTex({implicit:'show',parenthesis: 'auto'}),
    //     //ItemLatex:itemOriginal.toTex({implicit:'show',parenthesis: 'auto'}),

    //     //mathMl
    //     //SearchMathMl:convertM(search),
    //     //ItemMathMl:convertM(item)
    // }

    // let ExpressionAfterSimplify = 
    // {
    //     ///asscii
    //     SearchPlain:searchSimplified.toString({implicit:'show',parenthesis: 'auto'}),
    //     ItemPlain:itemSimplified.toString({implicit:'show',parenthesis: 'auto'}),

    //     //latex
    //     SearchLatex:searchSimplified.toTex({implicit:'show',parenthesis: 'auto'}),
    //     ItemLatex:itemSimplified.toTex({implicit:'show',parenthesis: 'auto'}),

    //     //mathMl
    //     //SearchMathMl:convertM(search),
    //     //ItemMathMl:convertM(item)
    // }
}
    

    let ConfidenceValues = 
    {
        Overall:Overall,

        TokenMatch:TokenMatch,
        ValueMatch:ValueMatch,

        OperatorMatch:OperatorMatch,
        FunctionMatch:FunctionMatch,

        OrderedTokenMatch:OrderedTokenMatch,
        OrderedValueMatch:OrderedValueMatch,

        OrderedOperatorMatch,
        OrderedFunctionMatch
    }


    let result =
    {
        //ExpressionBeforeSimplify:ExpressionBeforeSimplify,
        //ExpressionAfterSimplify:ExpressionAfterSimplify,
        ConfidenceValues:ConfidenceValues
    }

   // console.log(result.ConfidenceValues.Overall);
    return result;
}

//acurate round function to n places
function round(num, decimalPlaces = 0) {
    num = Math.round(num + "e" + decimalPlaces);
    return Number(num + "e" + -decimalPlaces);
}

const DBLen = DataWarehouse.length;
const NormalizedDB = new Array(DBLen), AsciiDB = new Array(DBLen), MathjsDB = new Array(DBLen);

var startTime = performance.now();

for(let i = 0; i < DBLen;i++)
{
    NormalizedDB[i] = Normalize(DataWarehouse[i].Functions);
    AsciiDB[i] = toASCII(DataWarehouse[i].Functions);

    //console.log(AsciiDB[i]);

    let expressions = toMathJs(AsciiDB[i]);
   
    if(expressions != null)
    {
        //console.log(expressions.simplified.toString());

        let simplifiedNodeArr = treeToArray(expressions.simplified);
        let OriginalNodeArr = treeToArray(expressions.original);

        MathjsDB[i] = {expressions,OriginalNodeArr,simplifiedNodeArr};
    }
    else MathjsDB[i] = null;
}
var endTime = performance.now();
console.log('Init Time: '+ (endTime - startTime) + ' milliseconds');


//Both methods
var Engine = (search) =>
{
    startTime = performance.now();

    let normalizedSearch = Normalize(search);
    let AsciiSearch = toASCII(search);

    let searchExpressions = toMathJs(AsciiSearch);
    let OriginalNodeArr,simplifiedNodeArr;



    if(searchExpressions != null)
    {
        OriginalNodeArr = treeToArray(searchExpressions.original);
        simplifiedNodeArr = treeToArray(searchExpressions.simplified);
        //console.log('search:'+ searchExpressions.original);
    }


    var filter = new Array(DBLen);

    
    for(let i = 0; i < DBLen; i++)
    {      
        let item = DataWarehouse[i].Functions;
 
        let mathConfidence = 0, stringConfidence = 0;
      
        //to store results from Hanno method
        let  mathResultsOriginal = {}, mathResultsSimplified = {}, MathJSExpr = {};

        let CanParse = (searchExpressions != null && MathjsDB[i] != null && Math.abs(searchExpressions.original.toString().length - MathjsDB[i].expressions.original.toString()) < 6);
       
        //use this if we can parse the function
        if(CanParse)
        {
            MathJSExpr = 
            {
                SearchOriginal:searchExpressions.original.toString(),
                ItemOriginal:MathjsDB[i].expressions.original.toString(),

                SearchSimplified:searchExpressions.simplified.toString(),
                ItemSimplified:MathjsDB[i].expressions.simplified.toString()
            }
            //console.log(MathJSExpr);

            mathResultsSimplified = MathParse(simplifiedNodeArr,MathjsDB[i].simplifiedNodeArr);
            mathResultsOriginal = MathParse(OriginalNodeArr,MathjsDB[i].OriginalNodeArr);

            //console.log(mathResultsOriginal)

            //console.log('simplified:'+mathResultsSimplified.ConfidenceValues.Overall);
           // console.log('orig:'+mathResultsOriginal.ConfidenceValues.overall);

            mathConfidence = Math.max(mathResultsSimplified.ConfidenceValues.Overall/*, mathResultsOriginal.ConfidenceValues.overall*/);

            //console.log(mathResults.ExpressionBeforeSimplify.SearchPlain);
            //console.log(mathResults.ExpressionBeforeSimplify.ItemPlain);

            //we use both hanno's string simplify methods and christian's and see wich one gets the best match
            stringConfidence = Math.max
            (            
                //StringParse(MathJSExpr.SearchOriginal, MathJSExpr.ItemOriginal),           
                StringParse(search, item),
                StringParse(normalizedSearch, NormalizedDB[i])
            );       
        }
        else
        {
            mathConfidence = 0; 
            
            //using string without any changes and only christian's normilization
            stringConfidence = Math.max
            (            
                StringParse(search, item),
                StringParse(normalizedSearch, NormalizedDB[i])
            );          
        }
 
        let expressions = 
        {
            SearchMathMl:convertM(search),
            ItemMathMl:convertM(item)
        }

        let overall = 0;

        if(search === item)
            overall = 1;
        else if(mathConfidence == 0)
            overall = stringConfidence;
        else               
            overall = mathConfidence * 0.4 + stringConfidence * 0.6;
        
        if(MathJSExpr != null)
        {
            if(MathJSExpr.SearchOriginal === MathJSExpr.ItemOriginal)
                overall = 1;
            else if(MathJSExpr.SearchSimplified === MathJSExpr.ItemSimplified)
                overall = 0.9;
        }
        if(stringConfidence === 1)
            overall = 1;

        
        //if we could not parse the expression in mathml, mathResults will be null but Overal confidence will still work
        let result = 
        {
            //from mathjs, can be null
            //mathResults: mathResults,

            mathResultsSimplified: mathResultsSimplified,
            mathResultsOriginal: mathResultsOriginal,


            //from database and user
            expressions:expressions,
            MathJSExpr:MathJSExpr,

            stringConfidence:stringConfidence,
            mathConfidence:mathConfidence,


            OverallConfidence: round(overall*100.0, 3)
        }

        filter[i] = result; 
    }
    

    //filter with both methods combined
    filter = filter.sort(function (a, b) 
    {
        //math
         //return a.mathConfidence > b.mathConfidence ? -1 : 1
        //strings
        //return a.stringConfidence > b.stringConfidence ? -1 : 1
        //overal
        return a.OverallConfidence > b.OverallConfidence ? -1 : 1
    });

    endTime = performance.now();
    console.log('Search Time: '+ (endTime - startTime) + ' milliseconds');

    return filter;
}

// 6d -9r +2t^{5}d -3t^{5}r 
//r * (-(3 * t ^ 5) - 9) + d * (2 t ^ 5 + 6)
 //console.log('\n\nArray:\n',Engine('6d -9r +2t^{5}d -3t^{5}r '));
//console.log(Engine('6d -9r +2t^{5}d -3t^{5}r ')[0].mathResults);

//console.log(convertM('6d -9r +2t^{5}d -3t^{5}r'))
//console.log(Engine('6d -9r +2t^{5}d -3t^{5}r ')[0].expressions.SearchMathMl);
var q= '\\frac{ y-3}{3}';

let eng = Engine(q.slice(1));

for(let i = 0; i < 3; i++)
  console.log(eng[i]);



//TestMathJs('y-3/3','2/3');


module.exports = Engine;