const express = require('express');
const Joi = require('@hapi/joi');

const app = express();
app.use(express.json());

app.get('/api/near', (req, res) => {
  const { error } = validatePositions(req.body.positions);
  if (error)
    return res.status(400).send(error.details[0].message);

  const point_a = req.body.positions[0];
  const point_b = req.body.positions[1];
  const distance = calculateDistance(point_a, point_b);

  const near = distance < 100;

  const response = {
    distance: distance,
    near: near,
  }
  
  return res.send(response);
});

const port = process.env.PORT || 3050;

app.listen(port, (req, res) => { 
  console.log(`Listen on port ...${port}`);
});

function validatePositions(positions) {
  const schema = Joi.array().length(2).items(Joi.object({
    lat: Joi.number().max(90).min(-90).required(),
    lon: Joi.number().max(180).min(-180).required()
  })).required();

  return schema.validate(positions);
};

function calculateDistance(point_a, point_b) {
  const radius = 6371000; // metres
  let dLat = degToRad(point_b.lat - point_a.lat);
  let dLon = degToRad(point_b.lon - point_a.lon);

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degToRad(point_a.lat)) * Math.cos(degToRad(point_b.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return radius * c;
};

function degToRad(deg) {
  return deg * (Math.PI / 180)
}