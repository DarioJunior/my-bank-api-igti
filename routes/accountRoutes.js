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

app.post('/accounts/new', async (req, res) => {
  try {
    const dataNewAccount = req.body;
    const newAccount = new accountModel(dataNewAccount);
    await newAccount.save();
    res.send(newAccount);
  } catch (err) {
    res.status(500).send("Não foi possível criar uma conta bancária, verifique: " + err);
  }
})

app.patch('/account/deposit/:value', async (req, res) => {
  try {
    const value = req.params.value;
    const ag = req.query.agencia;
    const cc = req.query.conta;

    const validate = await accountModel.countDocuments({ conta: cc })
    if (validate == 1) {
      await accountModel.updateOne({ agencia: ag, conta: cc }, { $inc: { balance: value } })
      res.status(200).send('Depósito efetuado com sucesso')
    } else {
      res.status(404).send('Algo de errado não está certo com a transação')
    }
  } catch (err) {
    res.status(500).send("Algo de errado não está certo: " + err)
  }
})

app.patch('/account/withdraw/:value', async (req, res) => {
  try {
    const value = (req.params.value + 1);
    const ag = req.query.agencia;
    const cc = req.query.conta;
    // console.log(req)
    const accBalance = await accountModel.find({ conta: cc }, { _id: 0, agencia: 0, conta: 0, name: 0, __v: 0 })
    const validateBal = accBalance[0].balance - value;
    console.log(validateBal)
    if (validateBal > 0) {
      await accountModel.updateOne({ agencia: ag, conta: cc }, { $inc: { balance: value } })
      res.status(200).send('Saque efetuado com sucesso')
    } else {
      res.status(404).send('Algo de errado não está certo com a transação: Saldo insuficiente')
    }
  } catch (err) {
    res.status(500).send("Algo de errado não está certo: " + err)
  }
})



export { app as accountRouter };