const {Schema, model} = require('mongoose');
// объект книги, количество, пользователь, дата выполнения заказа
const order = new Schema({
    books: [ {
        book: { type: Object, required: true },
        count: { type: Number, require: true }
    } ],
    user: {
        name: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User', required:true }
    },
    date: {
        type: Date,
        default: Date.now
    }
    // ,
    // orderNum:{         orderNum добавить в файле orders.hbs за место {{_id}}
    //     type: Number,
    //     default: 0
    // }
},
{versionKey:false});

module.exports = model('Order', order);