/**
 * Generate sample recommendation letter PDFs for testing
 * Covers all score levels: Strong, Moderate, Weak, None + edge cases
 *
 * Run: node generate-sample-letters.js
 * Output: deliverables/sample_letters/
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'deliverables', 'sample_letters');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ─── helpers ─────────────────────────────────────────────────────────────────

function newDoc(filename) {
  const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
  doc.pipe(fs.createWriteStream(path.join(outputDir, filename)));
  return doc;
}

function letterhead(doc, {
  institution = 'University of Cebu - Pardo and Talisay Campus',
  college     = 'College of Computer Studies',
  department  = 'Department of Information Technology',
  office      = 'Office of the Department Head',
} = {}) {
  doc.fontSize(11).fillColor('#444444').font('Helvetica')
    .text('Republic of the Philippines', { align: 'center' })
    .text(institution, { align: 'center' })
    .text(college, { align: 'center' })
    .text(department, { align: 'center' });
  doc.moveDown(0.4);
  doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke('#cccccc');
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor('#666666').text(office, { align: 'center' });
  doc.moveDown(1.5);
  doc.fillColor('#000000');
}

function title(doc, text = 'RECOMMENDATION LETTER FOR PEER TUTORING') {
  doc.fontSize(13).font('Helvetica-Bold')
    .text(text, { align: 'center' });
  doc.moveDown(1.5);
  doc.font('Helvetica').fontSize(11);
}

function signature(doc, { name, position, department, institution, date }) {
  doc.moveDown(2);
  doc.text('Respectfully,');
  doc.moveDown(2);
  doc.text('_________________________________');
  doc.font('Helvetica-Bold').text(name);
  doc.font('Helvetica').fontSize(10).fillColor('#444444');
  doc.text(position);
  doc.text(department);
  doc.text(institution);
  doc.moveDown(0.5);
  doc.text(`Date: ${date}`);
  doc.fontSize(11).fillColor('#000000');
}

// ─── LETTER 1 — STRONG · full formal letterhead · 3 subjects · 5 soft skills ──
function letter1() {
  const doc = newDoc('01_STRONG_full_formal.pdf');
  letterhead(doc);
  doc.fontSize(11).font('Helvetica').text('Date: July 10, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  doc.text('To Whom It May Concern:');
  doc.moveDown(1);
  doc.text(
    'I, Dr. Maria Theresa Gonzales, Department Head of the Department of Information Technology ' +
    'at the University of Cebu - Pardo and Talisay Campus, am writing to highly and unreservedly recommend ' +
    'Mr. Rafael Dela Cruz (Student ID: 202203001) for the Peer Tutoring Program under the Acadia platform.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Mr. Dela Cruz has been my student in the following courses, in each of which he achieved ' +
    'the highest mark in his section:',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold');
  ['1. IT-INFOSEC32 — Information Security',
   '2. IT-SYSADMN32 — Systems Administration',
   '3. IT-WEBDEV21  — Web Development'].forEach(s =>
    doc.text('    ' + s, { indent: 20 })
  );
  doc.font('Helvetica');
  doc.moveDown(1);
  doc.text(
    'Throughout the duration of these courses, Mr. Dela Cruz demonstrated exceptional academic ' +
    'performance, a deep mastery of course concepts, and an uncommon ability to communicate complex ' +
    'topics clearly to his peers. I have personally observed him conduct informal review sessions ' +
    'for his block before major examinations, with measurable improvement in the performance of ' +
    'his classmates as a result.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text('He exhibits the following qualities that make him an outstanding peer tutor:');
  doc.moveDown(0.5);
  [
    'Communication — Explains concepts clearly and adjusts to the learner\'s pace.',
    'Leadership — Takes initiative, organizes study groups, and mentors teammates.',
    'Problem Solving — Approaches challenges methodically and guides peers analytically.',
    'Patience — Repeats explanations willingly and never makes peers feel inadequate.',
    'Dedication — Invests time beyond class hours to support struggling students.',
  ].forEach(q => doc.text('    • ' + q, { indent: 20, lineGap: 2 }));
  doc.moveDown(1);
  doc.text(
    'I strongly and wholeheartedly endorse Mr. Rafael Dela Cruz for the Acadia Peer Tutoring ' +
    'Program for the subjects listed above, without any reservation whatsoever.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Dr. Maria Theresa Gonzales',
    position:    'Department Head, Information Technology',
    department:  'College of Computer Studies',
    institution: 'University of Cebu - Pardo and Talisay Campus',
    date:        'July 10, 2026',
  });
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#888888')
    .text('Noted by: Office of the Dean, College of Computer Studies');
  doc.end();
  console.log('✅  01_STRONG_full_formal.pdf');
}

// ─── LETTER 2 — STRONG · different institution · Tagalog-English mix ──────────
function letter2() {
  const doc = newDoc('02_STRONG_tagalog_english.pdf');
  letterhead(doc, {
    institution: 'Cebu Technological University',
    college:     'College of Computer Studies',
    department:  'Department of Information Technology',
    office:      'Faculty Office',
  });
  doc.fontSize(11).text('Enero 15, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc, 'LIHAM NG REKOMENDASYON PARA SA PEER TUTORING');

  doc.text('Sa Kinauukulan:');
  doc.moveDown(1);
  doc.text(
    'Ako si Prof. Ramon dela Cruz, isang miyembro ng puro ng Departamento ng Information Technology ng ' +
    'Cebu Technological University. Isinusulat ko itong liham para lubos na irekomenda si Bb. Simone Makinano ' +
    '(Student ID: 23063670) para sa Peer Tutoring Program ng aming kolehiyo.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Si Bb. Makinano ay naging estudyante ko sa Web Development (IT-WEBDEV21) at Database Systems (IT-DBSYS21). ' +
    'Sa parehong subject, siya ang may pinakamataas na marka sa kanyang section. Ang kanyang kaalaman sa ' +
    'SQL, database normalization, responsive web design, at JavaScript frameworks ay kahanga-hanga.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Bukod sa kanyang kahusayan sa akademiko, napapansin ko palagi na tinutulungan niya ang kanyang mga ' +
    'kaklase sa mga laboratory exercises. Malinaw ang kanyang paliwanag at napakamaintindiin niya ng iba ' +
    'tao. Hindi siya nagagalit kahit paulit-ulit ang tanong ng kanyang mga kaklase — talagang may natural ' +
    'na pagiging guro ang batang ito.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Lubos at buong pusong inirerekomenda ko si Bb. Simone Makinano para sa Peer Tutoring Program nang ' +
    'walang anumang pag-aalinlangan.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Prof. Ramon dela Cruz, MIT',
    position:    'Faculty, Department of Information Technology',
    department:  'College of Computer Studies',
    institution: 'Cebu Technological University',
    date:        'Enero 15, 2026',
  });
  doc.end();
  console.log('✅  02_STRONG_tagalog_english.pdf');
}

// ─── LETTER 3 — STRONG · brief but clear · program chair signatory ───────────
function letter3() {
  const doc = newDoc('03_STRONG_brief_programchair.pdf');
  letterhead(doc, {
    institution: 'Polytechnic University of the Philippines',
    college:     'College of Information and Communications Technology',
    department:  'Department of Information Technology',
    office:      'Office of the Program Chair',
  });
  doc.fontSize(11).text('Date: August 3, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  doc.text('To the Peer Tutoring Program Coordinator:');
  doc.moveDown(1);
  doc.text(
    'It is with great enthusiasm and full confidence that I recommend Mr. Angelo Reyes (Student ID: 202201015) ' +
    'for the Peer Tutoring Program. Mr. Reyes has been my student in Networking (IT-NETWRK21) and ' +
    'Information Security (IT-INFOSEC32), achieving the highest final grade in both subjects.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'His grasp of TCP/IP protocols, network configuration, vulnerability assessment, and penetration ' +
    'testing fundamentals exceeds course requirements. During hands-on lab activities, he was ' +
    'consistently the first to complete tasks correctly and immediately assisted peers who were ' +
    'struggling — without being asked.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Mr. Reyes demonstrates remarkable patience, excellent communication skills, and a genuine desire ' +
    'to see his peers succeed. I give him my strongest possible recommendation.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Prof. Emmanuel Garcia, MIT',
    position:    'Program Chair, Information Technology',
    department:  'College of Information and Communications Technology',
    institution: 'Polytechnic University of the Philippines',
    date:        'August 3, 2026',
  });
  doc.end();
  console.log('✅  03_STRONG_brief_programchair.pdf');
}

// ─── LETTER 4 — MODERATE · supportive but not enthusiastic ──────────────────
function letter4() {
  const doc = newDoc('04_MODERATE_supportive.pdf');
  letterhead(doc, {
    institution: 'University of Cebu - Banilad Campus',
    college:     'College of Computer Studies',
    department:  'Department of Information Technology',
    office:      'Faculty Office',
  });
  doc.fontSize(11).text('Date: July 20, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  doc.text('To Whom It May Concern:');
  doc.moveDown(1);
  doc.text(
    'I am writing this letter in support of Ms. Isabella Torres (Student ID: 202204022) who is applying ' +
    'for the Peer Tutoring Program. Ms. Torres was my student in Web Development (IT-WEBDEV21) and ' +
    'completed the subject with a grade of 1.5 (Very Good).',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'She has a solid understanding of frontend development concepts including HTML, CSS, JavaScript, ' +
    'and responsive design principles. She participates actively in class discussions and is generally ' +
    'cooperative during group laboratory activities.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'I have observed Ms. Torres assisting her groupmates during laboratory sessions and she communicates ' +
    'clearly. While she is not the top-performing student in the class, she is consistent, dependable, ' +
    'and genuinely interested in helping her peers.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'I believe Ms. Torres has the capability to serve as a peer tutor for Web Development. I support her application.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Prof. Cecilia Torres, MSCS',
    position:    'Faculty, Department of Information Technology',
    department:  'College of Computer Studies',
    institution: 'University of Cebu - Banilad Campus',
    date:        'July 20, 2026',
  });
  doc.end();
  console.log('✅  04_MODERATE_supportive.pdf');
}

// ─── LETTER 5 — MODERATE · cautious · mentions grade only ───────────────────
function letter5() {
  const doc = newDoc('05_MODERATE_cautious.pdf');
  letterhead(doc, {
    institution: 'University of Southern Philippines Foundation',
    college:     'College of Engineering and Architecture',
    department:  'Department of Computer Engineering',
    office:      'Faculty Office',
  });
  doc.fontSize(11).text('Date: July 25, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  doc.text('To the Peer Tutoring Coordinator:');
  doc.moveDown(1);
  doc.text(
    'I am writing regarding the application of Mr. David Ramos (Student ID: 202205044) for the Peer ' +
    'Tutoring Program. Mr. Ramos was my student in Networking (IT-NETWRK21) and passed the subject ' +
    'with a grade of 2.0 (Good).',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'He demonstrates a reasonable understanding of network protocols and basic LAN configuration. ' +
    'While he is not among the highest performers in class, he is consistent and hardworking. I have ' +
    'seen him assist classmates when asked and he appears to enjoy explaining things to others.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'I recommend Mr. David Ramos for the program with the expectation that he will perform his duties responsibly.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Prof. Lourdes Villanueva, MSCS',
    position:    'Faculty Member, Department of Computer Engineering',
    department:  'College of Engineering and Architecture',
    institution: 'University of Southern Philippines Foundation',
    date:        'July 25, 2026',
  });
  doc.end();
  console.log('✅  05_MODERATE_cautious.pdf');
}

// ─── LETTER 6 — WEAK · minimal · confirmation only ──────────────────────────
function letter6() {
  const doc = newDoc('06_WEAK_minimal_confirmation.pdf');
  letterhead(doc, {
    institution: 'Cebu Normal University',
    college:     'College of Computer Studies',
    department:  'Department of Information Technology',
    office:      'Faculty Office',
  });
  doc.fontSize(11).text('Date: August 1, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  doc.text('To Whom It May Concern:');
  doc.moveDown(1);
  doc.text(
    'This is to certify that Mr. Luis Castillo (Student ID: 202206033) has been my student in ' +
    'Networking (IT-NETWRK21) this semester. He has attended classes regularly and has completed ' +
    'all required outputs.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text('Mr. Castillo passed the subject with a grade of 3.0 (Passed).');
  doc.moveDown(1);
  doc.text(
    'This letter is issued upon his request for the peer tutoring program application.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Prof. Ana Liza Lopez',
    position:    'Faculty, Department of Information Technology',
    department:  'College of Computer Studies',
    institution: 'Cebu Normal University',
    date:        'August 1, 2026',
  });
  doc.end();
  console.log('✅  06_WEAK_minimal_confirmation.pdf');
}

// ─── LETTER 7 — NONE · enrollment certificate, zero recommendation ────────────
function letter7() {
  const doc = newDoc('07_NONE_enrollment_cert.pdf');
  letterhead(doc, {
    institution: 'University of the Visayas',
    college:     'College of Computer Studies',
    department:  'Registrar\'s Office',
    office:      'Student Records Section',
  });
  doc.fontSize(11).text('Date: July 15, 2026', { align: 'left' });
  doc.moveDown(1.5);

  doc.fontSize(14).font('Helvetica-Bold')
    .text('CERTIFICATE OF ENROLLMENT', { align: 'center' });
  doc.moveDown(1.5);
  doc.font('Helvetica').fontSize(11);

  doc.text('This is to certify that:');
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('Ms. Maricel Buenaventura', { indent: 30 });
  doc.font('Helvetica').text('Student ID No.: 2022-00891', { indent: 30 });
  doc.text('Program: Bachelor of Science in Information Technology', { indent: 30 });
  doc.text('Year Level: Third Year', { indent: 30 });
  doc.moveDown(1);
  doc.text(
    'is a bona fide student of this institution, officially enrolled for the Second Semester ' +
    'of Academic Year 2025-2026.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'This certification is issued upon the request of the above-named student for peer tutoring ' +
    'program application purposes.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(2);
  doc.text('_________________________________');
  doc.font('Helvetica-Bold').text('Mr. Renato Salazar');
  doc.font('Helvetica').fontSize(10).fillColor('#444444');
  doc.text('University Registrar');
  doc.text('University of the Visayas');
  doc.moveDown(0.5);
  doc.text('Date: July 15, 2026');
  doc.fontSize(11).fillColor('#000000');
  doc.end();
  console.log('✅  07_NONE_enrollment_cert.pdf');
}

// ─── LETTER 8 — EDGE CASE · OCR noise / OCR-style typos in text ──────────────
function letter8() {
  const doc = newDoc('08_EDGE_ocr_noise.pdf');
  letterhead(doc, {
    institution: 'Cebu Technological University',
    college:     'College of Computer Studies',
    department:  'Department of Information Technology',
    office:      'Faculty Office',
  });
  doc.fontSize(11).text('Date: July 28, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc);

  // Intentional OCR-style character substitutions: l→1, o→0, i→1
  doc.text('T0 Wh0m lt May C0ncern:');
  doc.moveDown(1);
  doc.text(
    'l am wr1ting th1s letter t0 rec0mmend Ms. Sheila Mae Dizon (Student lD: 202202019) f0r the ' +
    'Peer Tut0ring Pr0gram. She was my student in lnf0rmati0n Security (lT-lNF0SEC32) and Netw0rking ' +
    '(lT-NETWRK21), where she perf0rmed excepti0nally well in b0th subjects.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Her kn0wledge 0f cybersecurity pr1nciples, risk assessment, and netw0rk adm1nistrati0n is ' +
    '0utstanding. She has helped her classmates understand c0mplex t0pics and sh0ws great patience ' +
    'and c0mmunication sk1lls in d0ing s0.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'l str0ngly rec0mmend Ms. Sheila Mae Diz0n f0r the Peer Tut0ring Pr0gram with0ut reservati0n.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Dr. Ric4rd0 Aqu1n0',
    position:    'Department Head, Information Technology',
    department:  'College of Computer Studies',
    institution: 'Cebu Technological University',
    date:        'July 28, 2026',
  });
  doc.end();
  console.log('✅  08_EDGE_ocr_noise.pdf');
}

// ─── LETTER 9 — STRONG · multi-page style (long letter) ─────────────────────
function letter9() {
  const doc = newDoc('09_STRONG_multisubject_long.pdf');
  letterhead(doc, {
    institution: 'University of San Carlos',
    college:     'School of Engineering and Architecture',
    department:  'Department of Computer Science and Information Technology',
    office:      'Office of the Associate Professor',
  });
  doc.fontSize(11).text('Date: August 5, 2026', { align: 'left' });
  doc.moveDown(1.5);
  title(doc, 'RECOMMENDATION LETTER — PEER TUTORING PROGRAM');

  doc.text('Dear Peer Tutoring Coordinator:');
  doc.moveDown(1);
  doc.text(
    'I am pleased to write this letter in very strong support of Mr. Michael Tan (Student ID: 202101007) ' +
    'who is applying to serve as a peer tutor under the Acadia platform. Mr. Tan completed four subjects ' +
    'under my instruction — Programming Fundamentals (CC-PROG11), Data Structures and Algorithms (CC-DSTRUC21), ' +
    'Software Engineering (CC-SOFENG31), and Information Security (CC-INFOSEC32) — achieving perfect scores ' +
    'in all major examinations across all four courses.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'Mr. Tan\'s programming skills in Java and Python are at a professional level. His understanding ' +
    'of object-oriented design, algorithm complexity analysis, software development lifecycle, and ' +
    'cybersecurity fundamentals surpasses what is expected of an undergraduate student. He has ', { continued: true }
  );
  doc.text(
    'independently developed tools used by our laboratory for automated code grading, demonstrating ' +
    'both technical depth and initiative.',
    { lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text('The qualities that distinguish him as a peer tutor are:');
  doc.moveDown(0.5);
  [
    'Critical Thinking — He analyzes problems from multiple angles and guides students toward ' +
      'solutions rather than simply providing answers.',
    'Communication — He frames technical concepts in accessible language adapted to his listener.',
    'Patience — He never shows frustration and repeats explanations as many times as needed.',
    'Leadership — He organized weekly peer study sessions for his entire section throughout the semester.',
    'Dedication — He invests personal time in helping peers without any expectation of reward.',
    'Problem Solving — He breaks down complex algorithms and debugging challenges into clear, manageable steps.',
  ].forEach(q => {
    doc.text('    • ' + q, { indent: 20, lineGap: 3 });
  });
  doc.moveDown(1);
  doc.text(
    'I have been teaching at the tertiary level for more than twelve years and I can say without ' +
    'hesitation that Mr. Michael Tan is among the most exceptional students I have ever encountered. ' +
    'Any student who has the opportunity to be tutored by him will benefit enormously.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'I give Mr. Michael Tan my sincerest, strongest, and most enthusiastic endorsement for the Acadia ' +
    'Peer Tutoring Program for all four of the above-mentioned subjects.',
    { align: 'justify', lineGap: 3 }
  );
  signature(doc, {
    name:        'Dr. Fernando C. Castillo, PhD',
    position:    'Associate Professor IV',
    department:  'Department of Computer Science and IT',
    institution: 'University of San Carlos',
    date:        'August 5, 2026',
  });
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#888888')
    .text('This letter has been validated by the Office of the Dean, School of Engineering and Architecture.');
  doc.end();
  console.log('✅  09_STRONG_multisubject_long.pdf');
}

// ─── LETTER 10 — MODERATE · informal tone · no letterhead ────────────────────
function letter10() {
  const doc = newDoc('10_MODERATE_informal_no_letterhead.pdf');
  doc.moveDown(3);
  doc.fontSize(11).font('Helvetica').fillColor('#000000');
  doc.text('August 2, 2026');
  doc.moveDown(1.5);
  doc.text('Hi,');
  doc.moveDown(1);
  doc.text(
    'Just writing quickly to support Aldrin Cabrera (ID: 202205088) for the peer tutoring program. ' +
    'He was in my Database Systems class. Pretty good student, knows his SQL well, passed with a 1.5.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text(
    'He gets along well with his classmates and I\'ve seen him help a few of them during lab. ' +
    'I think he\'d do fine as a tutor for Database Systems.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);
  doc.text('I recommend him.');
  doc.moveDown(2);
  doc.text('— Prof. Emmanuel Garcia');
  doc.text('IT Department');
  doc.text('Polytechnic University of the Philippines');
  doc.end();
  console.log('✅  10_MODERATE_informal_no_letterhead.pdf');
}

// ─── run all ──────────────────────────────────────────────────────────────────
console.log('\n📄 Generating sample recommendation letters...\n');
letter1();
letter2();
letter3();
letter4();
letter5();
letter6();
letter7();
letter8();
letter9();
letter10();
console.log(`\n📁 Saved to: ${outputDir}\n`);
console.log('Score breakdown:');
console.log('  Strong   → 01, 02, 03, 09 (full formal, Tagalog-English, brief, long multi-subject)');
console.log('  Moderate → 04, 05, 10     (supportive, cautious, informal)');
console.log('  Weak     → 06             (minimal confirmation only)');
console.log('  None     → 07             (enrollment certificate, zero recommendation)');
console.log('  Edge     → 08             (OCR noise / character substitution)');
