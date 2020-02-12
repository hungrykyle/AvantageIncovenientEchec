let conn = require('../config/connexion.js');
const {Connection, query, db} = require('stardog');

class UpdateID {
	//On met a jour le nombre de piece de cette valeur dans le cimetiere
	static deleteOldId(cime, nb, id, newid){	
			query.execute(conn, 'echec','delete data {:'+cime+' :'+nb+' '+id+'}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
				this.setNewId(cime,nb,newid);
			}).catch(e=> {console.log(e);});
	}
	//Suite de la mise a jour
	static setNewId(cime, nb ,id){
			query.execute(conn, 'echec','insert data {:'+cime+' :'+nb+' '+id+'}',
			'application/sparql-results+json', {
				offset:0,
				reasoning: true
			}).then(res =>{
			}).catch(e=> {console.log(e);});		
	}
}

module.exports = UpdateID;