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

// Deposit method
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

// Withdraw method
app.patch('/account/withdraw/:value', async (req, res) => {
  try {
    const tax = 1;
    const value = parseInt(req.params.value) + tax;
    const ag = req.query.agencia;
    const cc = req.query.conta;
    let accBalance = await accountModel.find({ conta: cc }, { _id: 0, agencia: 0, conta: 0, name: 0, __v: 0 })
    accBalance = accBalance[0].balance;
    const validateBal = accBalance - value;
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

// Check balance method
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

app.patch('/accounts/transfer/:ccDec/:ccInc/:value', async (req, res) => {
  try {
    const ccDec = req.params.ccDec;
    const ccInc = req.params.ccInc;
    let value = parseInt(req.params.value);
    const ccOne = await accountModel.find({ conta: ccDec }, { _id: 0, __v: 0 });
    const ccTwo = await accountModel.find({ conta: ccInc }, { _id: 0, __v: 0 });
    const agenceAccountOne = ccOne[0].agencia;
    const agenceAccountTwo = ccTwo[0].agencia;
    let accuntBalanceOne = ccOne[0].balance;
    let accountBalanceTwo = ccTwo[0].balance;
    // console.log(accuntBalanceOne + 1, accountBalanceTwo - 1)
    agenceAccountOne == agenceAccountTwo ? (accuntBalanceOne -= value) && (accountBalanceTwo += value) : (accuntBalanceOne -= (value + 8)) && (accountBalanceTwo + value)
    await accountModel.bulkWrite([
      { updateOne: { "filter": { conta: ccDec }, "update": { $set: { balance: accuntBalanceOne } } } },
      { updateOne: { "filter": { conta: ccDec }, "update": { $set: { balance: accuntBalanceOne } } } },
    ])
    // console.log(accuntBalanceOne, accountBalanceTwo)
    res.sendStatus(200);
  } catch (err) {
    res.send(500).status('Erro na transação, verifique os dados e tente novamente' + err)
  }
})

app.get('/accounts/avg/:ag', async (req, res) => {
  try {
    const ag = req.params.ag;
    const average = await accountModel.aggregate([
      { $group: { _id: { agencia: "$agencia" }, balance: { $avg: "$balance" } } },
    ])
    let avg = 0;
    avg = average.find((agency) => {
      let avgValue;
      agency._id.agencia == 99 ? avgValue = agency.balance : '';
      return avgValue
    })
    res.status(200).send(`Agência: ${ag} Média de Saldo: ${avg.balance}`);
  } catch (err) {
    res.status(500).send('Houve um erro na obtenção das médias, cheque as informações: ' + err)
  }
})

app.get('/accounts/pobres/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit);
    const data = await accountModel.find({}, { _id: 0, name: 0, __v: 0 }).limit(limit).sort({ balance: 1 })
    res.send(data)
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})

app.get('/accounts/ricos/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit);
    const data = await accountModel.find({}, { _id: 0, __v: 0 }).limit(limit).sort({ balance: -1 })
    res.send(data)
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})

app.get('/accounts/privates', async (req, res) => {
  try {

    const data = await accountModel.aggregate([
      { $group: { _id: { agencia: "$agencia", name: "$name" } } },
    ]).sort({ balance: 1 }).limit(1)
    res.send(data)
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})
export { app as accountRouter };