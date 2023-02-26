const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");
const { findById } = require("../models/User");

// JWT Token we are using for authentication has 3 parts. HEADER, PAYLOAD, SIGNATURE
// SIGNATURE is given by us so below is that signature we give in the token
// We should not change the payload
const JWT_SECRET = "lokeshmelkaniminotebookapp";

// ROUTE 1: Create a user using: POST "/api/auth". It does not require authentication means no need for the user to logged in for this
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password length must be min 5 letter").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // Using express validator for validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // checking whether user with same email exits already or not
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Sorry, User with same email already exits",
          });
      }
      // Generating the salt
      const salt = await bcrypt.genSalt(10);
      // Create a Secure Password
      const secPass = await bcrypt.hash(req.body.password, salt);
      // If user with same email does not exits, create a user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      // give the user as a response
      // res.json(user);
      // Give JWT token as a response
      // To fetch the user faster we will use _id from mongodb
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log(jwtData);
      success = true;
      res.json({ success, authToken });
    } catch (err) {
      // catch the error if there
      console.log(err.message);
      // return server error status code
      res.status(500).send("Some error occured");
    }

    /*
    .
    then((user) => res.json(user))
    .catch((err) => {
      console.log("Error in user creation ", err);
      res.json({
        error: "Please enter a unique value for email",
        message: err.message,
      });
    });
    */
  }
);

// ROUTE 2: Authenticate a user using: POST "/api/auth/login". It does not require authentication means no need for the user to logged in for this
// We will authenticate the user through email and password
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password Cannot be Blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please Try to Login with correct Credentials" });
      }
      // We willl compare the stored password of user from our database and the password entered by the user and it internally compare all the hashes.
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        // If password does not match
        success = false;
        return res.status(400).json({
          success,
          error: "Please Try to Login with correct Credentials",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      // catch the error if there
      console.log(error.message);
      // return server error status code
      res.status(500).send("Internal Server Error Occured");
    }
  }
);

// ROUTE 3: Get User details who is logged in using POST: "/api/auth/getuser". Log in is required
// We need to send jwtToken

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    // we have stored user id in the token so we findbyID
    // .select will select all the fields
    // -password means select all the fields except the password
    // We need to decode the auth token such that we can take out user id from it and once we get the user id, we can get the data from mongo using findById
    // We need a middleware which can decode the user for us so that we do not need to copy paste same piece of code everywhere and we can directly use our middleware inside the function where we need to decode the user
    // Middleware is just a function which works in the time between a request is made and a response is sent
    // Middleware takes a Request, response and next where next is the function which will run after the middleware has finished executing.
    // We will send auth-token in req.Header through Middleware and get the user id and get the user through it.
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    // catch the error if there
    console.log(error.message);
    // return server error status code
    res.status(500).send("Internal Server Error Occured");
  }
});

module.exports = router;

/*
When a user log in
A jwt token is provided
and a hash is generated for the password
hash is a ome way function
and data in mongodb is stored but password is stored in form of a hash
when user log in backend will make hash of the password entered by the user and it will compare that hash with the hash stored in mongoDB and if hashes matches it will give you the access.
Now if your data base is hacked, hacker will have hash of password
we cannot convert hash back to original password and hash ka hash will be different so we get away from being hacked
But nowadays hackers have Rainbow table which has solution to almost all the hashes
So we use Salt and pepper in the hash generated.
Salt is random string of characters which is common to all database
We add salt to the hash of our password
Salt is also stored in the database
Now our website will store hash and salt also and when user log in
Backend compares hash+salt with hash in database
Pepper is another layer of extra protection over salt
Salt is stored in database but pepper is not stored in db.it only resides in backend.

When someone logged in what will be give to them?
We will give them a JSON Web Token
*/
