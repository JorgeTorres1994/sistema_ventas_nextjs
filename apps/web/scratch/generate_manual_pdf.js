const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

async function generate() {
    const manualPath = 'C:/Users/usuario/.gemini/antigravity/brain/b36b1d5b-d5d8-4641-9e92-24f0fd1b0342/nexus_genesis_comprehensive_manual.md';
    let content = fs.readFileSync(manualPath, 'utf8');

    // Strip emojis and special symbols that jspdf helvetica can't handle
    content = content.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '');
    
    // Also strip or replace other common markdown symbols if they cause issues
    content = content.replace(/✅/g, '[OK]');
    content = content.replace(/🚀/g, '');
    content = content.replace(/🏗️/g, '');
    content = content.replace(/🛒/g, '');
    content = content.replace(/🧾/g, '');
    content = content.replace(/📄/g, '');
    content = content.replace(/💰/g, '');
    content = content.replace(/📊/g, '');
    content = content.replace(/💸/g, '');
    content = content.replace(/💳/g, '');
    content = content.replace(/📦/g, '');
    content = content.replace(/🔄/g, '');
    content = content.replace(/🏷️/g, '');
    content = content.replace(/📂/g, '');
    content = content.replace(/👥/g, '');
    content = content.replace(/🏭/g, '');
    content = content.replace(/🎁/g, '');
    content = content.replace(/🛠️/g, '');
    content = content.replace(/👤/g, '');
    content = content.replace(/👨‍💼/g, '');
    content = content.replace(/🔐/g, '');
    content = content.replace(/📜/g, '');
    content = content.replace(/💎/g, '');
    content = content.replace(/🌟/g, '');
    content = content.replace(/✨/g, '');
    content = content.replace(/🛡️/g, '');

    const doc = new jsPDF();
    doc.setFont("helvetica");

    let y = 20;
    const lines = content.split('\n');
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (margin * 2);

    // Title Section
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);
    doc.setFont("helvetica", "bold");
    doc.text("NEXUS GENESIS ERP", margin, y);
    y += 12;
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Manual Integral de Operaciones", margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setTextColor(0);

    for (let line of lines) {
        if (y > 275) {
            doc.addPage();
            y = 20;
        }

        if (line.startsWith('# ')) {
            y += 8;
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(line.replace('# ', '').trim(), margin, y);
            y += 12;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
        } else if (line.startsWith('## ')) {
            y += 6;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(line.replace('## ', '').trim(), margin, y);
            y += 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
        } else if (line.startsWith('### ')) {
            y += 4;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(line.replace('### ', '').trim(), margin, y);
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
        } else if (line.trim() === '---') {
            y += 2;
            doc.setDrawColor(230);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        } else if (line.trim().length === 0) {
            y += 4;
        } else {
            const splitText = doc.splitTextToSize(line.trim(), maxWidth);
            doc.text(splitText, margin, y);
            y += (splitText.length * 6);
        }
    }

    const outputPath = path.join(__dirname, '..', '..', '..', 'Manual_Nexus_Genesis_Final.pdf');
    const pdfData = doc.output();
    fs.writeFileSync(outputPath, pdfData, 'binary');
    console.log(`PDF updated at: ${outputPath}`);
}

generate().catch(console.error);
