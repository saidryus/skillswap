const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, shareRecording, getVideoRoom } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getConversations);
router.get('/:sessionId', getMessages);
router.post('/:sessionId', sendMessage);
router.post('/:sessionId/recording', shareRecording);
router.get('/:sessionId/video-room', getVideoRoom);

module.exports = router;
