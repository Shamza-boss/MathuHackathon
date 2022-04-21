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