/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Signup = Backbone.Model.extend({
    url: '/signup/',
    defaults: {
      errors: [],
      errfor: {},
      username: '',
      email: '',
      password: '',
      stunServer: '',
      turnServer: '',
      turnUsername: '',
      turnPassword: ''
    }
  });

  app.SignupView = Backbone.View.extend({
    el: '#signup',
    template: _.template( $('#tmpl-signup').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress [name="password"]': 'signupOnEnter',
      'click .btn-signup': 'signup'
    },
    initialize: function() {
      this.model = new app.Signup();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.$el.find('[name="username"]').focus();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    signupOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      if ($(event.target).attr('name') !== 'password') { return; }
      event.preventDefault();
      this.signup();
    },
    signup: function() {
      this.$el.find('.btn-signup').attr('disabled', true);
	console.log(this.$el.find('[name="stunServer"]'));
      this.model.save({
        username: this.$el.find('[name="username"]').val(),
        email: this.$el.find('[name="email"]').val(),
        password: this.$el.find('[name="password"]').val(),
        stunServer: this.$el.find('[name="stunServer"]').val(),
        turnServer: this.$el.find('[name="turnServer"]').val(),
        turnUsername: this.$el.find('[name="turnUsername"]').val(),
        turnPassword: this.$el.find('[name="turnPassword"]').val()
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
    app.signupView = new app.SignupView();
  });
}());
