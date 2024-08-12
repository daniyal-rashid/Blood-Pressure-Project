const User = require("../models/user_model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleUserSignUp = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if ((!name, !email, !password, !age, !weight, !height)) {
      return res.json({ status: "failed", msg: "all fields are required" });
    }
    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      age: age,
      weight: weight,
      height: height,
    });

    if (user) {
      const { _id, name } = user;
      const token = jwt.sign({ _id, name }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      return res.json({ msg: "Succesfully Signed Up", token: token });
    }
  } catch (error) {
    res.json({ err: "error" });
  }
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ msg: "all fields are required" });
    }
    const user = await User.findOne({
      email: email,
    });
    const { _id, name } = user;
    if (user) {
      const validated = await bcrypt.compare(password, user.password);
      if (validated) {
        const token = jwt.sign({ _id, name }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        return res.json({ msg: "successfully login", token: token });
      } else {
        return res.json({ msg: "email or password is incorrect" });
      }
    } else {
      return res.json({ msg: "email or password is incorrect" });
    }
  } catch (error) {
    res.json({ err: "error" });
  }
};

module.exports = {
  handleUserSignUp,
  handleUserLogin,
};
