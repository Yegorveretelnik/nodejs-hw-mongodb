import express from 'express';
import {
  getAllContacts,
  getContactById,
} from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getAllContacts);
router.get('/:contactId', getContactById);

export default router;
