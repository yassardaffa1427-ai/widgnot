import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } from 'docx';

export interface MeetingDocxData {
  title?: string;
  dateStr?: string;
  durationFormatted?: string;
  realtimeNotes: string[];
  summary?: string | null;
}

/**
 * Generate and download a formatted Word .docx document from meeting notes
 */
export async function generateAndDownloadMeetingDocx(data: MeetingDocxData) {
  const title = data.title || 'Notulen Rapat (Meeting Minutes)';
  const dateStr = data.dateStr || new Date().toLocaleDateString('id-ID', {
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
          text: `Dibuat secara otomatis oleh Widgnot AI  |  Tanggal: ${dateStr}  |  Durasi: ${duration}`,
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

  // Section 1: Ringkasan Eksekutif (jika sudah diringkas)
  if (data.summary) {
    docParagraphs.push(
      new Paragraph({
        text: '1. Ringkasan Eksekutif & Poin Kunci',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );

    const summaryLines = data.summary.split('\n');
    for (const line of summaryLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: trimmed.replace(/^[-*•]\s*/, ''),
                size: 22,
              }),
            ],
            spacing: { after: 60 },
          })
        );
      } else {
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }
  }

  // Section 2: Catatan Realtime & Transkripsi Diskusi
  docParagraphs.push(
    new Paragraph({
      text: data.summary ? '2. Catatan Lengkap Realtime' : '1. Poin-Poin Penting & Transkripsi Diskusi',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 280, after: 140 },
    })
  );

  if (data.realtimeNotes.length === 0) {
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Tidak ada catatan yang terekam.',
            italics: true,
            color: '888888',
            size: 22,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  } else {
    for (const note of data.realtimeNotes) {
      docParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: note.replace(/^[-*•]\s*/, ''),
              size: 22,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  // Section 3: Action Items & Tindak Lanjut
  docParagraphs.push(
    new Paragraph({
      text: data.summary ? '3. Tindak Lanjut / Action Items' : '2. Tindak Lanjut / Action Items',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 280, after: 140 },
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: 'Konfirmasi hasil pembahasan kepada seluruh peserta rapat.',
          size: 22,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: 'Pendelegasian tugas berdasarkan poin keputusan di atas.',
          size: 22,
        }),
      ],
      spacing: { after: 60 },
    })
  );

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

