/**
 * Generate sample recommendation letter PDFs for testing
 * Run: node generate-sample-letters.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'deliverables', 'sample_letters');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ═══════════════════════════════════════════════════════════
// HIGH SCORE LETTER
// ═══════════════════════════════════════════════════════════
function generateHighScore() {
  const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
  const output = fs.createWriteStream(path.join(outputDir, 'HIGH_SCORE_recommendation.pdf'));
  doc.pipe(output);

  // Header / Letterhead
  doc.fontSize(11).fillColor('#444444')
    .text('Republic of the Philippines', { align: 'center' })
    .text('University of Cebu - Pardo and Talisay Campus', { align: 'center' })
    .text('College of Computer Studies', { align: 'center' })
    .text('Department of Information Technology', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke('#cccccc');
  doc.moveDown(0.5);

  doc.fontSize(10).fillColor('#666666')
    .text('Office of the Department Head', { align: 'center' });

  doc.moveDown(2);

  // Date
  doc.fontSize(11).fillColor('#000000')
    .text('Date: July 1, 2026', { align: 'left' });

  doc.moveDown(2);

  // Title
  doc.fontSize(14).font('Helvetica-Bold')
    .text('RECOMMENDATION LETTER FOR PEER TUTORING', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(9).font('Helvetica').fillColor('#6366f1')
    .text('Acadia Peer Tutoring Platform — Official Recommendation', { align: 'center' });

  doc.moveDown(2);

  // Body
  doc.fontSize(11).font('Helvetica').fillColor('#000000');

  doc.text('To Whom It May Concern:', { align: 'left' });
  doc.moveDown(1);

  doc.text(
    'I, Dr. Maria Theresa Gonzales, Department Head of the Department of Information Technology ' +
    'at the University of Cebu - Pardo and Talisay Campus, am writing this letter to highly recommend ' +
    'Rafael Dela Cruz (Student ID: 202203001) as a qualified peer tutor under the Acadia Peer Tutoring Platform.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);

  doc.text(
    'Rafael has been my student in the following subjects and has demonstrated exceptional academic performance:',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(0.5);

  // Subjects
  doc.font('Helvetica-Bold');
  doc.text('    1. IT-INFOSEC32 — Information Security', { indent: 20 });
  doc.text('    2. IT-SYSADMN32 — Systems Administration', { indent: 20 });
  doc.text('    3. IT-WEBDEV21 — Web Development', { indent: 20 });
  doc.font('Helvetica');
  doc.moveDown(1);

  doc.text(
    'Throughout the duration of these courses, Rafael has consistently shown strong problem-solving abilities, ' +
    'excellent communication skills, and a genuine willingness to help his classmates understand complex topics. ' +
    'He has excelled in both theoretical examinations and practical laboratory assessments.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);

  doc.text('Rafael has demonstrated the following qualities that make him an effective peer tutor:');
  doc.moveDown(0.5);

  const qualities = [
    'Communication — He explains concepts clearly and patiently to peers who seek his help.',
    'Leadership — He often takes initiative in group projects and mentors team members.',
    'Problem Solving — He approaches challenges methodically and helps others develop their analytical thinking.',
    'Patience — He is willing to repeat explanations and adapt his teaching approach to different learning styles.',
    'Teamwork — He collaborates effectively and fosters an inclusive learning environment.',
  ];
  qualities.forEach(q => {
    doc.text(`    • ${q}`, { indent: 20, lineGap: 2 });
  });
  doc.moveDown(1);

  doc.text(
    'I strongly recommend Rafael as a peer tutor for the above-mentioned subjects. I am confident that his ' +
    'academic competence, interpersonal skills, and dedication to helping others will make him a valuable asset ' +
    'to the Acadia tutoring program.',
    { align: 'justify', lineGap: 3 }
  );
  doc.moveDown(1);

  doc.text(
    'I endorse Rafael\'s capability to assist fellow students in the above-mentioned subject(s) without reservation.',
    { align: 'justify', lineGap: 3 }
  );

  doc.moveDown(2);

  // Signature
  doc.text('Respectfully,');
  doc.moveDown(2);
  doc.text('_______________________________');
  doc.font('Helvetica-Bold').text('Dr. Maria Theresa Gonzales');
  doc.font('Helvetica').fontSize(10).fillColor('#444444');
  doc.text('Department Head, Information Technology');
  doc.text('College of Computer Studies');
  doc.text('University of Cebu - Pardo and Talisay Campus');
  doc.moveDown(1);
  doc.text('Date: July 1, 2026');
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#888888')
    .text('Noted by: Dean\'s Office, College of Computer Studies');

  doc.end();
  console.log('✅ Generated: HIGH_SCORE_recommendation.pdf');
}

// ═══════════════════════════════════════════════════════════
// LOW SCORE LETTER
// ═══════════════════════════════════════════════════════════
function generateLowScore() {
  const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
  const output = fs.createWriteStream(path.join(outputDir, 'LOW_SCORE_recommendation.pdf'));
  doc.pipe(output);

  doc.moveDown(5);

  doc.fontSize(12).font('Helvetica').fillColor('#000000');
  doc.text('To whom it may concern');
  doc.moveDown(2);
  doc.text('rafael can tutor programming. he is good at it.');
  doc.moveDown(2);
  doc.text('thank you');

  doc.end();
  console.log('✅ Generated: LOW_SCORE_recommendation.pdf');
}

// Run
generateHighScore();
generateLowScore();
console.log(`\n📁 Files saved to: ${outputDir}`);

