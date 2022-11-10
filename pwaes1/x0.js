/*jshint esversion:8 */

const ll=function(...args){
    console.log("prova",args);
    console.log(args);
    let t=typeof args;
    console.log(t);
    args.unshift("lillo");
    console.log(args);
    t=typeof args;
    console.log(t);
};


ll("pippo","pluto");