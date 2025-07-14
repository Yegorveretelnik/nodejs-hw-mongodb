const express = require('express');
const {
  getAllContacts,
  getContactById,
} = require('../controllers/contactsController');

const router = express.Router();

router.get('/', getAllContacts);
router.get('/:contactId', getContactById);

module.exports = router;
