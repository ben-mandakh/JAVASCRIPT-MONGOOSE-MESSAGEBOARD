////////// EXPRESS ///////////////////////////////////
const express = require("express");
const app = express();

////////// MONGOOSE //////////////////////////////////
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messagesDB', {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var bodyParser = require("body-parser");


const CommentSchema = new mongoose.Schema({
 name: {type: String, required:[true, "Name must be at least 3 characters"], minlength:3},
 comment: {type: String, required:[true, "Comment must be at least 3 characters"], minlength:3},
}, {timestamps:true})

const MessageSchema = new mongoose.Schema({
 name: {type: String, required:[true, "Name must be at least 3 characters"], minlength:3},
 message: {type: String, required:[true, "Message must be at least 2 characters"], minlength:2},
 comments: [CommentSchema]
}, {timestamps:true})

const Comment = mongoose.model('Comment', CommentSchema);
const Message = mongoose.model('Message', MessageSchema);

////////// VALIDATION ////////////////////////////////
const flash = require('express-flash');
app.use(flash());

///////// EXPRESS CONNECTION PORT ////////////////////
app.listen(8000, () => console.log("listening on port 8000"));

///////// POST SETUP              ////////////////////
app.use(express.urlencoded({extended: true}));

///////// CONF           /////////////////////////////
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
app.use(bodyParser.urlencoded({useNewUrlParser: true}));

///////// EJS CONNECTION          //////////////////// 
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

///////// SESSION SETUP      /////////////////////////
const session = require('express-session');
app.use(session({
  secret: 'messages',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

//////// INDEX GET ROUTE /////////////////////////////
app.get('/', (req, res) => {
    Message.find().populate('comments').exec(function(err, messages){
        if(err){
            console.log("Errors");
        }else{
            res.render('index', {msgs:messages});
        }
    })
});

///////////  MESSAGE POST REQUEST ////////////////////
app.post('/message', (req, res) => {
    var message = new Message({ name:req.body.name, message:req.body.message});
    message.save(function(err){
        if(err){
            consol.log("Error!", err);
            for(var key in err.errors){
                req.flash('messageBoard', err.errors[key].message);
            }
            res.redirect('/');
        }else{
            console.log("Good job, you added a message!");
            res.redirect('/');
        }
    })
});

///////////  COMMENT POST REQUEST ////////////////////
app.post('/comment', (req, res) => {
    Comment.create({ name:req.body.name, comment:req.body.comment}, function(err, comment){
         if(err){
            consol.log("Error!", err);
            for(var key in err.errors){
                req.flash("commentBoard", err.errors[key].message);
            }
            res.redirect('/');
        }else{
            Message.findOneAndUpdate({_id: req.body.msgId}, {$push: {comments: comment}}, function(err, data){
                if(err){
                    console.log("Oops! Error!", err);
                    res.redirect('/');
                }else{
                    res.redirect('/');
                }
            })
        }
    })
});




