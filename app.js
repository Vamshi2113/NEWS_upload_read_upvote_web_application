const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 80;
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const { stringify } = require("querystring");
const cookieParser = require('cookie-parser')
const uuid = require('uuid');
const multer = require("multer");














// EXPRESS SPECIFIC STUFF
app.use('/static',express.static('static')) // For serving static files\





// PUG SPECIFIC STUFF
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory

//----------multer-----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

//--------------------------------------------------




main().catch(err => console.log(err)
);
async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect('mongodb://localhost:27017/testdb',{
    useUnifiedTopology: true
  });
  console.log("connected");
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
var db=mongoose.connection;
db.once('open',function(){
  console.log("connected...................;;");
})


//==================================================================================================================================
//==================================================================================================================================
//==================================================================================================================================






//========================================================register data====================================
var createaccountschema = new mongoose.Schema({
  name: String,
  age:String,
  phone:String,
  email:String,
  username:String,
  password:String,
  profileimg:Number

});

var createaccountmodel = mongoose.model('account',createaccountschema);
var mdata;




var submitreportschema = new mongoose.Schema({
  account:String,
  headline:String,
  content:String,
  upvotes:Number,
  profileimg:Number
});

var submitreportmodel = mongoose.model('report',submitreportschema);

var submitdata;


var myupvotesschema = new mongoose.Schema({
  username:String,
  voted:String,
});

var votedmodel = new mongoose.model('vote',myupvotesschema);


const imageSchema = new mongoose.Schema({                                             //image schema
  image: {
      data: Buffer,
      contentType: String
  },
  username:String
});
const ImageModel = mongoose.model("Image", imageSchema);



//===================================================================================================================================
///====================================================================cookies=======================================================
//===================================================================================================================================

var sessionsschema = new mongoose.Schema({
  sessionToken:String,
  username: String,
  expiresAt:Date,                                                   //creating schema for sessions
});

var sessionsmodel = mongoose.model('session',sessionsschema);

class Session {
  constructor(token,username, expiresAt) {
      this.sessionToken=token
      this.username = username
      this.expiresAt = expiresAt
  }                                                                                //creating a constructor for object stored as session

  // we'll use this method later to determine if the session has expired
  isExpired() {
      this.expiresAt < (new Date())
  }
}


//--------------------------------------------handlers--------------------------------------------------------

const signinHandler = async (req, res) => {
  // get users credentials from the JSON body
  const username=req.body.username
  const password=req.body.password

  { username, password }

  if (!username) {
      // If the username isn't present, return an HTTP unauthorized code
      res.status(401).end()
      return
  }

  // validate the password against our data
  // if invalid, send an unauthorized code

  var data=await createaccountmodel.findOne({username:username});


  const expectedPassword = data.password
  if (!expectedPassword || expectedPassword !== password) {
      res.status(401).end()
      return
  }

  // generate a random UUID as the session token
  const sessionToken = uuid.v4()
  console.log("146",sessionToken)

  // set the expiry time as 120s after the current time
  const now = new Date()
  const expiresAt = new Date(+now + 120 * 1000)
  console.log("expires at",expiresAt)

  // create a session containing information about the user and expiry time
  const session = new Session(sessionToken,username, expiresAt)

  console.log("155",session)

  // add the session information to the sessions map
  var currentsession = new sessionsmodel(session);
  console.log("158",currentsession)

  currentsession.save();

  // In the response, set a cookie on the client with the name "session_cookie"
  // and the value as the UUID we generated. We also set the expiry time
  res.cookie("session_token", sessionToken, { expires: expiresAt })
  res.end()
}











//=======================================================================================================================================
//========================================================================================================================================
//======================================================================login===========================================================
app.use(express.json());
app.use(express.urlencoded());

app.get('/',(req,res)=>{

    res.render('loginpage.pug');
})

app.post('/',async(req,res) =>{

  //------------------------------------------------------------------------------------------------------------------------
  const username=req.body.username
  const password=req.body.password

  { username, password }

  if (!username) {
      // If the username isn't present, return an HTTP unauthorized code
      res.status(401).end()
      return
  }

  // validate the password against our data
  // if invalid, send an unauthorized code

  var data=await createaccountmodel.findOne({username:username});

  if(data==null){
    res.status(401).end()
    return
  }

  


  const expectedPassword = data.password
  if (!expectedPassword || expectedPassword !== password) {
      res.status(401).end()
      return
  }

  // generate a random UUID as the session token
  const sessionToken = uuid.v4()
  console.log("146",sessionToken)

  // set the expiry time as 120s after the current time
  const now = new Date()
  const expiresAt = new Date(+now + 120 * 1000)

  // create a session containing information about the user and expiry time
  const session = new Session(sessionToken,username, expiresAt)

  console.log("155",session)

  // add the session information to the sessions map
  var currentsession = new sessionsmodel(session);
  console.log("158",currentsession)

  currentsession.save();

  // In the response, set a cookie on the client with the name "session_cookie"
  // and the value as the UUID we generated. We also set the expiry time
  res.cookie("session_token", sessionToken, { expires: expiresAt })
  
  //------------------------------------------------------------------------------------------------------------------------
    var data=await createaccountmodel.findOne({username:username});
    if(data==undefined){
      
      res.redirect("/");
    }
    else if (req.body.password==data.password){
      mdata=data;
      res.redirect('/home');

      app.use(cookieParser())

      app.get('/home',async (req,res)=>{
        //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------
        var myname=userSession[0].username

        
        var params={name:myname}
        res.render('home.pug',params);
      });
        app.get('/dashboard',async(req,res)=>{


           //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------
        var myname=userSession[0].username
          
          var mdata=await createaccountmodel.findOne({username:myname});
          var submitdata=await submitreportmodel.find({account:myname},{headline:1,content:1,_id:0});

          var profileimg=await ImageModel.findOne({username:myname},{username:0});
          
          //--------------------------------------------------default image encoding------------------------------
          const file = fs.readFileSync('./static/images/defaultprofileimg.png')
          const defaultimage = Buffer.from(file).toString('base64')
          //------------------------------------------------------------------------------------------------------

          if(profileimg){
            let img=Buffer.from(profileimg.image.data).toString('base64');
            var params={'name':mdata.name,'email':mdata.email,'phone':mdata.phone,'submitdata':submitdata,profileimg:img};
          }
          else{
            var params={'name':mdata.name,'email':mdata.email,'phone':mdata.phone,'submitdata':submitdata,profileimg:defaultimage};

          }
          
          res.render('dashboard.pug',params);
        });

        app.get('/submitreport',async(req,res)=>{


          res.render('submitreport.pug');
        });

        app.use(express.json());
        app.use(express.urlencoded());
        app.post('/submitreport',async(req,res)=>{

          //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

           //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------


          //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
          var myname=userSession[0].username
          var profileimg= userSession = await createaccountmodel.findOne({username:myname},{profileimg:1});
          
          var data={account:myname,headline:req.body.headline,content:req.body.content,upvotes:0,profileimg:profileimg.profileimg};
          console.log(data);

          var sub1 = new submitreportmodel(data);
          console.log("name is",data.account);   
          sub1.save(function(err,k){
          if(err) return console.log(err);
          k.speak
         });

         res.redirect('/dashboard');

        });

        app.get('/trending',async(req,res)=>{


           //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------
        
        var myname=userSession[0].username


          var submitdata=await submitreportmodel.find({},{account:1,headline:1,content:1,_id:1,upvotes:1,profileimg:1});

          var profileimgs=await ImageModel.find({},{});

          for (let i = 0; i < submitdata.length; i++) {

           var username=submitdata[i].account

           if(submitdata[i].profileimg==1){
            console.log("i=>",i)

           for(let x=0;x<profileimgs.length;x++){
            console.log("x=>",x)

            if(username==profileimgs[x].username){
              
              submitdata[i].img= Buffer.from(profileimgs[x].image.data).toString('base64');
              console.log(username)
              
            }
            

           }

          }else{
            submitdata[i].img=null;
            console.log("fin?")
          }
          console.log('hellow')
          }
          console.log("wow")
          console.log("here==>",submitdata)
          

          var myvotes=await votedmodel.find({username:myname},{voted:1,_id:0})          //finding the votes u have done

          var myvotesArray = myvotes.map(function (obj) {            //converting resulted array of objs to an arry
            return obj.voted;
          });

         

          submitdata=submitdata.reverse();
          var params={submitdata:submitdata,myvotes:myvotesArray};
          res.render('trending.pug',params);

        });

        app.use(bodyParser.text({ type: 'text/*' }))
        
        app.post('/trendingm',async (req,res)=>{

          //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------
          var reqdata=JSON.parse(req.body);
          var myname=userSession[0].username
          var id=reqdata._id;

          var voteddata={username:myname,voted:id}
          console.log(voteddata)
          var voteddataobj=new votedmodel(voteddata);

          console.log(voteddataobj)


          if(reqdata.state==0){

            
          
            var reportx=await submitreportmodel.findById(id)
            var currnum=reportx.upvotes;
            var afternum=currnum+1;
          
            await submitreportmodel.updateOne({_id:id}, { $set: { upvotes:currnum+1 } });

            voteddataobj.save();

          
            res.json({"upvotes":afternum});
           

          }else if(reqdata.state==1){

            var id=reqdata._id;
          
            var reportx=await submitreportmodel.findById(id)
            var currnum=reportx.upvotes;
            var afternum=currnum-1;
          
            await submitreportmodel.updateOne({_id:id}, { $set: { upvotes:currnum-1 } });
            votedmodel.deleteOne({username:myname,voted:id},{}).then(function(){
           }).catch(function(error){
              console.log(error); // Failure
           });
          
            res.json({"upvotes":afternum});
          

          }
         




        });

        app.get('/editaccount',(req,res)=>{

          res.render('edit.pug')
        });

        app.use(express.json());
        app.use(express.urlencoded());

        app.post('/editaccount',upload.single("myImage"),async (req,res)=>{


          //=====================================================================================================================
 //--------------------------------------------------------------------------------------------------------------------
           // if this request doesn't have any cookies, that means it isn't
           // authenticated. Return an error code.
           if (!req.cookies) {
            console.log("263")
             res.status(401).end()
             return
         }
       
         // We can obtain the session token from the requests cookies, which come with every request
         const sessionToken = req.cookies['session_token']
         if (!sessionToken) {
          console.log("270")
             // If the cookie is not set, return an unauthorized status
             res.status(401).end()
             return
         }
       
         // We then get the session of the user from our session map
         // that we set in the signinHandler
         userSession = await sessionsmodel.find({sessionToken:sessionToken});
         if (!userSession) {
          console.log("279")
             // If the session token is not present in session map, return an unauthorized error
             res.status(401).end()
             return
         }
         // if the session has expired, return an unauthorized error, and delete the 
         // session from our map
         if (userSession.expiresAt < (new Date())) {

          sessionsmodel.remove({sessionToken:sessionToken})

          console.log("289")

             res.status(401).end()
             
             return
         }
       
         // If all checks have passed, we can consider the user authenticated and
         // send a welcome message
       
        //---------------------------------------------------------------------------------------------------------------------
           //=====================================================================================================================
          var myname=userSession[0].username
          const obj = {
            img: {
                data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
                contentType: "image/png"
            }

        }
        const newImage = new ImageModel({
              image: obj.img,
              username:myname
          });

        newImage.save(async (err) => {
            err ? console.log(err) : await createaccountmodel.updateOne({username:myname}, { $set: { profileimg:1 } });
            res.redirect("/dashboard");
        })
    
        });

        app.get('/contactus',(req,res)=>{
          res.redirect('/')
        })





        


    }else{
      
      res.render('loginpage.pug');
    }

   
})

//=========================================================================signup=====================================================
app.use(express.json());
app.use(express.urlencoded());

app.get('/createaccount',(req,res)=>{ 
  res.render('createaccount.pug');
})


app.post('/createaccount',async (req,res)=>{
  req.body.profileimg=0;
  res.send(req.body);
  console.log(req.body);
  var accountdata=req.body;

  
  var acc1 = new createaccountmodel(accountdata);
  console.log(acc1.name);   
  acc1.save(function(err,k){
    if(err) return console.log(err);
    k.speak
  });
  
})


//==========================================================================dashboard=======================================================


//===========================================================================


// START THE SERVER
app.listen(port, ()=>{
  console.log(`The application started successfully on port ${port}`);
});