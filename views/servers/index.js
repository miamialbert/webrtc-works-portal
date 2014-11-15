'use strict';

exports.find = function(req, res, next){
  req.query.type = req.query.type ? req.query.type : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  /*TODO: Verify the username with the request is the username tied to the session Or at least verify the security of this method.*/
  var filters = {username: req.user.username};
  if (req.query.serverAddress) {
    filters.serverAddress = new RegExp('^.*?'+ req.query.serverAddress +'.*$', 'i');
  }

  if (req.query.type) {
    filters.type = req.query.type;
  }

  /*if (req.query.roles && req.query.roles === 'admin') {
    filters['roles.admin'] = { $exists: true };
  }

  if (req.query.roles && req.query.roles === 'account') {
    filters['roles.account'] = { $exists: true };
  }*/

  req.app.db.models.ServerInfo.pagedFind({
    filters: filters,
    keys: 'username serverType serverAddress serverUsername serverPassword',
    limit: req.query.limit,
    page: req.query.page,
    sort: req.query.sort
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = req.query;
      res.send(results);
    }
    else {
      results.filters = req.query;
      res.render('servers/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

exports.read = function(req, res, next){
  req.app.db.models.ServerInfo.findById(req.params.id).exec(function(err, server) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(server);
    }
    else {
      res.render('servers/details', { data: { record: escape(JSON.stringify(server)) } });
    }
  });
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
exports.create = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if(!req.body.serverAddress) {
      workflow.outcome.errors.push('Please enter a Server Address.');
      return workflow.emit('response');
    }
    if (!req.body.serverType) {
      workflow.outcome.errors.push('Please enter a Server Type');
      return workflow.emit('response');
    }
      workflow.emit('createServer');
  });

  workflow.on('createServer', function() {
    var fieldsToSet = {
      username: req.user.username,
      serverAddress: req.body.serverAddress,
      serverType: req.body.serverType,
      serverUsername: req.body.serverUsername,
      serverPassword: req.body.serverPassword
    };
    req.app.db.models.ServerInfo.create(fieldsToSet, function(err, server) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = server;
      return workflow.emit('response');
    });
  });
  workflow.emit('validate');
};

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {

    if (!req.body.serverAddress) {
      workflow.outcome.errfor.serverAddress = 'required';
    }
    if (!req.body.serverType) {
          workflow.outcome.errfor.serverType = 'required';
    }
    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }
    workflow.emit("patchServer");

  });

  workflow.on('patchServer', function() {
    var fieldsToSet = {
      serverType: req.body.serverType,
      serverAddress: req.body.serverAddress,
      serverUsername: req.body.serverUsername,
      serverPassword: req.body.serverPassword
    };

    req.app.db.models.ServerInfo.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, server) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.outcome.record = server;
      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
};


exports.delete = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
  //TODO: Ensure user owns the server he/she is trying to delete
  //TODO: Unless admin. Install admin overrides.

    workflow.emit('deleteServer');
  });

  workflow.on('deleteServer', function(err) {
    req.app.db.models.ServerInfo.findByIdAndRemove(req.params.id, function(err, server) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.emit('response');
    });
  });
  workflow.emit('validate');
};
