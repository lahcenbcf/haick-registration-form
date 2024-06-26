import express from "express"
import mongoose from 'mongoose'
import cors from "cors"
import {v4} from 'uuid';
import { connectDb } from "./connect.js";
const app = express();
const port =process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const participantSchema = new mongoose.Schema({
  isTeamLeader: { type: String, required: true },
  codeTeam: { type: String, required: function() { return !this.isTeamLeader; }, unique: true },
  isAgreedMembersJoined: { type: String, required: function() { return this.isTeamLeader; } },
  teamName: { type: String, required: function() { return this.isTeamLeader; } },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  securityNumber: { type: String, required: true },
  discordTag: { type: String, required: true },
  isStudent: { type: String, required: true },
  universityName: { type: String, required: function() { return this.isStudent; } },
  studyField: { type: String, required: function() { return this.isStudent; } },
  level: { type: String, required: function() { return this.isStudent; } },
  aiLevel: { type: String, required: true },
  field: { type: String, required: true },
  githubLink: { type: String, required: true },
  kaggleLink: { type: String, required: true },
  cvLink: { type: String },
  linkedinLink: { type: String },
  participated: { type: String, required: true },
  experience: { type: String, required: function() { return this.participated; } },
  motivation: { type: String, required: true },
  shirtSize: { type: String, required: true }
});

participantSchema.index({ codeTeam: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code =v4()
    const existing = await Participant.findOne({ codeTeam: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code.substring(0,3);
};

app.post('/submit-form', async (req, res) => {
  const formData = req.body;
  try {
    if (formData.isTeamLeader) {
      formData.codeTeam = await generateUniqueCode();
    }

    const newParticipant = await Participant.create(formData);
    res.status(200).json({ message: 'Form submission saved', codeTeam: newParticipant.codeTeam });
  } catch (err) {
    console.error('Error saving form submission:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/check-code', async (req, res) => {
  const {code}= req.body;
  try {
    const teamName = await Participant.find({
      codeTeam : code
    })
    console.log(teamName)
    if(teamName.length){
      res.status(200).json({team: teamName[0].teamName})
    }else{
      res.status(500).send(false)
    }
    
  } catch (err) {
    console.error('Error saving form submission:', err);
    res.status(500).send('Internal Server Error');
  }
});
connectDb()
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
