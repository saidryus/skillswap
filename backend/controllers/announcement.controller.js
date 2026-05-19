const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { createNotifications } = require('../utils/notify');

// @desc    Get announcements (filtered by role)
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    // Admins see all active announcements regardless of targetRoles
    const filter = req.user.role === 'admin'
      ? { isActive: true }
      : { targetRoles: req.user.role, isActive: true };

    const announcements = await Announcement.find(filter)
      .populate('author', 'firstName lastName role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Admin, Faculty
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetRoles, isPinned } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      author: req.user._id,
      targetRoles: targetRoles || ['admin', 'faculty', 'student'],
      isPinned: isPinned || false,
    });

    // Notify all users whose role is in targetRoles
    const roles = targetRoles || ['admin', 'faculty', 'student'];
    const recipients = await User.find({ role: { $in: roles }, isActive: true, _id: { $ne: req.user._id } }).select('_id');
    await createNotifications(
      recipients.map((u) => ({
        recipient: u._id,
        type: 'announcement',
        title: 'New Announcement',
        message: `"${title}" — posted by ${req.user.firstName} ${req.user.lastName}.`,
        link: `/${req.user.role === 'admin' ? 'admin' : req.user.role}/announcements`,
        meta: { announcementId: announcement._id },
        sms: true, // also send SMS to recipients who have a phone number
      }))
    );

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin, Faculty (own)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (
      req.user.role !== 'admin' &&
      announcement.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    Object.assign(announcement, req.body);
    const updated = await announcement.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin, Faculty (own)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (
      req.user.role !== 'admin' &&
      announcement.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
