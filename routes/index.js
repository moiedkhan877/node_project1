var express = require('express');
var router = express.Router();
const userModel = require("../models/userModel");

const passport = require("passport");
const LocalStartegy = require("passport-local");
const { sendmail } = require("../utils/mail");


passport.use(new LocalStartegy(userModel.authenticate()));


/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Homepage", user: req.user });
});

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Sign-Up", user: req.user });
});

router.post("/signup", async function (req, res, next) {
  try {
      const { username, password, email } = req.body;

      const newuser = new userModel({ username, email });

      const user = await userModel.register(newuser, password);

      // await newuser.save();
      res.redirect("/signin");
  } catch (error) {
      res.send(error);
  }
});

router.get("/signin", function (req, res, next) {
  res.render("signin", { title: "Sign-In", user: req.user });
});

router.post("/signin",
  passport.authenticate("local", {
      failureRedirect: "/signin",
      successRedirect: "/profile",
  }),
  function (req, res, next) {}
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      console.log(req.user);
      const users = await userModel.find();
      res.render("profile", { title: "Profile", users, user: req.user });
  } catch (error) {
      res.send(error);
  }
});

router.get("/signout", isLoggedIn, async function (req, res, next) {
  req.logout(() => {
      res.redirect("/signin");
  });
});

router.get("/reset/:id", isLoggedIn, async function (req, res, next) {
  res.render("reset", {
      title: "Reset Password",
      id: req.params.id,
      user: req.user,
  });
});



router.post("/reset/:id", isLoggedIn, async function (req, res, next) {
  try {
      await req.user.changePassword(req.body.oldpassword, req.body.password);
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      res.send(error);
  }
});

router.get("/getemail", function (req, res, next) {
  res.render("getemail", { title: "Forget-Password", user: req.user });
});

router.post("/getemail", async function (req, res, next) {
  try {
      const user = await userModel.findOne({ email: req.body.email });

      if (user === null) {
          return res.send(
              `User not found. <a href="/get-email">Forget Password</a>`
          );
      }
      sendmail(req, res, user);
  } catch (error) {
      res.send(error);
  }
});

router.get("/changepassword/:id", function (req, res, next) {
  res.render("changepassword", {
      title: "Change Password",
      id: req.params.id,
      user: null,
  });
});

router.post("/changepassword/:id", async function (req, res, next) {
  try {
      const user = await userModel.findById(req.params.id);
      if (user.passwordResetToken === 1) {
          await user.setPassword(req.body.password);
          user.passwordResetToken = 0;
      } else {
          res.send(
              `link expired try again <a href="/get-email">Forget Password</a>`
          );
      }
      await user.save();

      res.redirect("/signin");
  } catch (error) {
      res.send(error);
  }
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/signin");
}



module.exports = router;
