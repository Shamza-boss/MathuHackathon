require("dotenv").config()
var port = process.env.PORT || 3000;
var express = require("express");
var searchEngine = require('./CalculationEngine/Compare.js');
var HCM = require('./CalculationEngine/HCM.js');
var dataComparison = require('./CalculationEngine/dataC.js');
var boilerplate = require('./CalculationEngine/Default.js')
//Latex converter
const Mathml2latex = require('mathml-to-latex');
//mathjax api
var mjAPI = require("mathjax-node");

var app = express();

app.use(express.static(__dirname + '/public'));//allows access to public folder containing pics and other documents
app.use(express.urlencoded({ extended: true }));//initialises port
app.use(express.json())

//test server
// var filter = HCM("6d -9r +2t^{5}d -3t^{5}r")
// console.log(filter)
// var christiaan = searchEngine("6d -9r +2t^{5}d -3t^{5}r");
// console.log(christiaan)
// console.log(dataComparison('6d -9r +2t^{5}d -3t^{5}r'))

// console.log(boilerplate().query)
// console.log(HannoEngine('6d -9r +2t^{5}d -3t^{5}r'))

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

//sample input raw tex code
app.get('/', (req, res) => {
    res.status(200).render('Mathml.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})
app.get('/RawTex', (req, res) => {
  res.status(200).render('Latex.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})
app.get('/Mathml', (req, res) => {
    res.redirect('/');
})
app.get('/ToAcci', (req, res) => {
  res.status(200).render('Acci.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})


app.post('/RawMathml',(req, res)=>{
  //gets data from textbox in frontend
  var tex = req.body.RawMathml;
  var yourMath = Mathml2latex.convert(tex);
  console.log(yourMath)
  //christiaan
  var datar = dataComparison(yourMath)
  //query
  var filter = searchEngine(yourMath)
  res.status(200).render('Mathml.ejs', {query: datar, result: filter});

})
app.post('/ToAcci',(req, res)=>{
  //gets data from textbox in frontend
  var query = req.body.RawTex1
  var datar = dataComparison(query)
  //hanno engine
  var filter = HCM(query)
  console.log(filter);
res.status(200).render('ACCi.ejs', {query: datar, result: filter});
})
//post method is an action that the frontend form listens for... this listener is listening for the Rawtex route
app.post('/RawTex',(req, res)=>{
  //gets data from textbox in frontend
  var tex = req.body.RawTex;
  console.log(tex);
  var datar = dataComparison(tex)
  var filter = searchEngine(tex)
res.status(200).render('Latex.ejs', {query: datar, result: filter});
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