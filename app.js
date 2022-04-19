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