exports.checkService = async (req, res) => {
  try {
    const { pincode } = req.body;
    if (!pincode || typeof pincode !== "string") {
      return res.status(400).json({ message: "Pincode is required" });
    }

    const normalizedPincode = pincode.trim();
    if (normalizedPincode.length !== 6 || !/^\d{6}$/.test(normalizedPincode)) {
      return res
        .status(400)
        .json({ message: "Pincode must be a 6-digit number" });
    }

    // For now, accept all valid 6-digit pincodes as serviceable.
    const is_available = true;
    res.json({ is_available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.notifyMe = async (req, res) => {
  try {
    const { pincode, phone } = req.body;
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    // In a real app this would save a notification request to the database.
    res.json({
      message: "Thank you! We will notify you when service is available.",
      pincode,
      phone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
