import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  contactSchema,
  contactUpdateSchema,
} from '../schemas/contactsSchemas.js';

import {
  getAllContacts,
  getContactById,
  createContactController,
  patchContactController,
  deleteContactController,
} from '../controllers/contacts.js';

const router = express.Router();
router.use(authenticate);
router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post(
  '/',
  validateBody(contactSchema),
  ctrlWrapper(createContactController),
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(contactUpdateSchema),
  ctrlWrapper(patchContactController),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));

export default router;
