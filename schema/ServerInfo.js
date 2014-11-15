'use strict';

exports = module.exports = function(app, mongoose) {
  var serverInfoSchema = new mongoose.Schema({
    username: String,
    serverAddress: String,
    serverType: String,
    serverUsername: String,
    serverPassword: String
  });
  serverInfoSchema.set('autoIndex', (app.get('env') === 'development'));
   serverInfoSchema.plugin(require('./plugins/pagedFind'));
  app.db.model('ServerInfo', serverInfoSchema);
};
