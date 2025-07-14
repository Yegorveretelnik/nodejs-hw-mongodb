const { fetchContacts, fetchContactById } = require('../services/contacts');

async function getAllContacts(req, res) {
  const contacts = await fetchContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
}

async function getContactById(req, res) {
  const { contactId } = req.params;
  const contact = await fetchContactById(contactId);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

module.exports = {
  getAllContacts,
  getContactById,
};
