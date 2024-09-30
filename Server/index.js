//npm install bcryptjs

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const corsOptions = {
  origin: "https://nikolas-ecommerce.netlify.app",
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 8080  //process.env.PORT zajišťuje že se connectne s backendem třeba na stránce Render.com

//users schema
const userSchema = mongoose.Schema({
  email: String,
  password: String,
  phone: String,
  firstName: String,
  lastName: String,
  city: String,
  street: String,
  psc: String,
  isAdmin: Boolean,
  cart: [{
    id: String,
    quantity: Number,
  }]
}, {
  timestamps: true
})

const storageSchema = mongoose.Schema({
  storage: [{
    id: String,
    image: String,
    title: String,
    description: String,
    inventory: Number,
    rating: Number,
    price: Number
  }]
}, { collection: 'storage' })


const generateCustomId = (length) => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const orderSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => generateCustomId(10) // Generate a 10-character _id
  },
  userId: String,
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  city: String,
  street: String,
  psc: String,
  items: [{
    id: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  status: String,
  createdDate: String
}, { collection: 'orders' })

const userModel = mongoose.model("users", userSchema)
const storageModel = mongoose.model("storage", storageSchema)
const orderModel = mongoose.model("orders", orderSchema)

// registrace uživatele
app.post("/createUser", async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "Email již existuje" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

    // Create a new user with the hashed password
    const data = new userModel({
      ...req.body,
      password: hashedPassword  // Replace the plain text password with the hashed one
    });

    await data.save();
    res.send({ success: true, message: "User created successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error creating user" });
  }
});

// login uživatele
app.post('/loginUser', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ success: false, message: 'Špatný email nebo heslo' });
    }

    // Compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send({ success: false, message: 'Špatný email nebo heslo' });
    }

    // Generate a JWT token
    const token = jwt.sign({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      street: user.street,
      psc: user.psc,
      isAdmin: user.isAdmin,
    },
      'your_jwt_secret',
      { expiresIn: '1h' });

    res.send({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error logging in' });
  }
});

// fetch všech produktů
app.get("/storage", async (req, res) => {
  const data = await storageModel.find({})
  res.json({ success: true, data })
})

// fetch jednoho specifického produktu
app.get('/storage/:id', async (req, res) => {
  try {
    const product = await storageModel.findOne({ 'storage.id': req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.storage.find(p => p.id === req.params.id));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// cart read
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Get the product IDs from the user's cart
    const cartItems = user.cart;

    // Fetch product details from the storage
    const productDetails = await Promise.all(cartItems.map(async (cartItem) => {
      const product = await storageModel.findOne({ 'storage.id': cartItem.id });
      if (product) {
        const item = product.storage.find(p => p.id === cartItem.id);
        return {
          id: item.id,
          image: item.image,
          title: item.title,
          inventory: item.inventory,
          price: item.price*cartItem.quantity,
          quantity: cartItem.quantity,
          unitPrice: item.price // Assuming unit price is the same as item price
        };
      }
      return null; // If product not found
    }));

    // Filter out any null values in case a product wasn't found
    const enrichedCart = productDetails.filter(item => item !== null);

    res.status(200).json(enrichedCart);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch cart data with product details');
  }
});
//cart post
app.post('/updateCart', async (req, res) => {
  const { userId, cart } = req.body;

  try {
    // Find the user by ID
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the cart or set it if it doesn't exist
    user.cart = cart;
    await user.save();

    res.status(200).json(user);
    // res.send({success: true})
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Check inventory before processing the order
const checkInventory = async (items) => {
  const inventoryCheck = await Promise.all(
    items.map(async (item) => {
      // Find the storage item that matches the product ID
      const storageItem = await storageModel.findOne({ 'storage.id': item.id });
      const product = storageItem?.storage.find(p => p.id === item.id);

      // If the product is found, check if the inventory is sufficient
      return product && product.inventory >= item.quantity;
    })
  );

  return inventoryCheck.every(Boolean); // Returns true if all items have enough inventory
};
// založení objednávky
app.post("/createOrder", async (req, res) => {
  try {
    const { items } = req.body;

    // Check if inventory is sufficient
    const isInventoryAvailable = await checkInventory(req.body.items);
    if (!isInventoryAvailable) {
      return res.status(400).json({ success: false, message: "Není dostatek zásob pro některé položky!" });
    }

    const date = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const currentDate = date.toLocaleDateString('cs-CZ', options).replace(/ /g, '');

    const data = new orderModel({
      ...req.body,
      status: "Vyřizuje se",
      createdDate: currentDate
    });

    await data.save();

    // Update inventory for each item in the order
    for (const item of items) {
      await storageModel.updateOne(
        { 'storage.id': item.id }, // Find the item in storage
        { $inc: { 'storage.$.inventory': -item.quantity } } // Decrease the inventory by the quantity ordered
      );
    }

    res.send({ success: true, message: "Order created successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error creating order" });
  }
});

// fetch objednávek podle emailu usera
app.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all orders by the user's email
    const orders = await orderModel.find({ userId });

    if (orders.length === 0) {
      return res.status(404).send({ success: false, message: 'No orders found for thisid' });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Failed to fetch orders' });
  }
});
// zrušení specifické objednávky
app.put('/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order by ID and update its status to "cancelled"
    const updatedOrder = await orderModel.findByIdAndUpdate(id, { status: 'Zrušeno' }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});
// Vyhledání objednávky podle inputu
app.get('/orders/search/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderModel.findOne({ _id: orderId }); // Search by order ID
    if (order) {
      res.json({ success: true, data: order });
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



//read (GET)
//http://localhost:8080
app.get("/", async (req, res) => {
  const data = await userModel.find({})
  res.json({ success: true, data })
})

//create (POST)
//http://localhost:8080/create
app.post("/create", async (req, res) => {
  console.log(req.body);
  const data = new userModel(req.body)
  await data.save()
  res.send({ success: true, message: "data create successfully", data })
})

//update (PUT)
//http://localhost:8080/update
app.put("/update", async (req, res) => {
  console.log(req.body);
  const { _id, ...rest } = req.body
  console.log(rest);
  const data = await userModel.updateOne({ _id: _id }, rest)
  res.send({ success: true, message: "data update successfully", data })
})

//delete (DELETE)
//http://localhost:8080/delete/:id
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id
  console.log(id);
  const data = await userModel.deleteOne({ _id: id })
  res.send({ success: true, message: "data delete successfully", data })
})


mongoose.connect("mongodb+srv://admin:admin@cluster0.vmjzy.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('MongoDB Atlas Connected')
    app.listen(PORT, () => console.log('Server is running'))
  })
  .catch((err) => console.log(err))
