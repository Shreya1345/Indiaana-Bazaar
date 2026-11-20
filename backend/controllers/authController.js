const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -addresses');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses').lean();
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user.addresses || []);
  } catch (error) {
    console.error('Unable to load saved addresses:', error);
    return res.status(500).json({ message: 'Unable to load saved addresses.' });
  }
};

const saveAddress = async (req, res) => {
  const fields = ['fullName', 'street', 'city', 'postalCode', 'country'];
  const address = {};
  for (const field of fields) {
    address[field] = typeof req.body?.[field] === 'string' ? req.body[field].trim() : '';
  }
  if (Object.values(address).some((value) => !value)) {
    return res.status(400).json({ message: 'Complete every shipping address field.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const existingAddress = user.addresses.find((savedAddress) => fields.every(
      (field) => savedAddress[field].trim().toLowerCase() === address[field].toLowerCase()
    ));
    if (existingAddress) return res.json({ address: existingAddress });

    user.addresses.push(address);
    await user.save();
    return res.status(201).json({ address: user.addresses[user.addresses.length - 1] });
  } catch (error) {
    console.error('Unable to save address:', error);
    return res.status(500).json({ message: 'Unable to save address.' });
  }
};

module.exports = { registerUser, loginUser, getUsers, getSavedAddresses, saveAddress };
