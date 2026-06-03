const User = require('../models/User');

// Helper: map Mongo subdoc _id -> id for frontend
function formatAddresses(addresses) {
  return addresses.map(a => ({
    id: a._id.toString(),
    type: a.type,
    flat_number: a.flat_number,
    locality: a.locality,
    city: a.city,
    pincode: a.pincode,
    is_default: a.is_default,
  }));
}

// GET /api/v1/users/me/addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ addresses: formatAddresses(user.addresses) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/users/me/addresses
exports.addAddress = async (req, res) => {
  try {
    const { type, flat_number, locality, city, pincode, is_default } = req.body;
    const user = await User.findById(req.user._id);

    // If new address is default, remove default from others
    if (is_default) {
      user.addresses.forEach(a => { a.is_default = false; });
    }

    // If first address, make it default automatically
    const makeDefault = is_default || user.addresses.length === 0;

    user.addresses.push({ type, flat_number, locality, city, pincode, is_default: makeDefault });
    await user.save();

    res.status(201).json({ message: 'Address saved', addresses: formatAddresses(user.addresses) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/v1/users/me/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { type, flat_number, locality, city, pincode, is_default } = req.body;
    if (type) addr.type = type;
    if (flat_number !== undefined) addr.flat_number = flat_number;
    if (locality !== undefined) addr.locality = locality;
    if (city !== undefined) addr.city = city;
    if (pincode !== undefined) addr.pincode = pincode;

    if (is_default) {
      user.addresses.forEach(a => { a.is_default = false; });
      addr.is_default = true;
    }

    await user.save();
    res.json({ message: 'Address updated', addresses: formatAddresses(user.addresses) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/v1/users/me/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    addr.deleteOne();
    await user.save();
    res.json({ message: 'Address deleted', addresses: formatAddresses(user.addresses) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
