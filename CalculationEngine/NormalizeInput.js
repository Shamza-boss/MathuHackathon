var Normalizer = (func)=>{

    if (func !== '' && typeof func !== undefined) {
        func = func.replace(/ +/g, ''); //removes all white space
        func = func.replace(/[/]+/g, " / ");
        func = func.replace(/[-]+/g, " - ");
        func = func.replace(/[+]+/g, " + ");
        func = func.replace(/[*]+/g, " * ");
        func = func.replace(/[\n\r]+/g, "");
    }
    return func;
}
module.exports = Normalizer;