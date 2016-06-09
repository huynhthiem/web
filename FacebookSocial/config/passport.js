var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
 var TwitterStrategy = require('passport-twitter').Strategy;
 var localStorage = require('localStorage');
 // var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });



passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : '188824748180430',
        clientSecret    : '290c14f0e4dadfce2c45e0ebae232787',
        callbackURL     : "http://localhost:3000/auth/facebook/callback",
       
        enableProof: false,
    session: false,
        profileFields: ['id', 'displayName', 'link',  'photos', 'emails']
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        localStorage['flapper-news-token']= token;
                    // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    // localStorage['flapper-news-token']= token;
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User({name:profile.displayName, 
                    							email: profile.emails[0].value, username: profile.username, 
                    							facebook: profile._json,
                    							idtoken: token}
                    							);

                    // set all of the facebook information in our user model
                    // newUser.facebook.id    = profile.id; // set the users facebook id                   
                    // newUser.facebook.token = profile.token; // we will save the token that facebook provides to the user                    
                    // newUser.facebook.name  = profile.displayName;
                    // // look at the passport user profile to see how names are returned
                    // newUser.username = profile.username;
                    // newUser.facebook = profile._json;
                   // newUser.facebook.email = profile.emails[0].value;
                    // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        // localStorage['flapper-news-token']= token;
                        return done(null, newUser);
                    });
                }

            });
    

    }));

 // consumerKey: 'wi4q8CBnKhKLStSHS5qHU5Axl',
 //    consumerSecret: '9KooBotfreSD1lv0qa7YRl9sHOIQSdLChnloamEN5E483UhXpj',
 //    callbackURL: "http://localhost:3000/auth/twitter/callback"


passport.use(new TwitterStrategy({

    consumerKey: 'wi4q8CBnKhKLStSHS5qHU5Axl',
    consumerSecret: '9KooBotfreSD1lv0qa7YRl9sHOIQSdLChnloamEN5E483UhXpj',
    callbackURL: "http://localhost:3000/auth/twitter/callback"

    },
    function(token, tokenSecret, profile, done) {

        // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
        
            localStorage['flapper-news-token']= token;
            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    // localStorage['flapper-news-token'] = token;
                    console.log(localStorage.getItem('flapper-news-token'));
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser                 = new User();

                    // set all of the user data that we need
                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;

                    // save our user into the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        
                        console.log(localStorage.getItem('flapper-news-token'));
                        return done(null, newUser);
                    });
                }
            });

  

    }));


 // passport.use(new GoogleStrategy({

 //        clientID        : '304353189553-q0g7vqag5fjibudgs4bh5eqcnjipa7fo.apps.googleusercontent.com',
 //        clientSecret    : '2ZiHQoVrhGunch9vCzVbtkv_',
 //        callbackURL     : "http://localhost:3000/auth/google/callback",

 //    },
 //    function(token, refreshToken, profile, done) {

 //        // make the code asynchronous
 //        // User.findOne won't fire until we have all our data back from Google
 //        process.nextTick(function() {

 //            // try to find the user based on their google id
 //            User.findOne({ 'google.id' : profile.id }, function(err, user) {
 //                if (err)
 //                    return done(err);

 //                if (user) {

 //                    // if a user is found, log them in
 //                    return done(null, user);
 //                } else {
 //                    // if the user isnt in our database, create a new user
 //                    var newUser          = new User();

 //                    // set all of the relevant information
                    
 //                    newUser.google.token = token;
 //                    newUser.google.name  = profile.displayName;
 //                    newUser.google.email = profile.emails[0].value; // pull the first email

 //                    // save the user
 //                    newUser.save(function(err) {
 //                        if (err)
 //                            throw err;
 //                        return done(null, newUser);
 //                    });
 //                }
 //            });
 //        });

 //    }));
 
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

