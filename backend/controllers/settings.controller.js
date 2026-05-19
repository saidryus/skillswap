const Settings = require('../models/Settings');

/* helper — get or create the singleton */
async function getSettings() {
  let s = await Settings.findOne({ key: 'global' });
  if (!s) s = await Settings.create({ key: 'global' });
  return s;
}

// @desc    Get global settings
// @route   GET /api/settings
// @access  Admin
const getGlobalSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Super Admin
const updateGlobalSettings = async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin only' });
    }
    const { studentIdPrefix } = req.body;
    const settings = await getSettings();
    if (studentIdPrefix !== undefined) {
      settings.studentIdPrefix = studentIdPrefix.trim().toUpperCase();
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getGlobalSettings, updateGlobalSettings, getSettings };
