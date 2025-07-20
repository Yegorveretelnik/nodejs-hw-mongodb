import Contact from '../models/Contact.js';

export const fetchAllContacts = async () => {
  return await Contact.find();
};

export const fetchContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, payload) => {
  return await Contact.findByIdAndUpdate(contactId, payload, {
    new: true,
  });
};

export const deleteContact = async (contactId) => {
  const result = await Contact.findByIdAndDelete(contactId);
  return Boolean(result);
};
