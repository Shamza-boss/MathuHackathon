const math = require('mathjs');

//mathml 
//const { create, all } = require('mathjs');
//const math = create(all);
//const { cMathMLHandler } = require('mathjs-mathml');

const wuzzy = require("wuzzy");
var Normalize = require('./NormalizeInput.js');
var convertM  = require('./dataC.js')
const DataWarehouse = require('../public/DBJSONDATA/Written/data.js');


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
                    console.log('Undefined node: ' + nodes1[i].toString());                     
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
                console.log('Undefined node: ' + nodes1[i].toString());                     
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
                console.log('Undefined node: ' + nodes2[i].toString());                     
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
        expression = expression.replace(/tfrac/g,"\frac").replace(/dfrac/g,"\frac").replace(/\frac/g, "").replace(/}{/g, ")/(").replace(/\frac{/g, "(").replace(/}/g, ")"); 
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
    let original, simplified;

   //console.log('in:'+ str);

   str = toASCII(str);

   //console.log('out:'+ str);

   
   try
   {
        //convert math string to mathjs object and simplifies the expression
        original = math.parse(str);
        simplified =  math.simplify(original);
   }
   catch
   {
    //    console.log('Error, Could not parse:'+str); 
       
       return [null,null];
   }
        
    return [original, simplified];
}

// create a custom function
function Summation(variter,start,stop,expression) //sum(k, 0, n, (-1)^k*(x^(2*k+1))/(2*k+1)! )
{
    if((Math.abs(stop - start)) > 10000)
    {
        console.log('summation range too large!');
    }

    let res = 0;

    for(let i = start;i<=stop;i++)
    {
        let expr = expression.replaceAll(expression,variter,i)
        console.log(expr);
        res += math.parse(expr).evaluate();
    }
    return res
}

// attach a transform function to the function addIt
Summation.transform = function (variter,start,stop,expression) //sum(k, 0, n, (-1)^k*(x^(2*k+1))/(2*k+1)! )
{
    //console.log('input: a=' + a + ', b=' + b)
    // we can manipulate input here before executing addIt
  
    const res = Summation(variter,start,stop,expression)
  
    console.log('result: ' + res)
    // we can manipulate result here before returning
  
    return res;
}




function StringParse(search, item)
{
    //we can remove replace here?
    let answer = wuzzy.ngram(search.replace(/ /g, ""), item.replace(/ /g, ""));
    return answer;
}

//hanno
function MathParse(search, item)
{
    let [searchOriginal, searchSimplified] = toMathJs(search);
    let [itemOriginal, itemSimplified] = toMathJs(item);

    if(searchOriginal == null || itemOriginal == null)   
        return null;
    
    //console.log('originalsearch: '+searchOriginal);
    //console.log('originalitem: '+itemOriginal);

    let nodes_arr1, nodes_arr2;

    //try
    //{
        nodes_arr1 = treeToArray(searchSimplified);
        nodes_arr2 = treeToArray(itemSimplified);
    // }
    // catch
    // {
    //     console.log('search original:'+searchOriginal);
    //     console.log('search simplified:'+searchSimplified)
       

    //     console.log('item original:'+itemOriginal);
    //     console.log('item simplified:'+itemSimplified);

    //     //console.log(searchSimplified.toString());
    //     //console.log(itemSimplified.toString());
    // }


    //console.log('search: ',input.toString() /*, nodeArrayToStr(nodes_arr1)*/);
    //console.log('item: ',item.toString() /*, nodeArrayToStr(nodes_arr2)*/);

    var matches = compareArray(nodes_arr1,nodes_arr2); 
    var Orderedmatches = compareArray(nodes_arr1,nodes_arr2,true); 

    let len = matches.length;

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
        //ordered
        if(Orderedmatches[i].Type.isAnyMatch)//on token match
            OrderedTokenMatch++; 
        if(Orderedmatches[i].Value)//on value match
            OrderedValueMatch++;
    }

    TokenMatch = TokenMatch / len,ValueMatch = ValueMatch / len;
    OrderedTokenMatch = OrderedTokenMatch / len, OrderedValueMatch = OrderedValueMatch / len;

    //70% to 30% ratio
    let Overall = TokenMatch * 0.49 + ValueMatch * 0.21 + OrderedTokenMatch * 0.20 + OrderedValueMatch * 0.10

   


    let ExpressionBeforeSimplify = 
    {
        //asscii
        SearchPlain:searchOriginal.toString({implicit:'show',parenthesis: 'auto'}),
        ItemPlain:itemOriginal.toString({implicit:'show',parenthesis: 'auto'}),

        //latex
        SearchLatex:searchOriginal.toTex({implicit:'show',parenthesis: 'auto'}),
        ItemLatex:itemOriginal.toTex({implicit:'show',parenthesis: 'auto'}),

     
        //mathMl
        SearchMathMl:convertM(search),
        ItemMathMl:convertM(item)
    }

    let ExpressionAfterSimplify = 
    {
        ///asscii
        SearchPlain:searchSimplified.toString({implicit:'show',parenthesis: 'auto'}),
        ItemPlain:itemSimplified.toString({implicit:'show',parenthesis: 'auto'}),

        //latex
        SearchLatex:searchSimplified.toTex({implicit:'show',parenthesis: 'auto'}),
        ItemLatex:itemSimplified.toTex({implicit:'show',parenthesis: 'auto'}),

        //mathMl
        SearchMathMl:convertM(search),
        ItemMathMl:convertM(item)
    }


    let ConfidenceValues = 
    {
        Overall:Overall,

        TokenMatch:TokenMatch,
        ValueMatch:ValueMatch,

        OrderedTokenMatch:OrderedTokenMatch,
        OrderedValueMatch:OrderedValueMatch
    }


    let result =
    {
        ExpressionBeforeSimplify:ExpressionBeforeSimplify,
        ExpressionAfterSimplify:ExpressionAfterSimplify,
        ConfidenceValues:ConfidenceValues
    }

    
    return result;
}

//acurate round function to n places
function round(num, decimalPlaces = 0) {
    num = Math.round(num + "e" + decimalPlaces);
    return Number(num + "e" + -decimalPlaces);
}

//Both methods
var Engine = (search) =>
{
    let normalizedSearch = Normalize(search);

    var filter = new Array(DataWarehouse.length);

    for(let i = 0; i < DataWarehouse.length; i++)
    {      
       let item = DataWarehouse[i].Functions;

       //console.log('search: '+search);
       //console.log('item: '+item);

       //console.log(MathParse(search,item));
       //console.log(StringParse(search,item));


       //use a third method that does a comparison based only on the string length?

       //math = hanno, string = christiaan
        let mathConfidence, stringConfidence;
      
        //to store results from Hanno method
        let mathResults = {}

       
        //we can do some check here beforehand to see if the string is valid math
        
        mathResults = MathParse(search,item);
        
        //use this if we can parse the function
        if(mathResults != null/*mathResults != null || mathResults.Token != undefined || mathResults != "error"*/)
        {
            mathConfidence = mathResults.ConfidenceValues.Overall * 0.6;

            //console.log(mathResults.ExpressionBeforeSimplify.SearchPlain);
            //console.log(mathResults.ExpressionBeforeSimplify.ItemPlain);

            //we use both hanno's string simplify methods and christian's and see wich one gets the best match
            stringConfidence = Math.max
            (            
                StringParse(mathResults.ExpressionBeforeSimplify.SearchPlain, mathResults.ExpressionBeforeSimplify.ItemPlain),
                StringParse(mathResults.ExpressionAfterSimplify.SearchPlain, mathResults.ExpressionAfterSimplify.ItemPlain),
                StringParse(normalizedSearch, Normalize(item))

            ) * 0.4;
            
        }
        else
        {
            mathConfidence = 0; 
            
            //using string without any changes and only christian's normilization
            stringConfidence = Math.max
            (            
                StringParse(search, item),
                StringParse(normalizedSearch, Normalize(item))
            ) * 1;          
        }

        //if we could not parse the expression in mathml, mathResults will be null but Overal confidence will still work
        let result = 
        {
            mathResults: mathResults,
            OverallConfidence: round((mathConfidence + stringConfidence)*100.0, 3)
        }


        filter[i] = result;
     
    }
    //sort
    filter = filter.sort(function (a, b) { return a.OverallConfidence > b.OverallConfidence ? -1 : 1});
    return filter;
}

// 6d -9r +2t^{5}d -3t^{5}r 
//r * (-(3 * t ^ 5) - 9) + d * (2 t ^ 5 + 6)
// console.log('\n\nArray:\n',Engine('6d -9r +2t^{5}d -3t^{5}r '));
//console.log(Engine('6d -9r +2t^{5}d -3t^{5}r ')[0].mathResults);
// console.log(convertM('6d -9r +2t^{5}d -3t^{5}r'))
module.exports = Engine;