import { ContactModel } from '../db/models/contact.js';

export const fetchAllContacts = async () => {
  return await ContactModel.find();
};

export const fetchContactById = async (contactId) => {
  return await ContactModel.findById(contactId);
};

export const createContact = async (payload) => {
  return await ContactModel.create(payload);
};

export const updateContact = async (contactId, payload) => {
  return await ContactModel.findByIdAndUpdate(contactId, payload, {
    new: true,
  });
};

export const deleteContact = async (contactId) => {
  const result = await ContactModel.findByIdAndDelete(contactId);
  return Boolean(result);
};
