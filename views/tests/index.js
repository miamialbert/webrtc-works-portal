'use strict';

exports.selectServer = function(req,res,next){};

exports.find = function(req, res, next){
  req.query.type = req.query.type ? req.query.type : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  /*TODO: Verify the username with the request is the username tied to the session Or at least verify the security of this method.*/
  var filters = {username: req.user.username};

  req.app.db.models.Tests.pagedFind({
    filters: filters,
    keys: 'username serverId',
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
      res.render('tests/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

exports.read = function(req, res, next){
  req.app.db.models.Tests.findById(req.params.id).exec(function(err, server) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(server);
    }
    else {
      res.render('tests/details', { data: { record: escape(JSON.stringify(server)) } });
    }
  });
};

exports.delete = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
  //TODO: Ensure user owns the server he/she is trying to delete
  //TODO: Unless admin. Install admin overrides.

    workflow.emit('deleteTest');
  });

  workflow.on('deleteTest', function(err) {
    req.app.db.models.Tests.findByIdAndRemove(req.params.id, function(err, server) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.emit('response');
    });
  });
  workflow.emit('validate');
};
