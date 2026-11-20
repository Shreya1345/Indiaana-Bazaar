const express = require('express');
const {
  registerUser,
  loginUser,
  getUsers,
  getSavedAddresses,
  saveAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/addresses').get(protect, getSavedAddresses).post(protect, saveAddress);
router.get('/users', protect, admin, getUsers);

module.exports = router;
