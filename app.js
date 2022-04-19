require("dotenv").config()
var port = process.env.PORT || 1337;
var express = require("express");
//mathjax converter
const Mathml2latex = require('mathml-to-latex');
//mathjax api
var mjAPI = require("mathjax-node");

var app = express();

app.use(express.static(__dirname + '/public'));//allows access to public folder containing pics and other documents
app.use(express.urlencoded({ extended: true }));//initialises port
app.use(express.json())


// var convert = require('mathml-to-asciimath');

// var mathml = `
// <math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="\frac{4-b^2}{3b-6}">
//   <mfrac>
//     <mrow>
//       <mn>4</mn>
//       <mo>&#x2212;<!-- − --></mo>
//       <msup>
//         <mi>b</mi>
//         <mn>2</mn>
//       </msup>
//     </mrow>
//     <mrow>
//       <mn>3</mn>
//       <mi>b</mi>
//       <mo>&#x2212;<!-- − --></mo>
//       <mn>6</mn>
//     </mrow>
//   </mfrac>
// </math>
// `;
// console.log(convert(mathml)); // => '1 + 2'

// => A = [(x, y), (z, w)]

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

// //sample input of raw tex
// const rawTexCode = "'\\frac{xy^{-3}}{x^{4}y} = \\frac{1}{x^{3}y^{4}}';"



//p1 x+y=2
//p1 x+y= 1
//p3 xay=6
//px x3+y= 1
//converts mathml to tex format so we can process
//console.log(Mathml2latex.convert(mathml));

//option 1 to read Json files
// const file1 = require('./public/DBJSONDATA/course1/section_600961b039384c001eed5699/activity_600961b039384c001eed56b7.json')
// console.log(file1)

//option 2 to read Json files
// var latexr = ""

for (var i = 1; i<=28; i++) {
  const fs = require('fs');
  fs.readFile('./public/DBJSONDATA/Course1/activity_'+i+'.json', 'utf-8', (err, JsonString)=>{
    if(err){
      console.log(err)
    }else{
      //convert string to json
      const data = JSON.parse(JsonString)
        // latexr = data.problem[0].problem.en.latex
        //console.log(data.childProblems[0].problem.en.latex)
        for(let j=0; j<data.childProblems.length; j++){
          //need to remove first 2 and last two to make it valid latex
          console.log((data.childProblems[j].problem.en.latex).slice(2, -2))
          //category problem
          console.log("Category: "+data.problems[0].problem.en.latex)
        }
    }
  })
}

//place holder for injection to frontend
var datar = "Input data so we can search";
//sample input raw tex code
app.get('/', (req, res) => {
    //main route takes data and reads it
    res.status(200).render('Home.ejs', {result: datar});
})
app.get('/Home', (req, res) => {
    //Main route
    res.status(200).redirect('/')
})
//post method is an action that the frontend form listens for... this listener is listening for the Rawtex route
app.post('/RawTex',(req, res)=>{
   //gets data from textbox in frontend
  var tex = req.body.RawTex;
  //console.log(tex);
  var yourMath = tex;


  mjAPI.typeset({
    math: yourMath,
    format: "TeX", // or "inline-TeX", "MathML"
    mml:true,      // or svg:true, or html:true
  }, function (data) {
    if (!data.errors) {
      //  console.log(data.mml)
      console.log(data.mml)
      // mathml = data.mml
      // var ascii = convert(mathml)
      // console.log(ascii);
        //pushing collected data to global array... datar
        datar = data.mml;
      }
  });
  res.redirect('/');
})
//post method is an action that the frontend form listens for... this listener is listening for the Rawtex route
app.post('/RawMathml',(req, res)=>{
  //gets data from textbox in frontend
  var texM = req.body.RawMathml;
  //converts MathML to tex before processing
const yourMath = Mathml2latex.convert(texM);
mjAPI.typeset({
  math: yourMath,
  format: "TeX", // or "inline-TeX", "MathML"
  mml:true,      // or svg:true, or html:true
}, function (data) {
  if (!data.errors) {
      //console.log(data.mml)
      mathml = data.mml
      var ascii = convert(mathml)
      console.log(data.mml);
      //pushing collected data to global array... datar
      datar = data.mml;
    }
});
  //redirects to main route;
  res.redirect('/')
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