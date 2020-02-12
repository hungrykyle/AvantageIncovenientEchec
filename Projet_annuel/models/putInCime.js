let conn = require('../config/connexion.js');
const {Connection, query, db} = require('stardog');
var d3 = require("d3");
let init = require('../models/init.js');
let update = require('../models/updateID.js');


//Quand on place une piece dans le cimetiere
class PutInCime {
	//On recupere les infos de la piece
	static set(cible, cb){

		query.execute(conn, 'echec','select ?c where {:cell'+cible+' rdf:type ?c}',
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
			var cime ="";
			if(couleur.substr(couleur.length -1) =="N"){
				cime="cimeNoir";
			}
			else{
				cime="cimeBlanc";
			}
			var nb= "nb"+valeur.split("#")[1].substr(4);
			this.getId(cible,cime,valeur, couleur,nb,cb);
		}).catch(e=> {console.log(e);});
	}


	//On recupere le nombre de piece de cette valeur deja present dans le cimetiere
	static getId(cible,cime,valeur,couleur,nb,cb){
		query.execute(conn, 'echec','select ?c where {:'+cime+' :'+nb+' ?c}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(({body})=>{
			var data = body.results.bindings;
			var id = parseInt(data[0].c.value) +1;
			this.addCime(cible,cime,valeur, couleur,id,cb);
			update.deleteOldId(cime, nb, id-1, id);
			//this.deleteOldId(cime,nb,id);
		}).catch(e=> {console.log(e);});	
	}

	//On ajoute la piece dans le cimetiere
	static addCime(cible, cime,valeur,couleur,id,cb){
			console.log("On ajoute au cime");
			console.log(valeur+id);
			query.execute(conn, 'echec','insert data {:'+cime+' rdf:type <'+valeur+id+'>}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.deleteOld(cible,valeur,couleur,cb);
			}).catch(e=> {console.log(e);});
	}

	//On supprime la piece dans son emplacement initial
	static deleteOld(from,t,p,cb){
		query.execute(conn, 'echec','delete data {:cell'+from+' rdf:type <'+t+'> . :cell'+from+' rdf:type <'+p+'>}',
		'application/sparql-results+json', {
			offset:0,
			reasoning: true
		}).then(res =>{
			init.run(cb);
		}).catch(e=> {console.log(e);});
	}
}

module.exports = PutInCime;