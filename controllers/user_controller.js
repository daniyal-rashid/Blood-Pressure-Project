const User = require("../models/user_model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MedicalDocument = require("../models/medical_documents_model.js");
const uploadOnCloudinary = require("../utils/cloudinary.js");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { text } = require("express");

const handleUserSignUp = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;

    if ((!name, !email, !password, !age, !weight, !height)) {
      return res.json({ status: "failed", msg: "all fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const OTP = await otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      age: age,
      weight: weight,
      height: height,
      otpCode: OTP,
    });

    if (user.status === "Unverified") {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const sendEmail = async (email) => {
        let mailOptions = {
          from: process.env.SMTP_MAIL,
          to: email,
          subject: "VERIFY YOUR EMAIL",
          text: `Your OTP code is ${OTP} `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email has sent successfully");
          }
        });
      };

      sendEmail(email);

      return res.json({
        msg: "Please verify your email, The OTP has sent successfully to your email address",
      });
    }
  } catch (error) {
    res.json({ err: "error" });
  }
};

const handleUserVerify = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const { otpCode, name, _id } = user;
      if (parseInt(otpCode) === parseInt(code)) {
        const verifyUser = await User.findOneAndUpdate(
          { email: email },
          { status: "Verified" }
        );
        const token = jwt.sign({ _id, name }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        return res.json({ msg: "successfully verified", token: token });
      } else {
        return res.json({ error: "Invalid OTP" });
      }
    } else {
      return res.json({ error: "User not found" });
    }
  } catch (error) {
    res.json({ err: error.message });
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
    const { _id, name, status, otpCode } = user;

    if (user) {
      if (status === "Verified") {
        const validated = await bcrypt.compare(password, user.password);
        if (validated) {
          const token = jwt.sign({ _id, name }, process.env.JWT_SECRET, {
            expiresIn: "30d",
          });
          return res.json({ msg: "Successfully logged In", token: token });
        } else {
          return res.json({ msg: "email or password is incorrect" });
        }
      } else {
        const validated = await bcrypt.compare(password, user.password);
        if (validated) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.SMTP_MAIL,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          const sendEmail = async (email) => {
            let mailOptions = await {
              from: process.env.SMTP_MAIL,
              to: email,
              subject: "VERIFY YOUR EMAIL",
              text: `Your OTP code is ${otpCode} `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("email has sent successfully");
              }
            });
          };

          sendEmail(email);

          return res.json({
            msg: "Please verify your email, The OTP has sent successfully to your email address",
          });
        } else {
          return res.json({ msg: "email or password is incorrect" });
        }
      }
    } else {
      return res.json({ msg: "User not found" });
    }
  } catch (error) {
    res.json({ err: "error" });
  }
};

const uploadMedicalDocument = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verify;

    const medicalDocumentLocalPath = req.files?.medicalDocument[0]?.path;
    const medicalDocument = await uploadOnCloudinary(medicalDocumentLocalPath);

    const document = await MedicalDocument.create({
      userId: _id,
      document: medicalDocument.url,
    });

    res.json({ data: document });
  } catch (error) {
    res.json({ status: "failed", msg: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verify;

    const allDocuments = await MedicalDocument.find({ userId: _id });

    res.json({ status: "success", data: allDocuments });
  } catch (error) {
    res.json({ status: "failed", msg: error.message });
  }
};

const handleViewProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verify;

    const user = await User.findById({ _id: _id });
    res.json({ data: user });
  } catch (error) {
    res.json({ status: "failed", msg: error.message });
  }
};

const handleEditProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verify;

    const { name, age, height, weight } = req.body;
    const profilePicLocalPath = req.files?.profilePic[0]?.path;
    const profilePic = await uploadOnCloudinary(profilePicLocalPath);

    const user = await User.findByIdAndUpdate(
      { _id: _id },
      {
        name: name,
        age: age,
        height: height,
        weight: weight,
        profilePic: profilePic.url,
      }
    );

    res.json({ data: user });
  } catch (error) {
    res.json({ status: "failed", msg: error.message });
  }
};
module.exports = {
  handleUserSignUp,
  handleUserVerify,
  handleUserLogin,
  uploadMedicalDocument,
  getAllDocuments,
  handleEditProfile,
  handleViewProfile,
};
