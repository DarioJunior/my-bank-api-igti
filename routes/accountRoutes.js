import express from 'express';
import { accountModel } from '../model/accountsModel.js';

const app = express();

app.get('/accounts', async (req, res) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (error) {
    res.status(500).send("Não conseguimos acessar as contas: " + error);
  }
})

// Create account
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

// Deposit méthod
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

// Withdraw méthod
app.patch('/account/withdraw/:value', async (req, res) => {
  try {
    const tax = 1;
    const value = parseInt(req.params.value) + tax;
    const ag = req.query.agencia;
    const cc = req.query.conta;
    let accBalance = await accountModel.find({ conta: cc }, { _id: 0, agencia: 0, conta: 0, name: 0, __v: 0 })
    accBalance = accBalance[0].balance;
    const validateBal = accBalance - value;
    console.log(validateBal)
    console.log(value)
    if (validateBal >= 0) {
      await accountModel.updateOne({ agencia: ag, conta: cc }, { $set: { balance: validateBal } })
      res.status(200).send('Saque efetuado com sucesso')
    } else {
      res.status(404).send('Algo de errado não está certo com a transação: Saldo insuficiente')
    }
  } catch (err) {
    res.status(500).send("Algo de errado não está certo: Verifique os dados da conta e agência. " + err)
  }
})

// Check balance méthod
app.get('/account/balance/:ag', async (req, res) => {
  try {
    const accBalance = await accountModel.find({ conta: cc }, { _id: 0, agencia: 0, conta: 0, __v: 0 })
    res.status(200).send(accBalance);
  } catch (error) {
    res.status(500).send("Confira seus dados e tente novamente: " + error);
  }
})

// delete account
app.delete('/account/delete/:ag/:cc', async (req, res) => {
  try {
    const ag = req.params.ag;
    const cc = req.params.cc;
    console.log(ag)
    console.log(cc)

    await accountModel.deleteOne({ agencia: ag, conta: cc })
    const atualizedAcc = await accountModel.find({});
    res.send(atualizedAcc);
  } catch (err) {
    res.send(500).send('Problemas com a exclusão: ' + err);
  }
})


export { app as accountRouter };