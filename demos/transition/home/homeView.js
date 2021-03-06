var Torso = require('torso');
var _ = require('underscore');
var ChildView = require('../child/ChildView');

module.exports = new (Torso.View.extend({
  template: require('./home-template.hbs'),
  className: 'home',

  events: {
    'click .next': 'next',
    'click .back': 'back',
    'click .render': 'render',
    'click .popup': 'popup'
  },

  initialize: function() {
    this.myChildViews= [
      new ChildView({color: 'red'}),
      new ChildView({color: 'blue'}),
      new ChildView({color: 'green'}),
      new ChildView({color: 'purple'}),
      new ChildView({color: 'orange'})
    ];
    this.popupChildView = new ChildView({color: 'black', modal: true});
    this.set('current', 0);
    this.set('previous', -1);
    this.listenTo(this.viewState, 'change:current', this.render);
    this.listenTo(this.popupChildView, 'closed', this.popupClosed);
  },

  render: function() {
    var view = this;
    if (this.renderPromise && this.renderPromise.state() != 'resolved') {
      this.renderPromise.done(function() {
        view.renderPromise = view.render();
      })
      return;
    }
    return this.renderPromise = Torso.View.prototype.render.call(this);
  },

  attachTrackedViews: function() {
    if (this.get('popup-open')) {
      this.attachView('popup', this.popupChildView);
    }
    return this.attachView('current', this.myChildViews[this.get('current')], {
      transitionType: this.get('current') > this.get('previous') ? 'forward' : 'backwards',
      useTransition: true
    });
  },

  prepare: function() {
    var context = Torso.View.prototype.prepare.call(this);
    context.maxIndexOfChildViews = _.size(this.myChildViews) - 1;
    return context;
  },

  next: function() {
    this.move(true);
  },

  back: function() {
    this.move(false);
  },

  move: function(forward) {
    var view = this;
    var current = this.get('current');
    if (this.renderPromise && this.renderPromise.state() != 'resolved') {
      this.renderPromise.done(function() {
        view.move(forward);
      })
      return;
    }
    if ((forward && current < (_.size(this.myChildViews) - 1)) || (!forward && current > 0)) {
      this.set('previous', current);
      this.set('current', current + (forward ? 1 : -1));
    }
  },

  popup: function() {
    view = this;
    if (this.popupPromise && this.popupPromise.state() != 'resolved') {
      this.popupPromise.done(function() {
        view.popup();
      });
      return;
    }
    if (this.get('popup-open')) {
      this.popupPromise = this.popupChildView.close();
      /*
       OR
       this.popupChildView.transitionOut(function() { });
       this.set('popup-open', false);
       */
    } else {
       this.attachView('popup', this.popupChildView, {
         useTransition: true
       });
      this.set('popup-open', true);
    }
  },

  popupClosed: function() {
    this.set('popup-open', false);
  }


}))();
