require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { createProduct } = require('./controller/Product');
const productsRouters = require('./routes/Product');
const categoriesRouter = require('./routes/Category');
const brandsRouter = require('./routes/Brand');
const userRouter = require('./routes/Users');
const authRouter = require('./routes/Auth')
const cartRouter = require('./routes/Cart')
const orderRouter = require('./routes/Order');
const { User } = require('./model/User');
const crypto = require('crypto');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/comman');
const SECRET_KEY = process.env.JWT_SCERET_KEY
const path = require('path');
const { Order } = require('./model/Order');

// webhook
const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}),async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
    //   console.log({paymentIntentSucceeded})
    const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
    order.paymentStatus = 'recieved';
    await order.save();
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// jwt option
const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;


//middleware
server.use(express.static(path.resolve(__dirname,'build')))
server.use(cookieParser());
server.use(session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

server.use(express.json())
// server.use(express.raw({type: '*/*'}))
server.use(passport.authenticate('session'));
server.use(cors({ exposedHeaders: ['X-Total-Count'] }))
server.use('/products', isAuth(), productsRouters.router)
server.use('/category',isAuth(), categoriesRouter.router)
server.use('/brands',isAuth(), brandsRouter.router);
server.use('/users',isAuth(), userRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart',isAuth(), cartRouter.router);
server.use('/orders',isAuth(), orderRouter.router);

// passport strategies
passport.use('local',  new LocalStrategy({usernameField : 'email'}, async function (email, password, done) {
    try {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
            return done(null, false, { message: "Invalid Credential" })
        }
        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                return done(null, false, { message: "Invalid Credential" })
            }
            const token = jwt.sign(sanitizeUser(user), process.env.JWT_SCERET_KEY);
            done(null, {id:user.id, role:user.role, token});
        })

    } catch (err) {
        done(err);
    }
}
));

passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
        const user = await User.findById(jwt_payload.id)
        if (user) {
            return done(null, sanitizeUser(user));
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

passport.serializeUser(function (user, cb) {
    console.log('serializeuser ', user)
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });
    });
});

passport.deserializeUser(function (user, cb) {
    console.log('de-serializeuser ', user)
    process.nextTick(function () {
        return cb(null, user);
    });
});


// payment intant

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

// const calculateOrderAmount = (items) => {
//   return 1400;
// };

server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata : {
        orderId
       }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});





// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/EcommercDB');
//     console.log('database connect successfully')
// }
// main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('database connect successfully')
}
main().catch(err => console.log(err));


// server.listen(3500, () => {
//     console.log(`Server start at port no ${3500}`)
// })
server.listen(process.env.PORT, () => {
    console.log(`Server start at port no ${3500}`)
})