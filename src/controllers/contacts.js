import createHttpError from 'http-errors';
import {
  fetchAllContacts,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const contacts = await fetchAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully fetched all contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await fetchContactById(contactId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const newContact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const updatedContact = await updateContact(contactId, req.body);

  if (!updatedContact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const wasDeleted = await deleteContact(contactId);

  if (!wasDeleted) {
    return next(createHttpError(404, 'Contact not found'));
  }

  res.status(204).send(); // No content
};
