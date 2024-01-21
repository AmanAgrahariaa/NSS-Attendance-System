const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const connectDatabase = require("./database/conn");
const User = require("./models/user");
const Event = require("./models/event");
const Admin = require("./models/admin");
require("dotenv").config();



const CORS_URL = process.env.CORS_URL;
const port = process.env.PORT || 5000;

const moment = require("moment-timezone");
// Assuming you have the necessary imports and setup for the Event model

// Generate a secure secret key
const secretKey = process.env.secretKey;


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ origin: CORS_URL, credentials: true }));

router.get("/checkAuth", async (req, res) => {
  console.log("/checkAuth");

  // Retrieve the token from the Authorization header
  const authorizationHeader = req.headers.authorization;

  const token = authorizationHeader && authorizationHeader.split(" ")[1];

  if (token === "null") {
    return res.json({ success: false, message: "Not Logged In" });
  }
  else {
    const decodedToken = jwt.decode(token);
    const adminType = decodedToken.adminType;
    const adminEmail = decodedToken.email;
    const admin = Admin.findOne({ email: adminEmail });
    if (!admin) {
      return res.json({ success: false, message: "User Not found" });
    }
    return res.json({
      success: true,
      adminType: adminType,
      message: "Already Logged In",
    });
  }
});

router.post("/login", async (req, res) => {
  console.log(secretKey);
  const { email, password } = req.body;
  const admin = await Admin.findAndValidate({ email, password });

  try {
    if (admin) {
      const token = jwt.sign(
        { email: admin.email, adminType: admin.adminType },
        secretKey,
        { expiresIn: "24h" } // Token expires in 24 hours
      );

      // // // Verify and decode the token
      // const decodedToken = jwt.verify(token, secretKey);
      // // Access the value of isAdmin from the decoded token
      // const isAdmin = decodedToken.adminType;
      // console.log(decodedToken, isAdmin);

      res.json({ success: true, message: "Login successful", token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

// 5b8139b117876a3f4991ae0fbf2ab219712a040912fd036fbfc1d2ed8ea04229

router.post("/addAdmin", async (req, res) => {
  console.log("Enters in /addAdmin Route");
  const {
    name,
    registrationNumber,
    email,
    adminType,
    position,
    course,
    branch,
    year,
  } = req.body;
  const password = registrationNumber;
  try {
    let admin = new Admin({
      name,
      registrationNumber,
      email,
      password,
      position,
      adminType,
      course,
      branch,
      year,
    });
    await admin.save();
    res.json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error occured" });
  }
});

router.post("/addUser", async (req, res) => {
  console.log("Enters in /addUser Route");
  const { name, registrationNumber, email, course, branch, year } = req.body;
  const password = registrationNumber;
  // console.log(name, registrationNumber, password, course, branch, year);
  try {
    let user = new User({
      name,
      registrationNumber,
      password,
      email,
      course,
      branch,
      year,
    });
    console.log(user);
    await user.save();
    res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error occured" });
  }
});

router.put("/updateUser/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update the user properties
    user.name = req.body.name;
    user.registrationNumber = req.body.registrationNumber;
    user.email = req.body.email;
    user.course = req.body.course;
    user.branch = req.body.branch;
    user.year = req.body.year;

    await user.save();

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log("hey, error occurred");
    res.json({ success: false, message: "Error occurred" });
  }
});

router.delete("/deleteUser/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const deletedUser = await User.findByIdAndRemove(id);

    if (deletedUser) {
      return res.json({ success: true, message: "User deleted successfully" });
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occurred while deleting user",
    });
  }
});

router.put("/updateAdmin/:id", async (req, res) => {
  const { id } = req.params;
  console.log("/updateAdmin");

  try {
    const admin = await Admin.findOne({ _id: id });
    console.log(admin);

    if (!admin) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update the user properties
    admin.name = req.body.name;
    admin.registrationNumber = req.body.registrationNumber;
    admin.email = req.body.email;
    admin.position = req.body.position;
    admin.adminType = req.body.adminType;
    admin.course = req.body.course;
    admin.branch = req.body.branch;
    admin.year = req.body.year;
    console.log(
      admin.name,
      admin.registrationNumber,
      admin.email,
      admin.adminType,
      admin.course,
      admin.branch,
      admin.year
    );

    await admin.save();

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log("hey, error occurred");
    res.json({ success: false, message: "Error occurred" });
  }
});

router.delete("/deleteAdmin/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const deletedUser = await Admin.findByIdAndRemove(id);

    if (deletedUser) {
      // console.log("deletedUser")
      console.log(deletedUser)
      return res.json({ success: true, message: "User deleted successfully" });
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occurred while deleting user",
    });
  }
});

router.post("/addEvent", async (req, res) => {
  const { name, startDate, endDate } = req.body;
  // console.log(startDate + "            " + endDate);

  try {
    // Convert start and end dates to Indian Standard Time (IST) using moment-timezone
    const indiaTimeZone = "Asia/Kolkata";
    const format = "YYYY-MM-DDTHH:mm";
    const convertedStartDate = moment
      .tz(startDate, format, indiaTimeZone)
      .toDate();
    const convertedEndDate = moment.tz(endDate, format, indiaTimeZone).toDate();
    // console.log(convertedStartDate+"               //////            "+convertedEndDate)
    // Create a new Event instance with the correct date format
    let event = new Event({
      eventName: name,
      startDate: convertedStartDate,
      endDate: convertedEndDate,
    });

    await event.save();
    res.json({ success: true, message: "Event created successfully" });
  } catch (error) {
    console.error("Error saving event:", error);
    res.json({ success: false, message: "Error occurred" });
  }
});

router.put("/updateEvent/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  console.log("/updateEvent");

  try {
    const event = await Event.findOne({ _id: id });
    console.log(event);

    if (!event) {
      return res.json({ success: false, message: "Event not found" });
    }

    // Convert startDate and endDate to Indian Standard Time (IST)
    const indiaTimeZone = "Asia/Kolkata";
    event.eventName = req.body.eventName;
    event.startDate = moment.tz(req.body.startDate, indiaTimeZone).toDate();
    event.endDate = moment.tz(req.body.endDate, indiaTimeZone).toDate();

    console.log(
      "hello " + event.eventName + "  " + event.startDate + "  " + event.endDate
    );
    await event.save();

    res.json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    console.log("Error occurred:", error);
    res.json({ success: false, message: "Error occurred" });
  }
});

router.delete("/deleteEvent/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const deletedEvent = await Event.findByIdAndRemove(id);
    if (deletedEvent) {
      return res.json({ success: true, message: "Event deleted successfully" });
    } else {
      return res.json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occurred while deleting event",
    });
  }
});

router.get("/showAdmins", async (req, res) => {
  // Fetch all fields except the 'password' field
  const adminData = await Admin.find().select("-password");
  try {
    if (adminData.length > 0) {
      res.json(adminData);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/showUsers", async (req, res) => {
  const userData = await User.find();
  try {
    if (userData) {
      res.json(userData);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/showEvents", async (req, res) => {
  const eventData = await Event.find();
  try {
    if (eventData) {
      res.json(eventData);
    } 
    else 
    {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/takeAttendance", async (req, res) => {
  try {
    // Retrieve the eventName and userEmail from the request body
    const { eventName, userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });

    // Check if the eventName and userEmail are valid and not empty
    if (!eventName || !user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data" });
    }

    const exist = user.events.includes(eventName);

    if (exist) {
      return res.json({
        success: true,
        message: "Attendance already recorded",
      });
    }

    user.events.push(eventName);
    await user.save();

    // Assuming the attendance logic is successful, send a success response
    res.json({ success: true, message: "Attendance recorded successfully" });
  } catch (error) {
    // Handle any error that occurred during the process
    console.error("Error while recording attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/deleteAttendance", async (req, res) => {
  try {
    // Retrieve the studentID
    const { eventName, userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });

    if (!user || !eventName) {
      return res
        .status(400)
        .json({ success: false, message: "Error in deleting attendance" });
    }

    const exist = user.events.includes(eventName);
    if (!exist) {
      return res.json({ success: true, message: "Attendance already deleted" });
    }

    // Find the index of the element to delete
    let index = user.events.indexOf(eventName);

    if (index !== -1) {
      // Delete the element using splice()
      user.events.splice(index, 1);
    }
    await user.save();

    res.json({ success: true, message: "Deleted Successfully" });
  } catch (error) {
    // Handle any error that occurred during the process
    console.error("Error deleting attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.use(router);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
