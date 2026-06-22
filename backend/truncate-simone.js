require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentSchedule = require('./models/StudentSchedule');
const Session = require('./models/Session');
const Rating = require('./models/Rating');
const TutorProfile = require('./models/TutorProfile');
const Notification = require('./models/Notification');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const simone = await User.findOne({ studentIdNumber: '23063670' });
  if (!simone) { console.log('Student not found'); process.exit(1); }

  const schedDel = await StudentSchedule.deleteMany({ student: simone._id });
  const sessDel = await Session.deleteMany({ $or: [{ tutor: simone._id }, { tutees: simone._id }] });
  const rateDel = await Rating.deleteMany({ $or: [{ tutor: simone._id }, { ratedBy: simone._id }] });
  const tutorDel = await TutorProfile.deleteMany({ tutor: simone._id });
  const notifDel = await Notification.deleteMany({ user: simone._id });

  // Reset isTutor flag but keep password intact
  await User.findByIdAndUpdate(simone._id, { isTutor: false });

  console.log('\nTruncated data for Simone Dominique Makinano (23063670):');
  console.log(`  Schedule entries: ${schedDel.deletedCount}`);
  console.log(`  Sessions: ${sessDel.deletedCount}`);
  console.log(`  Ratings: ${rateDel.deletedCount}`);
  console.log(`  Tutor profiles: ${tutorDel.deletedCount}`);
  console.log(`  Notifications: ${notifDel.deletedCount}`);
  console.log('  Password: UNCHANGED');
  console.log('\nAccount is now clean — ready for fresh demo.');

  process.exit(0);
})();
