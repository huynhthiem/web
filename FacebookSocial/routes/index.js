var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongojs = require('mongojs');
var db = mongojs('autiondata',['products']);
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var mongoose = require('mongoose');
var passport = require('passport');


var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

 

		
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* RESTful API */
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});


router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

/* Authentication API */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password || !req.body.email){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;
  user.email = req.body.email;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/history', function(req, res, next) {
	 
	db.products.find(function(err,docs){
		res.json(docs);
	});
});

router.get('/currentPrice', function(req, res, next) {
	 
	db.products.find({},{costCurent:1,_id:1},function(err,docs){
		res.json(docs);
		
	});
});

router.get('/auth/twitter/', passport.authenticate('twitter', {
    failureRedirect: '/#/register',
    session: false
  }));
/*
app.get('/auth/twitter/callback', passport.authenticate('facebook',
 {session: false, failureRedirect : '/'}), function(req, res) {
 // The token we have created on FacebookStrategy above 
    res.res.cookie('token', JSON.stringify(req.user.generateJWT()));
    res.redirect('/');
});*/

router.get('/auth/twitter/callback', function(req, res, next){

  passport.authenticate('twitter', function(err, user, info){
    if(err){ return next(err); }

    if(user){
     // token =  res.json({token: user.generateJWT()});
     //  res.cookie('token',token );
     // res.cookie('token', JSON.stringify(req.user.token));
     res.cookie('token', JSON.stringify(user.generateJWT()));
      return res.json({token: user.generateJWT()});;
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router
  .get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email', 'user_about_me'],
    failureRedirect: '/#/register',
    successRedirect : '/',
    session: false
  }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/#/register',
    successRedirect : '/',
    session: false
  }));


module.exports = router;
