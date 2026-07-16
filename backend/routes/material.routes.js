const express = require('express');
const router = express.Router();
const { getMaterials, getTutorResources, createMaterial, updateMaterial, deleteMaterial, downloadMaterial } = require('../controllers/material.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadMaterial } = require('../middleware/upload');

router.use(protect);

router.get('/', getMaterials);
router.get('/tutor/:tutorId', getTutorResources);
router.get('/:id/download', downloadMaterial);
router.post('/', uploadMaterial.single('file'), createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;
