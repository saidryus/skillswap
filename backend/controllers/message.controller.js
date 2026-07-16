const Message = require('../models/Message');
const Session = require('../models/Session');

// @desc    Get messages for a session
// @route   GET /api/messages/:sessionId
// @access  Private (participants only)
const getMessages = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Verify user is a participant
    const isParticipant =
      session.tutor.toString() === req.user._id.toString() ||
      session.tutees.map(t => t.toString()).includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this session' });
    }

    const messages = await Message.find({ session: req.params.sessionId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in a session
// @route   POST /api/messages/:sessionId
// @access  Private (participants only)
const sendMessage = async (req, res) => {
  try {
    const { content, type, metadata } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Verify user is a participant
    const isParticipant =
      session.tutor.toString() === req.user._id.toString() ||
      session.tutees.map(t => t.toString()).includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this session' });
    }

    // Prevent sending messages in completed/cancelled sessions
    if (['completed', 'cancelled', 'rejected'].includes(session.status)) {
      return res.status(400).json({ message: 'This conversation is locked. The session has ended.' });
    }

    const message = await Message.create({
      session: req.params.sessionId,
      sender: req.user._id,
      content: content.trim(),
      type: type || 'text',
      metadata: metadata || null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share a recording link in the session chat
// @route   POST /api/messages/:sessionId/recording
// @access  Private (participants only)
const shareRecording = async (req, res) => {
  try {
    const { recordingUrl, title } = req.body;
    if (!recordingUrl) {
      return res.status(400).json({ message: 'Recording URL is required' });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isParticipant =
      session.tutor.toString() === req.user._id.toString() ||
      session.tutees.map(t => t.toString()).includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this session' });
    }

    const message = await Message.create({
      session: req.params.sessionId,
      sender: req.user._id,
      content: title || 'Session Recording',
      type: 'recording',
      metadata: { recordingUrl, title: title || 'Session Recording' },
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get video room name for a session (deterministic)
// @route   GET /api/messages/:sessionId/video-room
// @access  Private (participants only)
const getVideoRoom = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate('tutor', 'firstName lastName')
      .populate('course', 'courseCode');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isParticipant =
      session.tutor._id.toString() === req.user._id.toString() ||
      session.tutees.map(t => t.toString()).includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not a participant in this session' });
    }

    // Generate a deterministic room name based on session ID
    const roomName = `Acadia-${session._id.toString().slice(-8)}`;
    const displayName = `${session.course?.courseCode || 'Session'} with ${session.tutor?.firstName || 'Tutor'}`;

    res.json({
      roomName,
      displayName,
      jitsiDomain: 'meet.jit.si', // Free public Jitsi server
      sessionId: session._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Get all sessions where user is a participant
    const sessions = await Session.find({
      $or: [
        { tutor: req.user._id },
        { tutees: req.user._id },
      ],
      status: { $in: ['pending', 'scheduled', 'completed', 'cancelled'] },
    })
      .populate('tutor', 'firstName lastName')
      .populate('tutees', 'firstName lastName')
      .populate('course', 'courseCode courseName')
      .sort({ updatedAt: -1 });

    // For each session, get the last message and unread count
    const conversations = await Promise.all(sessions.map(async (session) => {
      const lastMessage = await Message.findOne({ session: session._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName');

      const isTutor = session.tutor._id.toString() === req.user._id.toString();
      const otherParty = isTutor
        ? session.tutees.map(t => `${t.firstName} ${t.lastName}`).join(', ')
        : `${session.tutor.firstName} ${session.tutor.lastName}`;

      return {
        sessionId: session._id,
        courseCode: session.course?.courseCode || '',
        courseName: session.course?.courseName || '',
        otherParty,
        isTutor,
        status: session.status,
        isLocked: ['completed', 'cancelled', 'rejected'].includes(session.status),
        date: session.date,
        lastMessage: lastMessage ? {
          content: lastMessage.type === 'recording' ? '📹 Recording shared' : lastMessage.content,
          sender: lastMessage.sender?.firstName || 'Unknown',
          time: lastMessage.createdAt,
          isMe: lastMessage.sender?._id?.toString() === req.user._id.toString(),
        } : null,
      };
    }));

    // Only return sessions that have messages OR are scheduled/pending (active)
    const filtered = conversations.filter(c =>
      c.lastMessage || ['pending', 'scheduled'].includes(c.status)
    );

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, shareRecording, getVideoRoom };

