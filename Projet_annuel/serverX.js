let express = require('express');


let app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (request, response) =>{
	let Init = require('./models/init');
	Init.run(function(data,menace,menacepar,bloquePar, bloque,cango){
		console.log(cango);
		response.render('pages/index', {test: data.entries(), menace: menace.entries(),menacepar: menacepar.entries(),bloquePar :bloquePar.entries(), bloque : bloque.entries(), cango: cango.entries()});
	});
});
app.get('/move', (request, response) =>{
	let Move = require('./models/move');
	let PutInCime = require('./models/putInCime');
	let ReturnFromCime = require('./models/returnFromCime');
	if(request.query.cibleFrom == "plateau"){
		if(request.query.to.includes("cime")){
			PutInCime.set(request.query.from, function(data,menace,menacepar,bloquePar, bloque,cango){
				response.render('pages/index', {test: data.entries(), menace: menace.entries(),menacepar: menacepar.entries(),bloquePar :bloquePar.entries(), bloque : bloque.entries(), cango: cango.entries()});
			});
		}
		else{
			Move.set(request.query.from, request.query.to, function(data,menace,menacepar,bloquePar, bloque,cango){
				console.log(menace);
				response.render('pages/index', {test: data.entries(), menace: menace.entries(),menacepar: menacepar.entries(),bloquePar :bloquePar.entries(), bloque : bloque.entries(), cango: cango.entries()});
			});
		}
	}
	if(request.query.cibleFrom == "cimeBlanc" || request.query.cibleFrom=="cimeNoir"){
		if(request.query.to =="cimeBlanc" || request.query.to=="cimeNoir"){
			let Init = require('./models/init');
			Init.run(function(data,menace,menacepar,bloquePar, bloque,cango){
				response.render('pages/index', {test: data.entries(), menace: menace.entries(),menacepar: menacepar.entries(),bloquePar :bloquePar.entries(), bloque : bloque.entries(), cango: cango.entries()});
			});		
		}
		else{
			ReturnFromCime.set(request.query.from, request.query.to, request.query.cibleFrom, function(data,menace,menacepar,bloquePar, bloque,cango){
				response.render('pages/index', {test: data.entries(), menace: menace.entries(),menacepar: menacepar.entries(),bloquePar :bloquePar.entries(), bloque : bloque.entries(), cango: cango.entries()});
			});	
		}
	}


})

console.log("run");
app.listen(8080);
