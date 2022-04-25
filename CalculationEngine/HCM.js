const math = require('mathjs');
const wuzzy = require("wuzzy");
const mjAPI = require("mathjax-node");
const DataWarehouse = require('../public/DBJSONDATA/Written/StructureDB.js');


function logTree(node)
{
    node.traverse(function(node, path, parent)
    {
        switch(node.type)
        {
            case 'OperatorNode':
                console.log(node.type, node.op);       
                break;
            case 'ConstantNode':
                console.log(node.type, node.value);
                break;
            case 'SymbolNode':
                console.log(node.type, node.name);
                break;
            case 'FunctionNode':
                console.log(node.type, node.name);
                break;
            default:
                console.log('Undefined node: ' + node.type);                     
        }
    });
}

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
function compareArray(nodes1,nodes2)
{
    var matches = [];
    let len = Math.min(nodes1.length,nodes2.length);

    if(nodes1.length != nodes2.length)
    {
        //Do something if length is not equal
        console.log('expression length differs');
    }
      
    for(let i = 0; i < len; i++)
    {   
        let Type = 
        {
            Operator:false,Constant:false,Symbol:false,Function:false,       

            isAnyMatch()  
            {
                return this.Operator || this.Constant || this.Symbol || this.Function;
            }
        };
        //object to check if the node type and value are equal
        let match = {Type: Type, Value: false,stringValueSearch:'',stringValueItem:''};
          
        if(nodes1[i].type === nodes2[i].type)
        {
            switch(nodes1[i].type)
            {            
                case 'OperatorNode':
                        //console.log(nodes1[i].type + '  ' + nodes1[i].op)                                            
                        match.Type.Operator = true;
                        

                        //check if values match
                        if(nodes1[i].op === nodes2[i].op)
                        {
                            match.Value = true;                           
                        }
                        match.stringValueSearch = nodes1[i].op;

                    break;
                case 'ConstantNode':
                        //console.log(nodes1[i].type + '  ' + nodes1[i].value)                         
                        match.Type.Constant = true;   
                        
                        
                        if(nodes1[i].value === nodes2[i].value)
                        {
                            match.Value = true;                           
                        }
                        match.stringValueSearch = nodes1[i].value;
                        
                    break;
                case 'SymbolNode':
                        //console.log(nodes1[i].type + '  ' + nodes1[i].name)                        
                        match.Type.Symbol = true;  
                       
                        
                        if(nodes1[i].name === nodes2[i].name)
                        {
                            match.Value = true;              
                        }
                        match.stringValueSearch = nodes1[i].name;

                    break;
                case 'FunctionNode':
                        //console.log(nodes1[i].type + '  ' + nodes1[i].name)                            
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

function toASCII(latexExpression)
{
      // Examples of complex expressions that work correctly:
      //var expression = "\frac{m^2+11m+18}{4(m^2-4)} \div \frac{3m^2+27m}{24m^2-48m}";
      //var expression = "\dfrac{4x^2 -1}{3x^2 + 10x + 3} \div \dfrac{6x^2 + 5x + 1}{4x^2 - 7x + 3} \times \dfrac{9x^2 + 6x + 1}{8x^2 - 6x + 1}";
      //var expression = "\left(\dfrac{x}{3} - \dfrac{3}{x}\right)\left(\dfrac{x}{4} + \dfrac{4}{x}\right)";
      //  5,\overline{31}
      //  72b^{2}q - 18b^{3}q^{2}
      //  \sqrt[3]{4}
      //  {0,11414541454145 \ldots}
  
      /*
      README
      String.replaceAll does not work, instead use a global flag "/myString/g" as a parameter in a String.replace() function
      In a global flag strings are used without quotation marks /search/g will work, /"search"/g will not
      */
      var expression = latexExpression;  // Put latex expression here
      if(expression.includes("sqrt")) //Issues when root is part of a frac
      {
          if(expression.includes("frac") || expression.includes("\frac")) //replacing variations of \frac will mess up any expression which does not have any fractions
          {
              expression = expression
                  .replace(/tfrac/g,"\frac").replace(/dfrac/g,"\frac").replace(/\frac/g, "")  //Not duplicate, just similar
                  .replace(/}{/g, ")/(").replace(/\frac/g, "(").replace(/}/g, ")").replace(/{/g, "("); 
                  //  (3)/(sqrt[3](4))
                  console.log("expression = "+expression);
                  var root = expression.slice(expression.indexOf("sqrt"));
                  var substring = root.substr(root.indexOf("sqrt[")+4, root.indexOf(")"));    //remove \substr, but keep brackets to identify n and x
                  var n = substring.substr(substring.indexOf("[")+1,substring.indexOf("]")-1).replace("[","").replace("]","").replace("(","").replace(")",""); //get n
                  var x = "(" + substring.substr(substring.indexOf("(")+1,substring.indexOf(")")).replace("{","").replace("}","").replace("(","").replace(")",""); //get x
  
                  //console.log("expression, defrac = "+expression);
                  // console.log("x = "+x);
                  // console.log("n = "+n);
                  // console.log("sqrt = "+root);
                  // console.log("substring = "+substring);
          }
          else
          {
              var root = expression.substr(expression.indexOf('\sqrt['), expression.indexOf("}")+1);    // maby cut at index of sqrt?
              var substring = root.substr(root.indexOf('\sqrt[')+4, root.indexOf("}")+1);    //remove \substr, but keep brackets to identify n and x
              var n = substring.substr(substring.indexOf("[")+1,substring.indexOf("]")-1).replace("[","").replace("]",""); //get n
              var x = substring.substr(substring.indexOf("{")+1,substring.indexOf("}")-1).replace("{","").replace("}",""); //get x
          }
  
          if(n == 2)
              expression = expression.replace(root, "sqrt("+ x +")" );
          else expression = expression.replace(root, "nthRoot(" + x + "," + n + ")" );
      }
  
      if(expression.includes("frac") || expression.includes("\frac")) //replacing variations of \frac will mess up any expression which does not have any fractions
      {
          expression = expression.replace(/tfrac/g,"\frac").replace(/dfrac/g,"\frac").replace(/\frac/g, "").replace(/}{/g, ")/(").replace(/\frac{/g, "(").replace(/}/g, ")"); 
      }
  
      expression = expression    
          .replace(/\times/g,"*").replace(/div/g,"/")
          .replace(/\ldots/,"...").replace("dot",".").replace(/{/g,"(").replace(/}/g,")")
          .replace(/\left/g,"").replace(/\right/g,"").replace("\displaystyle","")
          .replace(/\mathbb/g,"").replace(/mathrm/g,"").replace(/\text/g,"").replace(/\circ/g,"").replace(/_/g,"")
          
        if(expression.includes("overline"))
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
          //expression.replace(/ /g, ""); 
      //console.log(expression);
      return expression;
      // TODO
      //  -summation
      //  -fix issue where sqrt or nthRoot in a fraction breaks the output, see below
      //  -test log base and other trig operators more
  
      // The following expressions causes issues:
      //  \dfrac{3}{\sqrt[3]{4}}
}

function toMathJs(str)
{  

   str = toASCII(str);

    //convert math string to mathjs object and simplifies the expression
   let res =  math.simplify(math.parse(str));
   //res = math.simplifyCore(math.parse(str))

   //console.log('Simplify: '+res.toString())

    return res
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

{
//Idea of how to compare expressions:

// Match expression steps
// where token is a constant, operator, symbol or function and length = token length
// 100% match => equal length and token type + token value is the same
// 90% match => equal length and token type is the same
// 80% match => equal length and token type + value is the same when tokens are ordered 
// 70% match => equal length and token type is the same when tokens are ordered 
// 60% match => length not equal and token type is the same when tokens are ordered
// 50% match => length not equal and some token types is the same when ordered
}








//hanno
var Engine = (search) =>
{
    for(let i = 0; i < DataWarehouse.length; i++)
    {       
        var input = toMathJs(search);
        let item = toMathJs(DataWarehouse[i].Functions);
        let nodes_arr1 = treeToArray(input);
        let nodes_arr2 = treeToArray(item);

        console.log('search: ',input.toString() , nodeArrayToStr(nodes_arr1));
        console.log('item: ',item.toString() , nodeArrayToStr(nodes_arr2));

       
        var result = compareArray(nodes_arr1,nodes_arr2);
        
    }
}

//christiaan
var search = function(input)
{
    var filter = [];
      //funtion to retrieve from DBJSONDATA and compare
    for(var i = 0; i < DataWarehouse.length; i++)
    {
  
        let answer = wuzzy.ngram(input.replace(/ /g, ""), DataWarehouse[i].Functions.replace(/ /g, ""));
    
        if(answer>0.1)
        {
            mjAPI.typeset(
            {
              math: DataWarehouse[i].Functions,
              format: "TeX", // or "inline-TeX", "MathML"
              mml:true,      // or svg:true, or html:true
            }, function (data) 
            {
                if (!data.errors)
                {
                    //console.log(data.mml)
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

console.log(Engine('2x'));

module.exports = Engine;