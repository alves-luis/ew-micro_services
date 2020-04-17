// import necessary modules.
// following lines return a function for each imported module

// module to support REST APIs developement.
const express = require('express');

// module to support JSON files parsing and formate confirmation. Used in the POST  request.
const Joi = require('@hapi/joi');

// now we call the function express that returns an object of type Express that we call app.
// app objects has a bunch of usefull methods just type app. and wait for the autocompletion.
/* 
app.get()
app.post()
app.put()
app.delete() 
*/

const app = express();

// Allow that json params are parsed during handle of requests.
// Works as adding - app.use() - a piece of middleware - express.json() - for handling requests
app.use(express.json());

// array of vehicles to store vehicles information (for simplicity to avoid the use of database)
const vehicles = [
    {id: 1, license:'12-AA-32', locations: []},
    {id: 2, license:'43-BB-23', locations: []},
    {id: 3, license:'45-CC-23', locations: []},
];

// get method to provide as response all  vehciles that are in the object store variable
app.get('/api/vehicles', (req, res) => {
    res.send(vehicles);
});

// get method returns the information about a vehicle when a vehicle id is passed as argument :id
// you can extend the number of route parameters by extending the url params: /api/vehicles/:id/:year/:month. Access by req.parans object.
// you also have the possibility to pass query string parameters using ? after the route parameters: 
// e.g., /api/vehicles/:id/:year/:month?sortBy=license. Access by req.query object.
// find is a methoc avaiailble for an array object that receives as a augument a function. => syntax is used to define the functional that will iterate over the array.
app.get('/api/vehicles/:id', (req,res) => {
    // if vehcile is not found vehicle is set to null
    const vehicle = vehicles.find(c => c.id === parseInt(req.params.id));
    if (!vehicle) 
        return res.status(404).send('The vehicle id given ID was not found!');
    else 
        res.send(vehicle);
});


// app.post method allow to create a new vehicle by receiving a new license place.
// post methods shall read vehicle information that is part of the request and use its properties to create a new vehicle. 
// use Postman to build POST requests (simulate client application).
app.post('/api/vehicles', (req, res) => {
    // validate existance and format of request parameter. 
    // Explore the use of Joi module to validate client input format.
    const schema = {
        license: Joi.string().min(8).max(8).required()
    };
    const result = Joi.validate(req.body, schema);
    console.log(result);

    // hint: use Postman to check error messages detais content.
    if (result.error) return  res.status(400).send(result.error.details[0].message);

    // create a new vehicle based on request parameters
    const new_vehicle = {
        id: vehicles.length +1,
        license: req.body.license,
        locations: []
    }
    vehicles.push(new_vehicle);
    //by convention return the new object created.
    res.send(new_vehicle); 
});

// app.put method allow to update a new vehicle by receiving a new license plate.
app.put('/api/vehicles/:id', (req, res) => {
    // look up the vehicle and if not existing return 404
    const vehicle = vehicles.find(c => c.id === parseInt(req.params.id));
    if (!vehicle) return res.status(404).send('The vehicle was not found!');
        
    // validade input
    // IF invalid, return 400 - Bad request
    const {error} = validateVehicle(req.body); // result.error object destructuring
    if (error) return res.status(400).send(error.details[0].message);

    // update vehicle and send object as response
    vehicle.license = req.body.license;
    res.send(vehicle);
});

app.delete('/api/delete/:id', (req, res) => {
    // if not existing return 404
    const vehicle = vehicles.find(c => c.id === parseInt(req.params.id));
    if (!vehicle) return res.status(404).send('The vehicle was not found!');
            
    //Delete
    const index = vehicles.indexOf(vehicle);
    console.log(`Index to delete ... (${index})`)
    vehicles.splice(index,1);

    // return the vehicle deleted
    res.send(vehicle);
});

app.post('/api/vehicles/:id/notify', (req, res) => {
    const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
    if (!vehicle)
        return res.status(404).send('No vehicle found with that id!');

    const { error } = validateNotification(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);
    
    console.log(req.body);
    const new_location = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        timestamp: req.body.timestamp
    }

    const num_locations = vehicle.locations.unshift(new_location);
    if (num_locations > 10)
        vehicle.locations.pop();
    console.log(vehicle.locations);
    res.send(vehicle);
});


// Setting PORT to listen to incoming requests or by default use port 3000
// Take not that the string in the argument of log is a "back tick" to embedded variable.

const port = process.env.PORT || 3000;

app.listen(port, (req, res) => { 
    console.log(`Listen on port ...${port}`);
});

// function to valide input parameters 
function validateVehicle(vehicle){
    const schema = {
        license: Joi.string().min(8).max(8).required()
    };
    return Joi.validate(vehicle, schema);
};

// function to validate notification params
function validateNotification(notification) {
    const schema = Joi.object({
        latitude: Joi.number().max(90).min(-90).required(),
        longitude: Joi.number().max(180).min(-180).required(),
        timestamp: Joi.date().iso().required()
    });
    return schema.validate(notification);
};