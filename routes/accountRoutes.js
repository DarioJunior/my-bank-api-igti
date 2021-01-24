import express from 'express';
import { accountModel } from '../model/accountsModel.js';

const app = express();

app.get('/accounts', async (req, res) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (error) {
    res.status(500).send("Erro ao adicionar uma conta bancária: " + error);
  }
})

export { app as accountRouter };