const dotenv = require('dotenv');
dotenv.config();
const path = require ("path")
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const userRoutes = require('./controllers/users');
const JwtRouter = require('./controllers/jwt');
const authRouter = require('./controllers/auth');
const taskRoutes = require('./src/routes/tasks');


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use('/jwt', JwtRouter);
app.use('/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/tasks', taskRoutes);
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


app.listen(process.env.PORT ||3000, () => {
  console.log('The express app is ready!');
});
