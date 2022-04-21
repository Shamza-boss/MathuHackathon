require("dotenv").config()
var port = process.env.PORT || 1337;
var express = require("express");
//engine
let wuzzy = require("wuzzy")
//mathjax converter
const Mathml2latex = require('mathml-to-latex');
//mathjax api
var mjAPI = require("mathjax-node");

var app = express();

app.use(express.static(__dirname + '/public'));//allows access to public folder containing pics and other documents
app.use(express.urlencoded({ extended: true }));//initialises port
app.use(express.json())


//configuration setting for mathjax api
mjAPI.config({
  MathJax: {
    tex: {
      inlineMath: [['\\(', '\\)']]
    },
    options: {
      enableMenu: false
    }
  }
});
//initialises mathjax to listen
mjAPI.start();

//read data as an embedded array from written page
const DataWarehouse = require('./public/DBJSONDATA/Written/StructureDB.js');

//this solution is better than using a loop as we have access to all the data globaly as if it where an actual object
console.log(DataWarehouse[0].Functions)




//sample input raw tex code
app.get('/', (req, res) => {
  //place holder for injection to frontend
var datar = "Input data so we can search";
//array holding data
var filter = [{confidence: 0, Func: `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
<mfrac>
<mrow>
<mi>y</mi>
<mo>−</mo>
<mn>3</mn>
</mrow>
<mn>3</mn>
</mfrac>
</math>`, Cat: 'linear'}];
    //main route takes data and reads it
    res.status(200).render('Home.ejs', {query: datar, result: filter});
})
app.get('/Home', (req, res) => {
    //Main route
    res.status(200).redirect('/')
})
app.post('/RawMathml',(req, res)=>{
  //gets data from textbox in frontend
  var tex = req.body.RawMathml;
  const yourMath = Mathml2latex.convert(tex);
  console.log(yourMath)
var datar = "";
  //query to be returned
  mjAPI.typeset({
    math: yourMath,
    format: "TeX", // or "inline-TeX", "MathML"
    mml:true,      // or svg:true, or html:true
  }, function (data) {
    if (!data.errors) {
      //  console.log(data.mml)
      console.log(data.mml)
        //pushing collected data to global array... datar
        datar = data.mml;
      }
  });

  var filter = [];
  //funtion to retrieve from DBJSONDATA and compare
  for(var i = 0; i < DataWarehouse.length; i++){
    
    // var answer = cos.similarity(input, DataWarehouse[i].Functions);
     let answer = wuzzy.ngram(yourMath, DataWarehouse[i].Functions);

    if(answer>0.2){
        console.log(DataWarehouse[i].Functions)
        console.log(DataWarehouse[i].Category)
        mjAPI.typeset({
          math: DataWarehouse[i].Functions,
          format: "TeX", // or "inline-TeX", "MathML"
          mml:true,      // or svg:true, or html:true
        }, function (data) {
          if (!data.errors) {
            //  console.log(data.mml)
            console.log(data.mml)
              //pushing collected data to global array... datar
              answer = Math.floor(answer*100)
              console.log(answer)
              filter.push({confidence: answer, Func: data.mml, Cat: DataWarehouse[i].Category});
            }
        });
        
        console.log(answer);
    }
    
}
filter.sort(function (a, b) { return a.confidence > b.confidence ? -1 : 1});
res.status(200).render('Home.ejs', {query: datar, result: filter});
})

//post method is an action that the frontend form listens for... this listener is listening for the Rawtex route
app.post('/RawTex',(req, res)=>{
  //gets data from textbox in frontend
  var tex = req.body.RawTex;
  console.log(tex)
  var datar = "";
  //query to be returned
  mjAPI.typeset({
    math: tex,
    format: "TeX", // or "inline-TeX", "MathML"
    mml:true,      // or svg:true, or html:true
  }, function (data) {
    if (!data.errors) {
      //  console.log(data.mml)
      console.log(data.mml)
        //pushing collected data to global array... datar
        datar = data.mml;
      }
  });

 
  var filter = [];
  //funtion to retrieve from DBJSONDATA and compare
  for(var i = 0; i < DataWarehouse.length; i++){
    
    // var answer = cos.similarity(input, DataWarehouse[i].Functions);
     let answer = wuzzy.ngram(tex, DataWarehouse[i].Functions);

    if(answer>0.4){
        // console.log(DataWarehouse[i].Functions)
        // console.log(DataWarehouse[i].Category)
        mjAPI.typeset({
          math: DataWarehouse[i].Functions,
          format: "TeX", // or "inline-TeX", "MathML"
          mml:true,      // or svg:true, or html:true
        }, function (data) {
          if (!data.errors) {
            //  console.log(data.mml)
            console.log(data.mml)
              //pushing collected data to global array... datar
              answer = Math.floor(answer*100)
              console.log(answer)
              filter.push({confidence: answer, Func: data.mml, Cat: DataWarehouse[i].Category});
            }
        });
        
        console.log(answer);
    }
    
}
filter.sort(function (a, b) { return a.confidence > b.confidence ? -1 : 1});
//parses to frontened
res.status(200).render('Home.ejs', {query: datar, result: filter});
})
//testroute to view sample json file
app.get('/test', (req, res)=>{
})
//catches routes we havent coded for
app.use((req, res) => {
  //404 section here
  res.status(404).render('404.ejs')
})
app.listen(port, () =>{
    //port listening on 3000 see env or 1337 
    console.log('Server listening on port ' + port)
});