require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const errorHandler = require("./utils/errorHandler");
const cityListingsRouter = require("./routes/cityListings");
const listingsRouter = require("./routes/listings");
const usersRouter = require("./routes/users");
const favoriteRouter = require("./routes/favorites");
const citiesRouter = require("./routes/cities");
const villageRouter = require("./routes/village");
const categoriesRouter = require("./routes/categories");
const statusRouter = require("./routes/status");
const citizenServicesRouter = require("./routes/citizenServices");
const contactUsRouter = require("./routes/contactUs");
const moreInfoRouter = require("./routes/moreInfo");
const advertisement = require("./routes/ads")
const fileUpload = require("express-fileupload");
const headers = require("./middlewares/headers")

// defining the Express app
const app = express();

// defining an array to work as the database (temporary solution)
const message = {
    message: "Hello world!! Welcome to HEIDI!!",
};

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.use(headers)

app.use(
    fileUpload({
        limits: {
            fileSize: 25000000,
        },
        abortOnLimit: true,
    })
);

app.get("/", (req, res) => {
    res.send(message);
});

app.use("/users", usersRouter);
app.use("/cities", citiesRouter);
app.use("/listings", listingsRouter);
app.use("/categories", categoriesRouter);
app.use("/status", statusRouter);
app.use("/citizenServices", citizenServicesRouter);
app.use("/contactUs", contactUsRouter);
app.use("/moreInfo", moreInfoRouter);
app.use(
    "/users/:userId/favorites",
    function (req, res, next) {
        if (
            isNaN(Number(req.params.userId)) ||
            Number(req.params.userId) <= 0
        ) {
            return next(new AppError(`Invalid user id given`, 400));
        }
        req.paramUserId = req.params.userId;
        next();
    },
    favoriteRouter
);
app.use(
    "/cities/:cityId/villages",
    function (req, res, next) {
        if (
            isNaN(Number(req.params.cityId)) ||
            Number(req.params.cityId) <= 0
        ) {
            return next(new AppError(`Invalid city id given`, 400));
        }
        req.cityId = req.params.cityId;
        next();
    },
    villageRouter
);
app.use(
    "/cities/:cityId/listings",
    function (req, res, next) {
        if (
            isNaN(Number(req.params.cityId)) ||
            Number(req.params.cityId) <= 0
        ) {
            return next(new AppError(`Invalid city id given`, 400));
        }
        req.cityId = req.params.cityId;
        next();
    },
    cityListingsRouter
);
app.use("/ads", advertisement)
app.all("*", (req, res, next) => {
    next(new AppError(`The URL ${req.originalUrl} does not exists`, 404));
});
app.use(errorHandler);

// starting the server
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
});

process.on("uncaughtException", function (err) {
    console.error(
        `${new Date().toUTCString()}: UncaughtException: ${err.message}\n${
            err.stack
        }`
    );
    process.exit(1);
});
