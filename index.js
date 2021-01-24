import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRoutes.js';

const USERDB = "dbUser";
const PWDDB = "55852565";
const PORT = 3000;

(async () => {
  try {
    mongoose.connect(`mongodb+srv://${USERDB}:${PWDDB}@realmcluster.khnut.mongodb.net/Mybank-api?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log('Não foi possível conectar ao servidor: ' + error)
  }
})();

const app = express();
app.use(express.json());
app.use(accountRouter);

app.listen(PORT, () => {
  console.log("API conectada com sucesso!");
})
