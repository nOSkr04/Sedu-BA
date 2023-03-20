const mongoose = require("mongoose")
const WalletSchema = new mongoose.Schema({
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
      },
    invoiceId: {
        type: String,
        default: null
      },
    qrImage: {
        type: String,
        default: null
      },
      urls: [{
        name: String,
        description: String,
        logo: String,
        link: String
      }],
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Wallet", WalletSchema)