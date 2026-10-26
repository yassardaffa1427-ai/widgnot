import { useState } from 'react';
import { motion } from 'motion/react';
import { contentSpring } from '@/lib/motion';
import { CalendarDays, Check, Clock } from './Icons';
import { toKey } from '@/lib/date';

interface ActivityFormData {
  title: string;
  date: string;
  time: string;
  notes?: string;
}

interface Props {
  initialDate?: string;
  initialTime?: string;
  onSubmit: (data: ActivityFormData) => void;
  onCancel: () => void;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

export function AddActivityForm({
  initialDate = toKey(new Date()),
  initialTime = '16:00',
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [notes, setNotes] = useState('');

  // Format date display for pill: "20 Apr 2026"
  const dateObj = new Date(date + 'T12:00:00');
  const dNum = isNaN(dateObj.getTime()) ? new Date().getDate() : dateObj.getDate();
  const mIndex = isNaN(dateObj.getTime()) ? new Date().getMonth() : dateObj.getMonth();
  const yNum = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
  const dayName = isNaN(dateObj.getTime()) ? 'Senin' : HARI[dateObj.getDay()];
  const monthName = BULAN[mIndex];
  const shortMonth = BULAN_PENDEK[mIndex];

  // Time formatted with dot, e.g. "16.00"
  const formattedTime = time.replace(':', '.');
  const summaryText = `${dayName}, ${dNum} ${monthName} ${yNum} · ${formattedTime} WIB`;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim() || 'Aktivitas Baru';
    onSubmit({
      title: cleanTitle,
      date,
      time,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={contentSpring}
      style={{ overflow: 'hidden', width: '100%' }}
    >
      <form onSubmit={handleSubmit} className="act-form">
        {/* Card 1: Nama aktivitas */}
        <div className="act-form__card act-form__card--title">
          <label className="act-form__label" htmlFor="act-title">Nama aktivitas</label>
          <input
            id="act-title"
            className="act-form__input-title"
            type="text"
            autoFocus
            placeholder="Meeting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onCancel();
            }}
          />
        </div>

        {/* Card 2: Tanggal & Waktu */}
        <div className="act-form__card act-form__card--schedule">
          {/* Row 1: Tanggal */}
          <div className="act-form__row">
            <div className="act-form__row-left">
              <CalendarDays size={18} style={{ color: '#a3a3a7' }} />
              <span className="act-form__row-text">Tanggal</span>
            </div>
            <label className="act-form__pill">
              <span>{dNum} {shortMonth} {yNum}</span>
              <input
                className="act-form__hidden-picker"
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="act-form__divider" />

          {/* Row 2: Waktu */}
          <div className="act-form__row">
            <div className="act-form__row-left">
              <Clock size={18} style={{ color: '#a3a3a7' }} />
              <span className="act-form__row-text">Waktu</span>
            </div>
            <label className="act-form__pill">
              <span>{formattedTime}</span>
              <input
                className="act-form__hidden-picker"
                type="time"
                value={time}
                onChange={(e) => e.target.value && setTime(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Card 3: Catatan (Opsional) */}
        <div className="act-form__card act-form__card--notes">
          <div className="act-form__notes-header">
            <span>Catatan</span>
            <span>Opsional</span>
          </div>
          <textarea
            className="act-form__textarea"
            rows={2}
            placeholder="Meeting dengan client"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Timestamp Summary */}
        <p className="act-form__summary">
          {summaryText}
        </p>

        {/* Actions */}
        <div className="act-form__actions">
          <button
            type="button"
            className="act-form__btn-cancel"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="submit"
            className="act-form__btn-submit"
          >
            <Check size={18} />
            Simpan aktivitas
          </button>
        </div>
      </form>
    </motion.div>
  );
}
