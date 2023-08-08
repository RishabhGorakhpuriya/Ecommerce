const { User } = require("../model/User");
const crypto = require('crypto');
const { sanitizeUser } = require("../services/comman");
const SECRET_KEY = 'SECRET_KEY';
const jwt = require('jsonwebtoken');
exports.createUser = async (req, res) => {
    try {
        var salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
            const user = new User({ ...req.body, password: hashedPassword, salt })
            const doc = await user.save();
            req.login(sanitizeUser(doc), (err) => {
                if (err) {
                    res.status(400).json(err);
                } else {
                    const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
                    res.cookie('jwt', token, { expires: new Date(Date.now() + 900000), httpOnly: true }).status(201).json({id:doc.id, role:doc.role});
                }
            })
        })
    } catch (err) {
        res.status(400).json(err);
    }
};

// exports.createUser=async(req, res)=>{
//     const user = new User(req.body)
//     try{
//         const doc = await user.save()
//         res.status(201).json({id:doc.id, role:doc.role})
//     }catch(err){
//         res.status(400).json(err);
//     }
// };

// exports.loginUser = async(req, res)=>{
//     try{    
//         const user = await User.findOne({email:req.body.email}).exec();
//         console.log(user)
//         if(!user){
//             res.status(401).json({message : "Invalid Credential"})
//         }else if(user.password === req.body.password){
//             res.status(200).json({id:user.id, email:user.email, name:user.name,addresses:user.addresses});
//         }else{
//             res.status(401).json({message : 'invalid Credential'})
//         }
//     }catch(err){
//         res.status(401).json(err);
//     }
// };


exports.loginUser = async (req, res) => {
    const user = req.user
    res.cookie('jwt', req.user.token, { expires: new Date(Date.now() + 3600000), httpOnly: true }).status(201).json({id:user.id, role:user.role})
};

exports.checkAuth = async (req, res) => {
    if (req.user) {
        res.json(req.user)
    } else {
        res.sendStatus(401)
    }
};