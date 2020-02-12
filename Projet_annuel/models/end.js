let conn = require('../config/connexion.js');
const {Connection, query, db} = require('stardog');
var d3 = require("d3");

class End{
	static pieceMenace(result,cb){
		query.execute(conn,'echec','select * where {?c :menace ?p}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
		}).then(({body}) =>{
			var data = this.handle(body.results.bindings);
			this.pieceMenacePar(result,data,cb);
		}).catch(e=> {console.log(e);});	
	}

	static pieceMenacePar(result,menace,cb){
		query.execute(conn,'echec','select * where {?c :estMenacePar ?p}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
		}).then(({body}) =>{
			var data = this.handle(body.results.bindings);
			this.pieceBloquePar(result,menace,data,cb);
		}).catch(e=> {console.log(e);});	
	}

	static pieceBloquePar(result,menace,estmenacepar,cb){
		query.execute(conn,'echec','select * where {?c :estBloquePar ?p}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
		}).then(({body}) =>{
			var data = this.handle(body.results.bindings);
			this.bloque(result,menace,estmenacepar,data,cb);
		}).catch(e=> {console.log(e);});	
	}

	static bloque(result,menace,estmenacepar,pieceBloquePar,cb){
		query.execute(conn,'echec','select * where {?c :bloque ?p}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
		}).then(({body}) =>{
			var data = this.handle(body.results.bindings);
			this.canGo(result,menace,estmenacepar,pieceBloquePar,data,cb);
		}).catch(e=> {console.log(e);});	
	}

	static canGo(result,menace,estmenacepar,pieceBloquePar,bloque,cb){
		query.execute(conn,'echec','select * where {?c :canGo ?p}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
		}).then(({body}) =>{
			var data = this.handle(body.results.bindings);
			cb(result, menace, estmenacepar,pieceBloquePar,bloque,data);
		}).catch(e=> {console.log(e);});	
	}		
	
	static handle(d){
		var input = d.map(d => {return {"id":d.c.value,"concept": d.p.value}});
		var data = d3.nest()
			.key(d => {return d.id})
			.rollup(v => {return v.map(d => {return d.concept})})
			.map(input);
		return data;
	}

}

module.exports = End;