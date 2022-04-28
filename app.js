require("dotenv").config()
var port = process.env.PORT || 1337;
var express = require("express");
var searchEngine = require('./CalculationEngine/Compare.js');
var HCM = require('./CalculationEngine/HCM.js');
var dataComparison = require('./CalculationEngine/dataC.js');
var boilerplate = require('./CalculationEngine/Default.js')
var storage = require('./CalculationEngine/ImageReader.js')
var clarifyImage = require('./CalculationEngine/Clarifyimage.js')
var multer = require("multer");
//Latex converter
const Mathml2latex = require('mathml-to-latex');
//mathjax api
var mjAPI = require("mathjax-node");
var Tesseract = require('tesseract.js');

var app = express();



app.use(express.static(__dirname + '/public'));//allows access to public folder containing pics and other documents
app.use(express.urlencoded({ extended: true }));//initialises port
app.use(express.json())

// console.log(dataComparison('6d -9r +2t^{5}d -3t^{5}r'))
//test server
// var filter = HCM("6d -9r +2t^{5}d -3t^{5}r")
// console.log(filter[0].expressions)
// console.log(Math.round(filter[0].mathResults.ConfidenceValues.Overall)*100)
// var christiaan = searchEngine("6d -9r +2t^{5}d -3t^{5}r");
// console.log(christiaan)
// console.log(dataComparison('6d -9r +2t^{5}d -3t^{5}r'))
// mathml = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="6d -9r +2t^{5}d -3t^{5}r">
// <mn>6</mn>
// <mi>d</mi>
// <mo>&#x2212;<!-- − --></mo>
// <mn>9</mn>
// <mi>r</mi>
// <mo>+</mo>
// <mn>2</mn>
// <msup>
// <mi>t</mi>
// <mrow class="MJX-TeXAtom-ORD">
// <mn>5</mn>
// </mrow>
// </msup>
// <mi>d</mi>
// <mo>&#x2212;<!-- − --></mo>
// <mn>3</mn>
// <msup>
// <mi>t</mi>
// <mrow class="MJX-TeXAtom-ORD">
// <mn>5</mn>
// </mrow>
// </msup>
// <mi>r</mi>
// </math>`

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
var upload = multer({storage:storage});
var OCR_Text;
//sample input raw tex code
app.get('/', (req, res) => {
    res.status(200).render('Mathml.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})
// app.get('/RawTex', (req, res) => {
//   res.status(200).render('Latex.ejs', {query: boilerplate().query, result: boilerplate().boiler});
// })
app.get('/Mathml', (req, res) => {
    res.redirect('/');
})
app.get('/ToAcci', (req, res) => {
  res.status(200).render('Acci.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})
app.get('/ImageUpload', (req, res) => {
  res.status(200).render('image.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})
app.post('/images/', upload.single('image'),(req,res)=>{
  //console.log(req.file);
  try {
      var filestring = './public/images/'.concat(req.file.filename); // <--- directory + filename
      //desaturates image and makes it clear
      clarifyImage(filestring);   //  <--- Clarify
      Tesseract.recognize(
          'OCR_Ready_Image.png',
          'equ+eng',
          {logger: m => console.log(m)}
          ).then(({data: {text}}) => {
              //var result = res.json({text});
              OCR_Text = JSON.stringify(text);
              console.log(OCR_Text);
              res.json({text});
              //return result;
              // var filter = HCM(OCR_Text)
              // res.status(200).render('image.ejs', {result: filter});
      })

  } catch (error) {
      console.log(error);
  }
})
app.post('/RawMathml',(req, res)=>{
  //gets data from textbox in frontend
  var query = req.body.RawMathml
  var yourMath = Mathml2latex.convert(query);
  console.log(yourMath)
  var filter = HCM(yourMath)
  console.log(filter)
  // console.log(filter[0].mathResults.ExpressionBeforeSimplify)
  res.status(200).render('Mathml.ejs', {result: filter});
})
app.post('/ToAcci',(req, res)=>{
  //gets data from textbox in frontend
  var query = req.body.RawTex1
  var filter = HCM(query)
  for(let i = 0;i<3;i++)//log only best 3
    console.log(filter[i]);
  // console.log(filter[0].mathResults.ExpressionBeforeSimplify)
  res.status(200).render('ACCi.ejs', {result: filter});
})
var upload = multer({storage:storage});
//post image, it is necessary to do 

//post method is an action that the frontend form listens for... this listener is listening for the Rawtex route
app.post('/RawTex',(req, res)=>{
  //gets data from textbox in frontend
  var tex = req.body.RawTex;
  console.log(tex);
  var datar = dataComparison(tex)
  var filter = searchEngine(tex)
res.status(200).render('Latex.ejs', {query: datar, result: filter});
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