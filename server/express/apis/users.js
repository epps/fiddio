var passport = require('passport'),
    url      = require('url'),
    db       = require('../../bookshelf/config'),
    utility  = require('../../utility');

require('../../bookshelf/models/user');
require('../../bookshelf/collections/questions');

module.exports = function(app, router) {

  router.get('/fb', function(req, res, next) {
    req.session.redirect = url.parse(req.url, true).query.redirect;
    next();
  },
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
  }));

  router.get('/fb/callback', function(req, res, next) {
    passport.authenticate('facebook', function(err, user, info) {
      if (err) {
        return next(err);
      }
      var redirect = req.session.redirect;
      req.session.redirect = undefined;
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        if (redirect) {
          res.redirect( '/#' + redirect );
        } else {
          res.redirect('/');
        }
      });
    })(req, res, next);
  });

  router.get('/gh', function(req, res, next) {
    //req.session.redirect = url.parse(req.url, true).query.redirect;
    next();
  },
  passport.authenticate('github', {
    scope: ['user:email']
  }));

  router.get('/gh/callback', function(req, res, next) {
    passport.authenticate('github', function(err, user, info) {
      if (err) {
        return next(err);
      }
      var redirect = req.session.redirect;
      req.session.redirect = undefined;
      process.verb('User info', user);
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }

        res.redirect( '/#/' );
      });
    })(req, res, next);
  });

  function getQuestions(req, res, next) {
    db.collection('Questions')
    .fetchbyUser(req.body.id)
    .then( function(questions) {
      res.json({ questions: questions.toJSON() });
    })
    .catch( function(err) {
      res.sendStatus(400); // Bad Request!
    });
  }

function getStarredQuestions(req, res, next) {
    db.collection('Questions')
    .fetchStarredbyUser(req.body.id)
    .then( function(questions) {
      res.json({ questions: questions.toJSON() });
    })
    .catch( function(err) {
      res.sendStatus(400); // Bad Request!
    });
  }

  function getUserInfo(req, res, next) {
    db.model('User')
    .fetchUserbyId(req.body.id)
    .then( function(user) {
      var userJSON = user.toJSON();
      userJSON.authenticated = true;
      res.json(userJSON);
    })
    .catch( function(err) {
      res.json({ authenticated: false });
    });
  }

  function userHandler(req, res, next) {
    req.body.id = utility.getUrlParamNums(req, 'user_id').user_id;
    if (!req.body.id && req.user) { req.body.id = req.user.id; }

    next();
  }

  function createUser(req, res, next) {
    db.model('User').fetchUser(req.body.email, true)
    .then( function(user) {
      if (!user) {
        return db.model('User').newUser({
          name: req.body.name,
          email: req.body.email
        }).save();
      }
    })
    .then( function(user) {
      res.json(user.toJSON());
    });
  }

  function logoutHandler(req,res,next) {
    req.logout();
    res.json({ authenticated: false });
  }

  router.post('/register/user', createUser);
  router.get('/logout', logoutHandler);

  router.get('/user/info', userHandler, getUserInfo);
  router.get('/users/questions', userHandler, getQuestions);
  router.get('/user/:user_id/info', userHandler, getUserInfo);
  router.get('/users/questions/stars', userHandler, getStarredQuestions);
  router.get('/users/:user_id/questions', userHandler, getQuestions);
  router.get('/users/:user_id/questions/stars', userHandler, getStarredQuestions);
};