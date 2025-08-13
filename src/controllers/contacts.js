import createHttpError from 'http-errors';
import {
  fetchAllContacts,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

export const getAllContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      contactType,
      isFavourite,
    } = req.query;

    const filter = {};
    if (typeof contactType === 'string') filter.contactType = contactType;
    if (typeof isFavourite !== 'undefined')
      filter.isFavourite = String(isFavourite) === 'true';

    const result = await fetchAllContacts({
      userId: req.user._id,
      page: Number(page),
      perPage: Number(perPage),
      sortBy,
      sortOrder,
      filter,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await fetchContactById(contactId, req.user._id);

    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    if (req.file && req.file.cloudinaryUrl) {
      req.body.photo = req.file.cloudinaryUrl;
    }
    req.body.userId = req.user._id;

    const newContact = await createContact(req.body);

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactController = async (req, res, next) => {
  try {
    if (req.file && req.file.cloudinaryUrl) {
      req.body.photo = req.file.cloudinaryUrl;
    }

    const updatedContact = await updateContact(
      req.params.contactId,
      req.body,
      req.user._id,
    );

    if (!updatedContact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const isDeleted = await deleteContact(req.params.contactId, req.user._id);
    if (!isDeleted) throw createHttpError(404, 'Contact not found');

    res.status(200).json({
      status: 200,
      message: 'Successfully deleted the contact!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
