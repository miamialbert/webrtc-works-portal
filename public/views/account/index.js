
(function() {
  'use strict';

app = app || {};


  app.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });


  app.ServerInfo = Backbone.Model.extend({
  url: '/account',
  defaults:{
  username: '',
  serverType: '',
  serverAddress: '',
  serverUsername: '',
  serverPassword: ''
  }

  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.ServerInfo,
    url: '/account',
    parse: function(results) {
          return results.data;
        }
  });


  app.RunTestView = Backbone.View.extend({
  el: '#runTest',
  template: _.template($('#tmpl-runTest').html()),
  events:{
     'submit form': 'preventSubmit',
     'click .btn-runTest': 'runTest'
  },
  initialize: function(){
        this.collection = new app.RecordCollection(),
        this.collection.fetch();
        this.listenTo(this.collection, 'reset', this.render),
        this.render()
  },
  render: function(){
      this.$el.html( this.template() );
      console.log(this.collection);
  }

  });

app.CreateServerView = Backbone.View.extend({
el: '#createServer',
template: _.template( $('#tmpl-createServer').html() ),
events: {
    'submit form': 'preventSubmit',
    'click .btn-createServer': 'createServer'
},
    initialize: function() {
      this.model = new app.ServerInfo();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    createServer: function() {
      this.$el.find('.btn-signup').attr('disabled', true);
      this.model.save({
        username: "",
        serverType: this.$el.find('[name="serverType"]').val(),
        serverAddress: this.$el.find('[name="serverAddress"]').val(),
        serverUsername: this.$el.find('[name="serverUsername"]').val(),
        serverPassword: this.$el.find('[name="serverPassword"]').val(),
      },{
        success: function(model, response) {
          if (response.success) {
            location.href = '/account/';
          }
          else {
            model.set(response);
          }
        }
      });
    }
});

  $(document).ready(function() {
    app.CreateServerView = new app.CreateServerView();
    app.RunTestView = new app.RunTestView();
  });
}());
