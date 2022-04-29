require("dotenv").config()
var port = process.env.PORT || 1337;
var express = require("express");
var HCM = require('./CalculationEngine/HCM.js');
var boilerplate = require('./CalculationEngine/Default.js')
var storage = require('./CalculationEngine/ImageReader.js')
var clarifyImage = require('./CalculationEngine/Clarifyimage.js')
var  NormalizeInput = require('./CalculationEngine/NormalizeInput.js')
var multer = require("multer");
const Mathml2latex = require('mathml-to-latex');
var mjAPI = require("mathjax-node");
var Tesseract = require('tesseract.js');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

mjAPI.config({
  MathJax: {
    tex: {
      inlineMath: [['\\(', '\\)']]
    },
    options: {
      enableMenu: false
    }
  }
})

mjAPI.start();

var upload = multer({storage:storage});

var OCR_Text;

app.get('/', (req, res) => {
    res.status(200).render('Mathml.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})

app.get('/Pic', (req, res) => {
  res.status(200).render('image.ejs', {query: boilerplate().query, result: boilerplate().boiler});
})

app.post('/Pic', upload.single('image'),(req,res)=>{
  //console.log(req.file);
  let filter;
      var filestring = './public/images/'.concat(req.file.filename);
      clarifyImage(filestring);
      Tesseract.recognize('OCR_Ready_Image.png','equ+eng', {logger: m => console.log(m)}).then(({data: {text}}) => {
              OCR_Text = JSON.stringify(text);
              OCR_Text = NormalizeInput(OCR_Text)
              filter = HCM(OCR_Text.slice(1, -2));
              res.status(200).render('image.ejs', {result: filter})
      })
});

app.post('/RawMathml',(req, res)=>{
  var query = req.body.RawMathml
  var yourMath = Mathml2latex.convert(query);
  console.log(yourMath)
  var filter = HCM(yourMath)
  res.status(200).render('Mathml.ejs', {result: filter});
});

app.use((req, res) => {
  res.status(404).render('404.ejs')
})

app.listen(port, () =>{
    console.log('Server listening on port ' + port)
});