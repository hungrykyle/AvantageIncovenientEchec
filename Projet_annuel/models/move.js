let conn = require('../config/connexion.js');
const {Connection, query, db} = require('stardog');
var d3 = require("d3");
let init = require('../models/init.js');
let update = require('../models/updateID.js');

//Quand on deplace une piece sur le plateau
class Move {

	//On recupere les infos de la piece deplace
	static set(from, to, cb){
		query.execute(conn, 'echec','select ?c where {:cell'+from+' rdf:type ?c}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(({body})=>{
			var data = body.results.bindings;
			this.deleteOld(from,to,data[3].c.value,data[2].c.value,cb);
		}).catch(e=> {console.log(e);});
	}

	//On supprime les info de son ancien emplacement
	static deleteOld(from, to,t,p,cb){
		query.execute(conn, 'echec','delete data {:cell'+from+' rdf:type <'+t+'> . :cell'+from+' rdf:type <'+p+'>}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			this.checkNew(to,t,p,cb);
		}).catch(e=> {console.log(e);});
	}

	//On regarde si la case cible est occupe ou non
	static checkNew(to,t,p,cb){
		query.execute(conn, 'echec','ASK {{:cell'+to+' rdf:type :CellPieceN} UNION {:cell'+to+' rdf:type :CellPieceB}}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			if(res.body.boolean == true){
				this.checkPiece(to,t,p,cb);
			}
			else{
				this.insertNew(to,t,p,cb);
			}
		}).catch(e=> {console.log(e);});
	}

	//Si elle est occupe, on recupere ces infos
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

	//On supprime les infos de la case si elle etait occupe
	static delete(to,t,p,op,couleur,cb){
		console.log(couleur.substr(couleur.length -1));
		query.execute(conn, 'echec','delete data {:cell'+to+' rdf:type <'+op+'> . :cell'+to+' rdf:type <'+couleur+'>}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			this.getId(to,t,p,op,couleur.substr(couleur.length -1), cb);
		}).catch(e=> {console.log(e);});	
	}


	//On recupere le nombre de piece deja de cette valeur (Pion, cavalier, ..) deja present dans le cimetiere
	static getId(to,t,p,op,couleur,cb){
		var nb= "nb"+op.split("#")[1].substr(4);
		var cime="";
		if(couleur=="N"){
			cime="cimeNoir";
		}
		else{
			cime ="cimeBlanc";
		}
		query.execute(conn, 'echec','select ?c where {:'+cime+' :'+nb+' ?c}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(({body})=>{
			var data = body.results.bindings;
			var id = parseInt(data[0].c.value) +1;
			this.putInCime(to,t,p,op,couleur,id,cb);
			update.deleteOldId(cime, nb, id-1,id);
			//this.deleteOldId(cime,nb,id);
		}).catch(e=> {console.log(e);});	
	}

	//On met la piece dans le cimetiere adequat
	static putInCime(to,t,p,op,couleur,id,cb){
		console.log(couleur);
		if(couleur == "N"){
			query.execute(conn, 'echec','insert data {:cimeNoir rdf:type <'+op+id+'>}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.insertNew(to,t,p,cb);
			}).catch(e=> {console.log(e);});	
		}
		else{
			query.execute(conn, 'echec','insert data {:cimeBlanc rdf:type <'+op+id+'>}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.insertNew(to,t,p,cb);
			}).catch(e=> {console.log(e);});		
		}
	}

	//On met la piece a son nouvel emplacement
	static insertNew(to,t,p,cb){
		query.execute(conn, 'echec','insert data {:cell'+to+' rdf:type <'+t+'> . :cell'+to+' rdf:type <'+p+'>}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{

			//On lance l affichage
			init.run(cb);
		}).catch(e=> {console.log(e);});
	}
}

module.exports = Move;
