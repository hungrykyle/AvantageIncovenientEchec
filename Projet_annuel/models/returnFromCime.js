let conn = require('../config/connexion.js');
const {Connection, query, db} = require('stardog');
var d3 = require("d3");
let init = require('../models/init.js');
let update = require('../models/updateID.js');

//Quand on sort une piece du cimetiere
class ReturnFromCime {

	//On recupere la valeur de la piece a replace sur le plateau, ainsi que l id de la piece a supprime du cimetiere
	static set(from, to, cime, cb){
		console.log(from);
		var valeur = ""
		if(from == "pawn"){
			valeur = "Pion";
		}
		else if(from== "rook"){
			valeur = "Tour";
		}
		else if(from == "bishop"){
			valeur= "Fou";
		}
		else if(from =="knight"){
			valeur = "Cavalier";
		}
		else if(from =="queen"){
			valeur ="Reine";
		}
		else if(from =="king"){
			valeur = "Roi";
		}
		else{
			console.log("Y a un probleme frerot");
		}
		var nb = "nb"+valeur;
		query.execute(conn, 'echec','select ?c where {:'+cime+' :'+nb+' ?c}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(({body})=>{
			var data = body.results.bindings;
			this.delCime("Cell"+valeur,valeur, to, cime, data[0].c.value,cb);
		}).catch(e=> {console.log(e);});	
		console.log("return form cime");
	}

	//On supprime la piece du cimetiere
	static delCime(valeur,nb, to, cime, id, cb){
			query.execute(conn, 'echec','delete data {:'+cime+' rdf:type :'+valeur+id+'}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				console.log(valeur+id);
				this.putInPlateau(valeur,to,cime,cb);
				update.deleteOldId(cime, "nb"+nb,id, parseInt(id)-1);
				//this.deleteOldId(cime, "nb"+nb, id);
			}).catch(e=> {console.log(e);});
	}
	//On verifie si la case vise est occupe
	static putInPlateau(valeur, to, cime, cb){
		var couleur = "";
		if(cime == "cimeBlanc"){
			couleur = "CellPieceB";
		}
		else{
			couleur = "CellPieceN";
		}
		query.execute(conn, 'echec','ASK {{:cell'+to+' rdf:type :CellPieceN} UNION {:cell'+to+' rdf:type :CellPieceB}}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			console.log(res.body.boolean);
			if(res.body.boolean == true){
				this.checkPiece(to,valeur,couleur,cb);
			}
			else{
				this.insertNew(to,valeur,couleur,cb);
			}
		}).catch(e=> {console.log(e);});
	}

	//Si elle est occupe, on recupere les infos de la piece presente
	static checkPiece(to,t,p,cb){
		query.execute(conn, 'echec','select ?c where {:cell'+to+' rdf:type ?c}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(({body})=>{
			var data = body.results.bindings;
			var couleur = "";
			var valeur ="";
			if(data[2].c.value.includes("Piece")){
				couleur = data[2].c.value;
				valeur = data[3].c.value;
			}
			else{
				couleur = data[3].c.value;
				valeur = data[2].c.value;
			}
			this.delete(to,t,p,valeur,couleur,cb);
		}).catch(e=> {console.log(e);});
	}

	//On supprime la piece presente sur la case
	static delete(to,t,p,op,couleur,cb){
		console.log(couleur.substr(couleur.length -1));
		query.execute(conn, 'echec','delete data {:cell'+to+' rdf:type <'+op+'> . :cell'+to+' rdf:type <'+couleur+'>}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			this.putInCime(to,t,p,op,couleur.substr(couleur.length -1), cb);
		}).catch(e=> {console.log(e);});	
	}


	//On l'a met dans le cimetiere
	static putInCime(to,t,p,op,couleur,cb){
		if(couleur == "N"){
			query.execute(conn, 'echec','insert data {:cimeNoir rdf:type <'+op+'>}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.insertNew(to,t,p,cb);
			}).catch(e=> {console.log(e);});	
		}
		else{
			query.execute(conn, 'echec','insert data {:cimeBlanc rdf:type <'+op+'>}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.insertNew(to,t,p,cb);
			}).catch(e=> {console.log(e);});		
		}
	}

	//On place la nouvelle piece sur le plateau
	static insertNew(to,t,p,cb){
		query.execute(conn, 'echec','insert data {:cell'+to+' rdf:type :'+t+' . :cell'+to+' rdf:type :'+p+'}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			init.run(cb);
		}).catch(e=> {console.log(e);});
	}
}

module.exports = ReturnFromCime;