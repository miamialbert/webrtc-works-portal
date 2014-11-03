'use strict';
//Server side code?
exports.init = function(req, res){
  res.render('account/index');
};

exports.createServer = function(req,res){
 var workflow = req.app.utility.workflow(req, res);
     workflow.on('createServer', function() {
           var fieldsToSet = {
             username: req.user.username,
             serverType: req.body.serverType,
             serverAddress: req.body.serverAddress,
             serverUsername: req.body.serverUsername,
             serverPassword: req.body.serverPassword
           };

         req.app.db.models.ServerInfo.create(fieldsToSet, function(err, user) {
           if (err) {
             return workflow.emit('exception', err);
           }

              workflow.outcome.defaultReturnUrl = req.user.defaultReturnUrl();
              workflow.emit('response');
         });
      });
 workflow.emit('createServer');
};


