const express = require('express'),
			mongoose = require('mongoose'),
			passport = require('passport'),
			localStrategy = require('passport-local'),
			bodyParser = require('body-parser'),
			User = require('./models/user');

const server = express();

const isLoggedIn = require('./middleware/isLoggedIn')

mongoose.connect('mongodb://localhost/auth_demo', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

server.set('view engine', 'ejs');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(
	require('express-session')({
		secret: 'Rusty is the best and cutest dog in the world',
		resave: false,
		saveUninitialized: false
	})
);

server.use(passport.initialize());
server.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

server.get('/', (req, res) => res.render('home'));
server.get('/login', (req, res) => res.render('login'));
server.get('/register', (req, res) => res.render('register'));
server.get('/secret', isLoggedIn, (req, res) => res.render('secret'));

server.post('/register', (req, res) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(error) => {
			if (error) return res.render('register');
			passport.authenticate('local')(req, res, () => res.redirect('/secret'));
		}
	);
});

server.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: '/login'
	})
);

server.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

server.listen(3000, () => console.log('Auth Server has started'));
