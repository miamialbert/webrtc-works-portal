'use strict';

exports = module.exports = function(app, mongoose) {
    var testSchema = new mongoose.Schema({
        username: String,
        serverId: String
    });
    testSchema.set('autoIndex', (app.get('env') === 'development'));
    testSchema.plugin(require('./plugins/pagedFind'));
    app.db.model('Tests', testSchema);
};
