import Contact from '../models/Contact.js';

async function fetchContacts() {
  return Contact.find();
}

async function fetchContactById(id) {
  return Contact.findById(id);
}

export { fetchContacts, fetchContactById };
