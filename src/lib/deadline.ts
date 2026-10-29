import type { Activity } from '@/store/data';

export interface DeadlineAlert {
  id: string;
  urgency: 'warning' | 'angry';
  title: string;
  diffMinutes: number;
  timeStr: string;
  timeRemainingDisplay: string;
  humanMessage: string;
  message: string;
}

/**
 * Format pesan pengingat yang ramah, manusiawi, dan interaktif sesuai tingkat urgensi.
 */
export function formatHumanDeadlineMessage(title: string, diffMinutes: number, urgency: 'warning' | 'angry'): string {
  if (diffMinutes < 0) {
    const overdue = Math.abs(diffMinutes);
    return `Aduh, deadline "${title}" sudah lewat ${overdue} menit nih! Yuk beresin sekarang! 🚨`;
  }
  if (diffMinutes === 0) {
    return `Waktunya habis! Deadline "${title}" sekarang juga! Yuk selesaikan! ⚡`;
  }
  if (urgency === 'angry') {
    // <= 15 menit
    if (diffMinutes <= 5) {
      return `Gawat! "${title}" tinggal ${diffMinutes} menit lagi woy, buruan kelarin! 🔥`;
    }
    return `Hati-hati! Waktu "${title}" sisa ${diffMinutes} menit lagi nih! 😤`;
  }
  // urgency === 'warning' (16 - 60 menit)
  if (diffMinutes <= 30) {
    return `Jangan lupa ya, "${title}" tinggal ${diffMinutes} menit lagi. Semangat! ✨`;
  }
  return `Ingat ya, "${title}" batas waktunya ${diffMinutes} menit lagi! ⏳`;
}

/**
 * Mencari aktivitas yang paling dekat dengan batas waktu (deadline)
 * - Jika <= 15 menit atau sudah lewat: urgency 'angry' (merah marah)
 * - Jika 16 - 60 menit: urgency 'warning' (kuning peringatan)
 */
export function getUpcomingDeadline(activities: Activity[], now = new Date()): DeadlineAlert | null {
  const incomplete = activities.filter((a) => !a.done);
  if (incomplete.length === 0) return null;

  let closest: DeadlineAlert | null = null;
  let minDiff = Infinity;

  for (const a of incomplete) {
    const timeStr = a.deadlineTime || a.time;
    if (!timeStr) continue;

    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) continue;

    const targetDate = new Date(`${a.date}T12:00:00`);
    targetDate.setHours(hours, minutes, 0, 0);

    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    // Rentang deteksi: dari 3 jam yang lalu (overdue) sampai 60 menit ke depan
    if (diffMinutes >= -180 && diffMinutes <= 60) {
      if (diffMinutes < minDiff) {
        minDiff = diffMinutes;
        const urgency = diffMinutes <= 15 ? 'angry' : 'warning';
        let timeMsg = '';
        if (diffMinutes <= 0) {
          timeMsg = diffMinutes === 0 ? 'sekarang!' : `lewat ${Math.abs(diffMinutes)} menit!`;
        } else {
          timeMsg = `${diffMinutes} menit lagi`;
        }
        closest = {
          id: a.id,
          urgency,
          title: a.title,
          diffMinutes,
          timeStr,
          timeRemainingDisplay: timeMsg,
          humanMessage: formatHumanDeadlineMessage(a.title, diffMinutes, urgency),
          message: `deadline [${a.title}] [${timeMsg}]`,
        };
      }
    }
  }

  return closest;
}
