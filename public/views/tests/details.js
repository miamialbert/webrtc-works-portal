/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Delete = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/servers/'+ app.mainView.model.id +'/';
    }
  });

  app.serverInfo = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      serverType: '',
      serverAddress: '',
      serverUsername: '',
      serverPassword: ''
    },
    url: function() {
      return '/servers/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
       console.log(response);
       if (response.serverInfo) {
        app.mainView.model.set(response.serverInfo);
        delete response.serverAddress;
      }
      return response;
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.serverEditView = Backbone.View.extend({
    el: '#serverEdit',
    template: _.template( $('#tmpl-serverEdit').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.serverInfo();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        serverType: app.mainView.model.get('serverType'),
        serverAddress: app.mainView.model.get('serverAddress'),
        serverUsername: app.mainView.model.get('serverUsername'),
        serverPassword: app.mainView.model.get('serverPassword')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      console.log(this.model.attributes);
      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
    console.log("FUCK");
      this.model.save({
        serverType: this.$el.find('[name="serverType"]').val(),
        serverAddress: this.$el.find('[name="serverAddress"]').val(),
        serverUsername: this.$el.find('[name="serverUsername"]').val(),
        serverPassword: this.$el.find('[name="serverPassword"]').val()
      });
    }
  });

  app.DeleteView = Backbone.View.extend({
    el: '#delete',
    template: _.template( $('#tmpl-delete').html() ),
    events: {
      'click .btn-delete': 'delete',
    },
    initialize: function() {
      this.model = new app.Delete({ _id: app.mainView.model.id });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    delete: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/servers/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.serverInfo( JSON.parse( unescape($('#data-record').html())) );
      app.headerView = new app.HeaderView();
      app.serverEditView = new app.serverEditView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
