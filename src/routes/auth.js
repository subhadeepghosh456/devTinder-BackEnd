const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();

    const token = await user.getJWT();

    // console.log(token);

    res.cookie("token", token, {
      // expires: new Date(Date.now() + 8 * 3600000),
      expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // despite of doing this,the cookie expire showing me,2024-10-30T06:49:42.869Z why?
      httpOnly: true,
    });

    res.send(savedUser);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials!");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      // console.log(token);

      res.cookie("token", token, {
        // expires: new Date(Date.now() + 8 * 3600000),
        expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // despite of doing this,the cookie expire showing me,2024-10-30T06:49:42.869Z why?
        httpOnly: true,
      });
      res.send(user);
    } else {
      throw new Error("Invalid Credentials!");
    }
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("Logout successfull!");
});

module.exports = authRouter;
