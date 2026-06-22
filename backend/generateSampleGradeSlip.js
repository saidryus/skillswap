/**
 * Generate a sample grade slip PDF that mimics a Philippine college format.
 * Run: node generateSampleGradeSlip.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'uploads', 'sample-grade-slips');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function generateGradeSlip(studentName, studentId, semester, schoolYear, grades) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, compress: false });
  const filename = `grade_slip_${studentId.replace(/\s/g, '_')}.pdf`;
  const filePath = path.join(outputDir, filename);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('UNIVERSITY OF COMPUTING', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('Information Technology Department', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').text('OFFICIAL GRADE SLIP', { align: 'center' });
  doc.moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Student info
  doc.fontSize(10).font('Helvetica');
  doc.text(`Student Name: ${studentName}`, 50);
  doc.text(`Student ID: ${studentId}`, 50);
  doc.text(`Semester: ${semester}`, 350, doc.y - 24);
  doc.text(`School Year: ${schoolYear}`, 350);
  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  const colWidths = [80, 200, 50, 60, 60];
  const colX = [50, 130, 330, 380, 440];
  const headers = ['Course Code', 'Course Name', 'Units', 'Grade', 'Remarks'];

  doc.font('Helvetica-Bold').fontSize(9);
  doc.rect(50, tableTop, 495, 20).fill('#1e3a8a');
  doc.fillColor('white');
  headers.forEach((h, i) => {
    doc.text(h, colX[i] + 4, tableTop + 5, { width: colWidths[i], align: 'left' });
  });
  doc.fillColor('black');

  // Table rows
  let y = tableTop + 22;
  doc.font('Helvetica').fontSize(9);

  grades.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(50, y, 495, 18).fill(bgColor);
    doc.fillColor('black');

    doc.text(row.code, colX[0] + 4, y + 4, { width: colWidths[0] });
    doc.text(row.name, colX[1] + 4, y + 4, { width: colWidths[1] });
    doc.text(String(row.units), colX[2] + 4, y + 4, { width: colWidths[2] });
    doc.text(row.grade.toFixed(2), colX[3] + 4, y + 4, { width: colWidths[3] });
    doc.text(row.grade <= 3.0 ? 'PASSED' : 'FAILED', colX[4] + 4, y + 4, { width: colWidths[4] });

    y += 18;
  });

  // Border around table
  doc.rect(50, tableTop, 495, y - tableTop).stroke();

  // Footer
  doc.moveDown(3);
  y = doc.y + 20;
  doc.fontSize(9).text('This is a computer-generated document.', 50, y, { align: 'center' });
  doc.text('Unauthorized alteration is strictly prohibited.', { align: 'center' });

  doc.moveDown(3);
  doc.text('___________________________', 50, doc.y);
  doc.text('Registrar', 50);

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      console.log(`Generated: ${filePath}`);
      resolve(filePath);
    });
  });
}

// Generate sample grade slips for different students
async function main() {
  // Student 1: Juan Dela Cruz — Year 1
  await generateGradeSlip('Juan Dela Cruz', '202400001', '1st Semester', '2024-2025', [
    { code: 'IT101', name: 'Introduction to Computing', units: 3, grade: 1.50 },
    { code: 'IT102', name: 'Computer Programming 1', units: 3, grade: 2.00 },
    { code: 'IT103', name: 'Mathematics in the Modern World', units: 3, grade: 1.75 },
    { code: 'GE101', name: 'Understanding the Self', units: 3, grade: 2.25 },
    { code: 'GE102', name: 'Readings in Philippine History', units: 3, grade: 1.50 },
    { code: 'PE101', name: 'Physical Fitness', units: 2, grade: 1.25 },
  ]);

  // Student 2: Carlos Mendoza — Year 2
  await generateGradeSlip('Carlos Mendoza', '202300001', '1st Semester', '2024-2025', [
    { code: 'IT201', name: 'Data Structures and Algorithms', units: 3, grade: 1.25 },
    { code: 'IT202', name: 'Database Management Systems', units: 3, grade: 1.50 },
    { code: 'IT203', name: 'Object-Oriented Programming', units: 3, grade: 1.75 },
    { code: 'MATH201', name: 'Discrete Mathematics', units: 3, grade: 2.00 },
    { code: 'GE201', name: 'Ethics', units: 3, grade: 1.50 },
  ]);

  // Student 3: Luisa Torres — Year 3
  await generateGradeSlip('Luisa Torres', '202200001', '1st Semester', '2024-2025', [
    { code: 'IT101', name: 'Introduction to Computing', units: 3, grade: 1.00 },
    { code: 'IT301', name: 'Web Development', units: 3, grade: 1.25 },
    { code: 'IT302', name: 'Networking Fundamentals', units: 3, grade: 1.50 },
    { code: 'IT201', name: 'Data Structures and Algorithms', units: 3, grade: 1.25 },
    { code: 'IT202', name: 'Database Management Systems', units: 3, grade: 1.50 },
  ]);

  console.log('\n✅ Sample grade slips generated in:', outputDir);
  console.log('\nUse these to test the OCR grade detection:');
  console.log('  - grade_slip_202400001.pdf  (Juan — IT101: 1.50, IT102: 2.00)');
  console.log('  - grade_slip_202300001.pdf  (Carlos — IT201: 1.25, IT202: 1.50)');
  console.log('  - grade_slip_202200001.pdf  (Luisa — IT101: 1.00, IT301: 1.25)');
}

main();
