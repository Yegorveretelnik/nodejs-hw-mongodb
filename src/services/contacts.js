import Contact from '../models/Contact.js';

export const fetchAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
} = {}) => {
  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const combinedFilter = { userId, ...filter };

  const data = await Contact.find(combinedFilter)
    .sort(sort)
    .skip(skip)
    .limit(perPage);

  const totalItems = await Contact.countDocuments(combinedFilter);
  const totalPages = Math.ceil(totalItems / perPage) || 1;

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const fetchContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, payload, userId) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteContact = async (contactId, userId) => {
  const result = await Contact.findOneAndDelete({ _id: contactId, userId });
  return Boolean(result);
};
