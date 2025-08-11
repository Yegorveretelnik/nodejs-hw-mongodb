import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  contactSchema,
  contactUpdateSchema,
} from '../schemas/contactsSchemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllContacts);
router.get('/:contactId', getContactById);
router.post(
  '/',
  uploadMiddleware.single('photo'),
  validateBody(contactSchema),
  createContactController,
);
router.patch(
  '/:contactId',
  uploadMiddleware.single('photo'),
  validateBody(contactUpdateSchema),
  updateContactController,
);
router.delete('/:contactId', deleteContactController);

export default router;
