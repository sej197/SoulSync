import React, { useState, useEffect, useCallback, useRef } from 'react';
import Calendar from 'react-calendar';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  ChevronLeft, ChevronRight, BookOpen, PenLine, Trash2, Save,
  Undo, Redo, Lock, Feather, Heart, Sparkles, Pencil, Moon, CalendarDays, Star, BookMarked
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmotionDetector from '../components/EmotionDetector';
import MoodMismatchBanner from '../components/MoodMismatchBanner';
import { getMoodMismatchMessage } from '../utils/emotionUtils';
import {
  fetchJournalEntries,
  fetchJournalByDate,
  fetchCalendarDates,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../lib/journalapi';
import 'react-calendar/dist/Calendar.css';
import './journal.css';


const formatDisplayDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const toLocalDateStr = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const todayStr = () => toLocalDateStr(new Date());


const DiaryToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="diary-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
      >
        <UnderlineIcon size={14} />
      </button>
      <div className="toolbar-divider" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <List size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </button>
      <div className="toolbar-divider" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={14} />
      </button>
    </div>
  );
};


const BindingDots = () => (
  <div className="diary-binding">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="diary-binding-dot" />
    ))}
  </div>
);

export default function Journal() {
  const [mode, setMode] = useState('write');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const faceEmotionRef = useRef('neutral');
  const [mismatchMessage, setMismatchMessage] = useState(null);
  const [calendarDates, setCalendarDates] = useState([]);
  const [activeMonth, setActiveMonth] = useState(new Date());


  const [subject, setSubject] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [todayEntries, setTodayEntries] = useState([]);


  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [flipIndex, setFlipIndex] = useState(0);
  const [loadingEntries, setLoadingEntries] = useState(false);


  const [loadingDate, setLoadingDate] = useState(false);


  const isToday = toLocalDateStr(selectedDate) === todayStr();
  // Past day = not today
  const isPastDay = !isToday;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Dear diary, today I felt...',
      }),
    ],
    content: '',
    editable: true,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });


  useEffect(() => {
    if (!editor) return;
    if (isPastDay) {
      editor.setEditable(false);
    } else {
      editor.setEditable(true);
    }
  }, [isPastDay, editor]);


  const loadCalendarDates = useCallback(async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const data = await fetchCalendarDates(month, year);
      setCalendarDates(data.calendarDates || []);
    } catch {
      setCalendarDates([]);
    }
  }, []);

  useEffect(() => {
    loadCalendarDates(activeMonth);
  }, [activeMonth, loadCalendarDates]);


  const loadEntryForDate = useCallback(async (date) => {
    setLoadingDate(true);
    const dateIsToday = toLocalDateStr(date) === todayStr();
    try {
      const dateStr = toLocalDateStr(date);
      const data = await fetchJournalByDate(dateStr);
      const dayEntries = data.entries || [];

      if (dateIsToday) {
        setTodayEntries(dayEntries);
        // Always start with a blank editor for a new entry
        setEditingEntry(null);
        setSubject('');
        if (editor) editor.commands.setContent('');
      } else {
        setTodayEntries(dayEntries);
        if (dayEntries.length > 0) {
          const entry = dayEntries[0];
          setEditingEntry(entry);
          setSubject(entry.subject || '');
          if (editor) editor.commands.setContent(entry.text || '');
        } else {
          setEditingEntry(null);
          setSubject('');
          if (editor) editor.commands.setContent('');
        }
      }
    } catch {
      setTodayEntries([]);
      setEditingEntry(null);
      setSubject('');
      if (editor) editor.commands.setContent('');
    }
    setLoadingDate(false);
  }, [editor]);

  useEffect(() => {
    if (mode === 'write' && editor) {
      loadEntryForDate(selectedDate);
    }
  }, [selectedDate, mode, editor, loadEntryForDate]);


  const loadEntries = useCallback(async (page = 1) => {
    setLoadingEntries(true);
    try {
      const data = await fetchJournalEntries(page, 5);
      setEntries(data.entries || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotalEntries(data.totalEntries || 0);
      setFlipIndex(0);
    } catch {
      setEntries([]);
    }
    setLoadingEntries(false);
  }, []);

  useEffect(() => {
    if (mode === 'read') {
      loadEntries(1);
    }
  }, [mode, loadEntries]);


  const handleDateClick = (date) => {
    setSelectedDate(date);
    setMode('write');
  };


  const handleSave = async () => {
    if (isPastDay) {
      toast.error("You can only write for today!");
      return;
    }

    const text = editor?.getHTML();
    const plainText = editor?.getText()?.trim();
    if (!plainText) {
      toast.error('Write something first!');
      return;
    }

    setSaving(true);
    try {
      let data;
      if (editingEntry) {
        data = await updateJournalEntry(editingEntry._id, text, subject);
        setTodayEntries(prev => prev.map(e => e._id === editingEntry._id ? data.entry : e));
        setEditingEntry(null);
        setSubject('');
        if (editor) editor.commands.setContent('');
        toast.success('Updated!');
      } else {
        data = await createJournalEntry(text, subject);
        setTodayEntries(prev => [data.entry, ...prev]);
        setSubject('');
        if (editor) editor.commands.setContent('');
        toast.success('Saved!');

        // Show badge notifications
        if (data.newlyAwarded && data.newlyAwarded.length > 0) {
          data.newlyAwarded.forEach(badge => {
            toast.success(`New Badge Earned: ${badge.name}!`, {
              duration: 5000,
              icon: <Star size={16} className="text-amber-500" />,
            });
          });
        }
      }
      loadCalendarDates(activeMonth);

      // Mood mismatch check — compare face emotion with text sentiment
      const score = data?.entry?.sentimentScore;
      console.log("[Journal] Save successful. Face Emotion:", faceEmotionRef.current, "Sentiment Score:", score);

      const mismatchMsg = getMoodMismatchMessage(faceEmotionRef.current, score);
      if (mismatchMsg) {
        console.log("[Journal] Mood mismatch detected:", mismatchMsg);
        setMismatchMessage(mismatchMsg);
      } else {
        console.log("[Journal] No mood mismatch detected.");
        setMismatchMessage(null);
      }
    } catch (err) {
      console.error("[Journal] Save error:", err);
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };


  const handleDelete = async (entryToDelete) => {
    const entry = entryToDelete || editingEntry;
    if (!entry) return;
    try {
      await deleteJournalEntry(entry._id);
      setTodayEntries(prev => prev.filter(e => e._id !== entry._id));
      if (editingEntry?._id === entry._id) {
        setEditingEntry(null);
        setSubject('');
        if (editor) editor.commands.setContent('');
      }
      toast.success('Deleted');
      loadCalendarDates(activeMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setSubject(entry.subject || '');
    if (editor) editor.commands.setContent(entry.text || '');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setSubject('');
    if (editor) editor.commands.setContent('');
  };


  const currentEntry = entries[flipIndex];

  const flipPrev = () => {
    if (flipIndex > 0) {
      setFlipIndex(flipIndex - 1);
    } else if (currentPage < totalPages) {
      loadEntries(currentPage + 1).then(() => setFlipIndex(0));
    }
  };

  const flipNext = () => {
    if (flipIndex < entries.length - 1) {
      setFlipIndex(flipIndex + 1);
    } else if (currentPage > 1) {
      loadEntries(currentPage - 1).then(() => setFlipIndex(0));
    }
  };

  const canFlipPrev = flipIndex > 0 || currentPage < totalPages;
  const canFlipNext = flipIndex < entries.length - 1 || currentPage > 1;


  const globalIndex = flipIndex + 1 + (currentPage - 1) * 5;

  // Tile class for calendar
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const dateStr = toLocalDateStr(date);
    const hasEntry = calendarDates.some(d => d.date === dateStr);
    return hasEntry ? 'calendar-has-entry' : '';
  };

  return (
    <div className="journal-page">
      <MoodMismatchBanner message={mismatchMessage} onDismiss={() => setMismatchMessage(null)} />
      <EmotionDetector onEmotionDetected={(e) => { faceEmotionRef.current = e; }} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="journal-page-header flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-[#4a5568] flex items-center gap-3" style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}>
              <Feather className="text-[#8fb5a3]" size={24} />
              My Diary
              <Heart className="text-[#8fb5a3] fill-[#8fb5a3] opacity-40" size={16} />
            </h1>
            <p className="text-sm text-[#7c8a7e] mt-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              your cozy corner to pour your thoughts out
            </p>
          </div>

          {/* Mode switcher */}
          <div className="journal-mode-tabs">
            <button
              className={`journal-mode-tab ${mode === 'write' ? 'active' : ''}`}
              onClick={() => setMode('write')}
            >
              <PenLine size={13} className="inline mr-1 -mt-0.5" />
              Write
            </button>
            <button
              className={`journal-mode-tab ${mode === 'read' ? 'active' : ''}`}
              onClick={() => setMode('read')}
            >
              <BookOpen size={13} className="inline mr-1 -mt-0.5" />
              Read
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* ── Left: Calendar ── */}
          <div className="journal-calendar-panel h-fit lg:sticky lg:top-24">
            <h3><CalendarDays size={14} className="inline -mt-0.5 mr-1 text-[#8fb5a3]" /> Calendar</h3>
            <Calendar
              value={selectedDate}
              onChange={handleDateClick}
              onActiveStartDateChange={({ activeStartDate }) =>
                setActiveMonth(activeStartDate)
              }
              tileClassName={tileClassName}
              maxDate={new Date()}
            />
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(190, 180, 160, 0.2)' }}>
              <p className="text-xs flex items-center gap-1.5" style={{ color: '#7c8a7e', fontFamily: "'Quicksand', sans-serif" }}>
                <span style={{ color: '#8fb5a3', fontSize: '10px' }}>●</span>
                Days with entries
              </p>
            </div>
          </div>

          {/* ── Right: Diary ── */}
          <div className="diary-container">
            {mode === 'write' ? (
              /* ── WRITE MODE ── */
              <div>
              <div className="diary-book diary-page-enter" key={editingEntry?._id || selectedDate.toISOString()}>
                <BindingDots />

                <div className="diary-header">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="diary-date">
                      {formatDisplayDate(selectedDate)}
                    </div>
                    {isToday && editingEntry && (
                      <span className="diary-status-tag editing">
                        <Pencil size={10} className="inline -mt-0.5 mr-0.5" /> Editing
                      </span>
                    )}
                    {isToday && !editingEntry && (
                      <span className="diary-status-tag today">
                        <Sparkles size={10} className="inline -mt-0.5 mr-0.5" /> New Entry
                      </span>
                    )}
                    {isPastDay && editingEntry && (
                      <span className="diary-status-tag readonly">
                        <Lock size={10} /> Read only
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="diary-subject-input"
                    placeholder={isPastDay ? '' : "Give it a title..."}
                    value={subject}
                    onChange={(e) => !isPastDay && setSubject(e.target.value)}
                    readOnly={isPastDay}
                  />
                </div>

                {/* Read-only notice for past days */}
                {isPastDay && editingEntry && (
                  <div className="diary-readonly-notice">
                    <Lock size={13} />
                    This is a past entry — it's sealed in time, no edits allowed
                  </div>
                )}

                {/* Toolbar — only show for today */}
                {isToday && (
                  <div className="flex items-center justify-between px-4 pt-3 pb-0" style={{ paddingLeft: '2.75rem' }}>
                    <DiaryToolbar editor={editor} />
                  </div>
                )}

                <div className={`diary-body ${isPastDay ? 'read-only' : ''}`}>
                  {loadingDate ? (
                    <div className="diary-empty-state">
                      <span className="loading loading-spinner loading-md text-[#8fb5a3]"></span>
                    </div>
                  ) : isPastDay && todayEntries.length === 0 ? (
                    /* Past day with no entries */
                    <div className="diary-empty-state">
                      <div className="empty-icon"><Moon size={28} className="text-[#8fb5a3]" /></div>
                      <h4>No entry for this day</h4>
                      <p>You didn't write anything on this day. That's okay — every day is a fresh page!</p>
                    </div>
                  ) : isPastDay && todayEntries.length > 0 ? (
                    /* Past day — show all entries read-only */
                    <div className="space-y-4 p-2">
                      {todayEntries.map((entry, idx) => (
                        <div key={entry._id} className="border-b border-[#e8e0d4] pb-4 last:border-b-0 last:pb-0">
                          {entry.subject && (
                            <p className="text-sm font-bold text-[#4a5568] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>{entry.subject}</p>
                          )}
                          <div
                            className="diary-read-text text-sm"
                            dangerouslySetInnerHTML={{ __html: entry.text }}
                          />
                          <span className="text-[10px] text-[#a0a8a2] mt-1 block">
                            {new Date(entry.entryTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EditorContent editor={editor} />
                  )}
                </div>

                {/* Footer — only show save/delete for today */}
                {isToday && (
                  <div className="diary-footer">
                    <div className="flex items-center gap-2">
                      <button
                        className="diary-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save size={14} className="inline mr-1.5 -mt-0.5" />
                        {saving ? 'Saving...' : editingEntry ? 'Update' : 'Save'}
                      </button>
                      {editingEntry && (
                        <>
                          <button
                            className="diary-delete-btn"
                            onClick={() => handleDelete(editingEntry)}
                          >
                            <Trash2 size={13} className="inline mr-1 -mt-0.5" />
                            Delete
                          </button>
                          <button
                            className="diary-delete-btn"
                            onClick={handleCancelEdit}
                            style={{ opacity: 0.7 }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Today's previous entries */}
              {isToday && todayEntries.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-[#7c8a7e] flex items-center gap-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    <BookOpen size={14} className="text-[#8fb5a3]" />
                    Today's Entries ({todayEntries.length})
                  </h4>
                  {todayEntries.map((entry) => (
                    <div
                      key={entry._id}
                      className={`rounded-2xl border p-4 transition-all ${editingEntry?._id === entry._id
                        ? 'border-[#8fb5a3] bg-[#f0f7f4] shadow-sm'
                        : 'border-[#e8e0d4] bg-white/80 hover:border-[#c5d4c0]'
                      }`}
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {entry.subject && (
                            <p className="text-sm font-bold text-[#4a5568] mb-1 truncate">{entry.subject}</p>
                          )}
                          <p className="text-xs text-[#7c8a7e] line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: entry.text }}
                          />
                          <span className="text-[10px] text-[#a0a8a2] mt-1 block">
                            {new Date(entry.entryTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="p-1.5 rounded-lg hover:bg-[#e8f5e9] text-[#7c8a7e] hover:text-[#4a5568] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#7c8a7e] hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Past day entries list */}
              {isPastDay && todayEntries.length === 0 && !editingEntry && !loadingDate && (
                <div />
              )}
              </div>
            ) : (
              /* ── READ / FLIP MODE ── */
              <div>
                {loadingEntries ? (
                  <div className="diary-book flex items-center justify-center">
                    <BindingDots />
                    <span className="loading loading-spinner loading-lg text-[#8fb5a3]"></span>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="diary-book">
                    <BindingDots />
                    <div className="diary-empty-state">
                      <div className="empty-icon"><BookMarked size={28} className="text-[#8fb5a3]" /></div>
                      <h4>No entries yet!</h4>
                      <p>Switch to Write mode and start your diary today</p>
                    </div>
                  </div>
                ) : currentEntry ? (
                  <div className="diary-book diary-page-enter" key={currentEntry._id}>
                    <BindingDots />

                    <div className="diary-header">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="diary-date">
                          {formatDisplayDate(currentEntry.entryTime)}
                        </div>
                      </div>
                      {currentEntry.subject && (
                        <p className="diary-subject-input" style={{ borderBottom: 'none', cursor: 'default' }}>
                          {currentEntry.subject}
                        </p>
                      )}
                    </div>

                    <div className="diary-body read-only">
                      <div
                        className="diary-read-text"
                        dangerouslySetInnerHTML={{ __html: currentEntry.text }}
                      />
                    </div>

                    <div className="diary-footer">
                      <div className="page-flip-nav w-full">
                        <button
                          className="page-flip-btn"
                          onClick={flipPrev}
                          disabled={!canFlipPrev}
                          title="Older entry"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="page-flip-info">
                          {globalIndex} of {totalEntries}
                        </span>
                        <button
                          className="page-flip-btn"
                          onClick={flipNext}
                          disabled={!canFlipNext}
                          title="Newer entry"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
