const { Contact } = require('../models/Contact');

async function fetchContacts() {
  return Contact.find();
}

async function fetchContactById(id) {
  return Contact.findById(id);
}

module.exports = {
  fetchContacts,
  fetchContactById,
};
