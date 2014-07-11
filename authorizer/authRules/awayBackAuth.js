var permissionLevels = require('../permissionWeights.js');
module.exports = function(core){
	core.on('back', function(action, callback){
		if(action.user.role === "none"){
			if(/^guest-/.test(action.user.id)){
				action.user.role = "guest";
			}else{
				action.user.role = "registered";
			}
		}
		if(!action.room.guides || !action.room.guides.authorizer) {return callback();}
		if(!action.room.guides.authorizer.readLevel) return callback();
        if(!/^web:/.test(action.session)) return callback();
        
        if(permissionLevels[action.room.guides.authorizer.readLevel] <= permissionLevels[action.user.role]) return callback();
		else return callback(new Error('ERR_NOT_ALLOWED'));
	}, "authorization");
};