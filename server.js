import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints"


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();


const NewThoughtSchema = new mongoose.Schema({

  message: {
    type: String,
    minlength: 5,
    maxlength: 140,
    trim: true,
    required: true
  },

  hearts: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: () => Date.now()
  }

})

const NewThought = mongoose.model('NewThought', NewThoughtSchema)



// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

app.get("/thoughts", async (req, res) => {
try {
  const listOfThoughts = await NewThought.find().sort({ createdAt: "desc" })
  res.status(200).json(listOfThoughts.slice(0, 20))

} catch (error) {

  res.status(400).json({ Message: "Failed to load", error: error.errors, success: false })

}

})

//Post a new thought

app.post('/thoughts', async (req, res) => {

  const { message } = req.body

  try {

    const thought = await new NewThought({ message }).save()
    res.status(201).json({ response: thought, success: true })

  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }


  console.log(req.body);
})


//add a like

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  
  const { thoughtId } = req.params

  try {
    const updatedCount = await NewThought.findByIdAndUpdate(
      thoughtId, 
      { 
      $inc: { 
        hearts: 1
       }, 
      },
      {
        new: true
      }

     )
    res.status(201).json(updatedCount)

  } catch (err) {
    res.status(400).json({ message: "missing", error: err.errors, success: false })
  }

})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
