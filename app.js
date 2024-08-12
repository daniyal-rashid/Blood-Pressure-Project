const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./db/db_connection.js");
const router = require("./routes/route.js");
const authenticationMiddleware = require("./middleware/authentication.js");

const PORT = process.env.PORT || 1500;

app.use(cors());

app.use(express.json({}));

connectDB();

app.use("/", router);
app.use("/user", authenticationMiddleware, router);

app.get("/", (req, res) => {
  res.send("home page");
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
