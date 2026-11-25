import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } from 'docx';

export interface MeetingDocxData {
  title?: string;
  dateStr?: string;
  durationFormatted?: string;
  realtimeNotes: string[];
  summary?: string | null;
}

/**
 * Parse inline markdown bold (**teks**) menjadi array TextRun agar tampil rapi tanpa tanda ** mentah di Word.
 */
function parseFormattedRuns(text: string, fontSizeHalfPt = 22): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          size: fontSizeHalfPt,
        })
      );
    }
    runs.push(
      new TextRun({
        text: match[1],
        bold: true,
        size: fontSizeHalfPt,
      })
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        size: fontSizeHalfPt,
      })
    );
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, size: fontSizeHalfPt }));
  }

  return runs;
}

/**
 * Generate and download a formatted Word .docx document containing AI-distilled meeting key points.
 */
export async function generateAndDownloadMeetingDocx(data: MeetingDocxData) {
  const title = data.title || 'Notulen Poin Penting Rapat';
  const dateStr =
    data.dateStr ||
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const duration = data.durationFormatted || '00:00';

  const docParagraphs: Paragraph[] = [
    // Header Title
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),

    // Subtitle / Metadata
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Dirangkum oleh Widgnot AI  |  Tanggal: ${dateStr}  |  Durasi Rapat: ${duration}`,
          italics: true,
          color: '666666',
          size: 20, // 10pt
        }),
      ],
      border: {
        bottom: {
          color: 'CCCCCC',
          space: 8,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),
  ];

  const cleanSummary = data.summary?.trim();

  if (cleanSummary) {
    const lines = cleanSummary.split('\n');
    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed === '---') continue;

      // Markdown Heading (## ... atau ### ...)
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
        docParagraphs.push(
          new Paragraph({
            text: headingText,
            heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 110 },
          })
        );
        continue;
      }

      // Numbered section heading seperti "1. Poin-Poin Penting Pembahasan" (tanpa teks panjang setelah titik dua)
      const numberedHeading = trimmed.match(/^(\d+\.\s+[^:]{3,60}):?$/);
      if (numberedHeading && !rawLine.startsWith('  ')) {
        docParagraphs.push(
          new Paragraph({
            text: numberedHeading[1].replace(/\*\*/g, '').trim(),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 220, after: 100 },
          })
        );
        continue;
      }

      // Sub-bullet (indentasi spasi/tab diikuti -, *, •)
      if (/^\s{2,}[-*•]\s+/.test(rawLine)) {
        const content = trimmed.replace(/^[-*•]\s+/, '');
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 1 },
            children: parseFormattedRuns(content, 22),
            spacing: { after: 70 },
          })
        );
        continue;
      }

      // Main bullet (-, *, •)
      if (/^[-*•]\s+/.test(trimmed)) {
        const content = trimmed.replace(/^[-*•]\s+/, '');
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: parseFormattedRuns(content, 22),
            spacing: { after: 90 },
          })
        );
        continue;
      }

      // Normal paragraph
      docParagraphs.push(
        new Paragraph({
          children: parseFormattedRuns(trimmed, 22),
          spacing: { after: 110 },
        })
      );
    }
  } else {
    // Fallback hanya jika API Key tidak tersedia dan belum ada ringkasan AI
    docParagraphs.push(
      new Paragraph({
        text: 'Catatan Rapat',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );

    const filteredNotes = data.realtimeNotes.filter(
      (n) =>
        !n.startsWith('Merekam:') &&
        !n.includes('Sesi rekaman meeting selesai') &&
        !n.includes('Tidak ada percakapan suara yang terdeteksi')
    );

    if (filteredNotes.length === 0) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Tidak ada poin pembicaraan yang tercatat.',
              italics: true,
              color: '888888',
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    } else {
      for (const note of filteredNotes) {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: parseFormattedRuns(note.replace(/^[-*•]\s*/, ''), 22),
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const now = new Date();
  const filename = `Notulen_Meeting_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
