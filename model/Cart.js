const mongoose = require('mongoose');
const {Schema} = mongoose
const cartSchema = new Schema({
    quantity : {type : Number, require : true},
    product : {type : Schema.Types.ObjectId, ref : 'Product', require : true},
    user : {type : Schema.Types.ObjectId, ref : 'User', require : true},
   
})

const virtual = cartSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
cartSchema.set('toJSON', {
    virtuals : true,
    versionKey : false,
    transform : function(doc, ret){delete ret._id}
})
exports.Cart = mongoose.model('Cart',cartSchema)