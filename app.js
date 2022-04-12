require("dotenv").config()
var port = process.env.PORT || 1337;
var express = require("express");

var app = express();

//initial databaseKEY || connection to database
const dbname = "mongodb+srv://admin:"+process.env.DBPIN+"@cluster0.6leuj.mongodb.net/"+process.env.DBNAME+"?retryWrites=true&w=majority";

app.use(express.static(__dirname + '/public'));//allows access to public folder containing pics and other documents
app.use(express.urlencoded({ extended: true }));//initialises port
app.use(express.json())

// a simple TeX-input example
var mjAPI = require("mathjax-node");
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
mjAPI.start();

var yourMath = '\\frac{xy^{-3}}{x^{4}y} = \\frac{1}{x^{3}y^{4}}';

mjAPI.typeset({
  math: yourMath,
  format: "TeX", // or "inline-TeX", "MathML"
  mml:true,      // or svg:true, or html:true
}, function (data) {
  if (!data.errors) {console.log(data.mml)}
});

app.get('/', (req, res) => {
    //landing page
    res.status(200).render('Home.ejs')
})
app.get('/Home', (req, res) => {
    //Home page
    res.status(200).redirect('/')
})
app.get('/About', (req, res) => {
    //About page
    res.status(200).render('About.ejs')
})
app.get('/Contact', (req, res) => {
    //Contact page
    res.status(200).render('Contact.ejs')
})
app.listen(port, () =>{
    //port listening on 3000 see env or 1337 
    console.log('Server listening on port ' + port)
});