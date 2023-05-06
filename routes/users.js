var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../mongo");
const { verifyToken } = require('../Middleware/middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    
    const saltRounds = 5;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    let newUser = {
      name: name,
      email: email,
      password: hash,
      message: '',
      fulfilled: true
  }
  //console.log(req.body);
    let findUser = await db().collection('final-project').findOne({
      email: email
    });

    if (!name) {
      throw {
        message: "Name is required."
      }
    }
    if (findUser) {
      throw { 
        message: "User exists!"
      }
    };

    let savedUser = await db().collection('final-project').insertOne(newUser);
    console.log(newUser);

    res.json({
      success: true,
      user: newUser
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.message
    });
  }
})

router.post('/signin', async (req, res) => {
  try {
  

    let foundUser = await db().collection('final-project').findOne({
      email: req.body.email
    });
    if (!foundUser) {
      throw {
        status: 404,
        message: "User does not exist."
      }
    };

    let checkPassword = await bcrypt.compare(req.body.password, foundUser.password);

    if (!checkPassword) {
      throw {
        status: 404,
        message: "Incorrect password."
      }
    };

    const exp = Math.floor(Date.now() / 1000) + (60 * 60)
    const payload = {
       email: req.body.email,
        exp 
      };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY)

    res.json({
      success: true,
      token: token,
      user: {
        email: foundUser.email,
        name: foundUser.name,
        password: foundUser.password,
    }
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error
    });
  }
});

router.post('/addMatch', async (req, res) => {
  try {
  let email = ''
  let bearerToken = req.headers.authorization;
   if (bearerToken) {
    const token = bearerToken.split(' ')[1];
    req.token = token;
    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.decoded = decoded
    email = decoded.email
    console.log(decoded);
}
console.log(bearerToken)
    const savedMatch = {
      ...req.body
    }

    //fix this code
    let findUser = await db().collection('final-project').findOne({
      name: req.body.name
    });

    if (findUser) {
      throw { 
        message: "Match already added."
      }
    } 

    let updateUser = await db().collection('final-project').updateOne({
      email: email
    }, {
      $push: {
        savedMatch
      }
    }
    );
    
    
    console.log(updateUser)
    res.json({
      success: true,
      newMatch: savedMatch
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.toString()
    });
  }
});

router.get('/getMatches', async (req, res) => {
  try {
    let email = ''
    console.log(req.headers.authorization);
    let bearerToken = req.headers.authorization;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1];
      req.token = token;
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      req.decoded = decoded
      email = decoded.email
      console.log(decoded);
}
console.log(req.headers);
    let foundUser = await db().collection('final-project').findOne({
      email: email
    });
    console.log(foundUser);
    res.json({
      success: true,
      foundUser: foundUser
    })

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.toString()
    });
  }
})

router.put('/updateUser', async (req, res) => {
  try {
  
    let email = ''
    let bearerToken = req.headers.authorization;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1];
      req.token = token;
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      req.decoded = decoded
      email = decoded.email
}
//console.log(req.headers);
    const saltRounds = 5;
    // const salt = await bcrypt.genSalt(saltRounds);
    // const hash = await bcrypt.hash(req.body.password, salt);
    
    let findUser = await db().collection('final-project').findOne({
      email: email
    });
    const updateInfo = await db().collection('final-project').updateOne({
      email: email
      }, {
       $set: {
         name: req.body.name ? req.body.name : {message: 'Name is required.'},
         email: req.body.email ? req.body.email : 'Email is required.',
        //  password: req.body.password ? hash : 'Password is required.'
       },
     })

   console.log(updateInfo);
    res.json({
      success: true,
      updateInfo: {
        name: findUser.name,
        email: findUser.email
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.toString()
    });
  }
});

router.get('/getCurrentAcct', async (req, res) => {
  try {
    let activeUser = {
      name: '',
      email: ''
    }
    let email = ''
    console.log(req.headers.authorization);
    let bearerToken = req.headers.authorization;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1];
      req.token = token;
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      req.decoded = decoded
      email = decoded.email
      console.log(decoded);
    }

console.log(req.headers);
  
    
    let foundUser = await db().collection('final-project').findOne({
      email: email
    });
    
   
    activeUser = {
        name: foundUser.name,
        email: foundUser.email
      }
      console.log(activeUser);
    res.json({
      success: true,
      user: activeUser
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.toString()
    });
  }
})

router.post('/authToken', async (req, res) => {
  try {

    verifyToken()
    let email = ''
    let bearerToken = req.headers.authorization;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1];
      //req.token = token;
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      //req.decoded = decoded
      email = decoded.email
      console.log(decoded);
   

  //   if (decoded.exp < Date.now()/1000) {
  //     throw {
  //         message: "Token Expired"
  //     }
  // } 
  // req.decoded = decoded


console.log(req.headers);
}
    
    let foundUser = await db().collection('final-project').findOne({
      email: email
    });

//     if (!foundUser) {
//       throw {
//         message: 'User does not exist!'
//       }
//     } else {
//   throw {
//       message: 'Forbidden'
//   }
// } 

    res.json({
      success: true,
      user: foundUser});
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      error: error.toString()
    });
  }
})
module.exports = router;
