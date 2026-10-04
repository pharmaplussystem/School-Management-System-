import React, { useState } from 'react';
import {
  Library,
  Plus,
  Search,
  Book,
  CheckCircle2,
  Clock,
  X,
  User,
  Users,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight,
  Bookmark,
  Layers,
  List,
  LayoutGrid,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LibraryBook, LibraryIssueTransaction } from '../../types';
import { printContent, downloadCSV } from '../../utils/printAndDownload';

export const LibraryView: React.FC = () => {
  const {
    libraryBooks,
    addLibraryBook,
    updateLibraryBook,
    libraryIssues,
    issueBooksTransaction,
    returnLibraryBookItem,
    students,
    staff,
    schoolProfile,
    showToast,
  } = useApp();

  // Top navigation tabs: Books Catalog vs Borrowers & Issues
  const [mainTab, setMainTab] = useState<'books' | 'borrowers'>('books');

  // BOOKS TAB STATE
  const [bookDisplayMode, setBookDisplayMode] = useState<'list' | 'grid'>('list');
  const [bookStatusFilter, setBookStatusFilter] = useState<'ALL' | 'Available' | 'Issued' | 'Damaged'>('ALL');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('ALL');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // BORROWERS / ISSUES TAB STATE
  const [issueStatusFilter, setIssueStatusFilter] = useState<'ALL' | 'Overdue' | 'Returned' | 'Currently issued'>('ALL');
  const [issueSearchQuery, setIssueSearchQuery] = useState('');
  const [selectedBorrowerDetails, setSelectedBorrowerDetails] = useState<{
    person_id: string;
    person_type: 'Student' | 'Teacher' | 'Staff';
    person_name: string;
    identifier: string;
    issues: LibraryIssueTransaction[];
  } | null>(null);

  // ISSUE / LEND MODAL STATE
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [borrowerType, setBorrowerType] = useState<'Student' | 'Teacher' | 'Staff'>('Student');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2-week default loan period
    return d.toISOString().split('T')[0];
  });
  const [bookSearchForIssue, setBookSearchForIssue] = useState('');
  const [selectedBookItems, setSelectedBookItems] = useState<
    Array<{
      book_id: string;
      book_title: string;
      book_code: string;
      copies_issued: number;
    }>
  >([]);

  // ADD BOOK FORM STATE
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Curriculum Textbooks',
    publisher: 'Fountain Publishers Uganda',
    total_copies: 20,
    available_copies: 20,
    shelf_location: 'Shelf C-1',
  });

  // Calculate Books metrics
  const totalBooksCount = libraryBooks.reduce((sum, b) => sum + (b.total_copies || b.number_of_copies || 0), 0);
  const availableCopiesCount = libraryBooks.reduce((sum, b) => sum + (b.available_copies || 0), 0);
  const issuedCopiesCount = libraryBooks.reduce((sum, b) => sum + (b.issued_copies || 0), 0);
  const damagedCopiesCount = libraryBooks.reduce((sum, b) => sum + (b.damaged_copies || 0), 0);

  // Filtered Books according to Drawer selection: Available, Issued, Damaged, ALL
  const filteredBooks = libraryBooks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(bookSearchQuery.toLowerCase())) ||
      (b.book_code && b.book_code.toLowerCase().includes(bookSearchQuery.toLowerCase()));

    const matchesCat = bookCategoryFilter === 'ALL' || b.category === bookCategoryFilter;

    let matchesStatus = true;
    if (bookStatusFilter === 'Available') {
      matchesStatus = (b.available_copies || 0) > 0;
    } else if (bookStatusFilter === 'Issued') {
      matchesStatus = (b.issued_copies || 0) > 0;
    } else if (bookStatusFilter === 'Damaged') {
      matchesStatus = (b.damaged_copies || 0) > 0;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Unique categories for books
  const bookCategories = Array.from(new Set(libraryBooks.map((b) => b.category))).filter(Boolean);

  // Filtered Issues for Borrowers Drawer: All, Overdues, Returned
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredIssues = libraryIssues.filter((iss) => {
    const isOverdue = iss.status !== 'Returned' && iss.expected_return_date < todayStr;
    const matchesStatus =
      issueStatusFilter === 'ALL'
        ? true
        : issueStatusFilter === 'Overdue'
        ? isOverdue
        : issueStatusFilter === 'Returned'
        ? iss.status === 'Returned'
        : iss.status === 'Currently issued' && !isOverdue;

    const matchesSearch =
      iss.person_name.toLowerCase().includes(issueSearchQuery.toLowerCase()) ||
      iss.identifier.toLowerCase().includes(issueSearchQuery.toLowerCase()) ||
      iss.issue_code.toLowerCase().includes(issueSearchQuery.toLowerCase()) ||
      iss.items.some((item) => item.book_title.toLowerCase().includes(issueSearchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Group borrowers to identify people issued to books
  const borrowersMap = new Map<
    string,
    {
      person_id: string;
      person_type: 'Student' | 'Teacher' | 'Staff';
      person_name: string;
      identifier: string;
      issues: LibraryIssueTransaction[];
      activeLoans: number;
      hasOverdue: boolean;
    }
  >();

  libraryIssues.forEach((iss) => {
    const key = `${iss.person_type}-${iss.person_id}`;
    const isOverdue = iss.status !== 'Returned' && iss.expected_return_date < todayStr;
    const activeCount = iss.items.filter((i) => i.status !== 'Returned').length;

    if (!borrowersMap.has(key)) {
      borrowersMap.set(key, {
        person_id: iss.person_id,
        person_type: iss.person_type,
        person_name: iss.person_name,
        identifier: iss.identifier,
        issues: [iss],
        activeLoans: iss.status !== 'Returned' ? activeCount : 0,
        hasOverdue: isOverdue,
      });
    } else {
      const entry = borrowersMap.get(key)!;
      entry.issues.push(iss);
      if (iss.status !== 'Returned') {
        entry.activeLoans += activeCount;
      }
      if (isOverdue) {
        entry.hasOverdue = true;
      }
    }
  });

  const borrowerList = Array.from(borrowersMap.values()).filter((b) => {
    const matchesSearch =
      b.person_name.toLowerCase().includes(issueSearchQuery.toLowerCase()) ||
      b.identifier.toLowerCase().includes(issueSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (issueStatusFilter === 'Overdue') {
      return b.hasOverdue;
    } else if (issueStatusFilter === 'Returned') {
      return b.activeLoans === 0;
    } else if (issueStatusFilter === 'Currently issued') {
      return b.activeLoans > 0;
    }
    return true;
  });

  // Open Issue Modal for a specific borrower without having to register afresh
  const handleOpenIssueForPerson = (borrower: {
    person_id: string;
    person_type: 'Student' | 'Teacher' | 'Staff';
    person_name: string;
  }) => {
    setBorrowerType(borrower.person_type);
    setSelectedPersonId(borrower.person_id);
    setSelectedBookItems([]);
    setBookSearchForIssue('');
    setIsIssueModalOpen(true);
  };

  // Add/Remove book from multi-book issue cart
  const handleToggleBookInCart = (bk: LibraryBook) => {
    if (selectedBookItems.some((item) => item.book_id === bk.id)) {
      setSelectedBookItems((prev) => prev.filter((item) => item.book_id !== bk.id));
    } else {
      setSelectedBookItems((prev) => [
        ...prev,
        {
          book_id: bk.id,
          book_title: bk.title,
          book_code: bk.book_code || bk.isbn || 'BK-' + Math.floor(1000 + Math.random() * 9000),
          copies_issued: 1,
        },
      ]);
    }
  };

  const handleUpdateCopiesInCart = (bookId: string, count: number) => {
    setSelectedBookItems((prev) =>
      prev.map((item) =>
        item.book_id === bookId ? { ...item, copies_issued: Math.max(1, count) } : item
      )
    );
  };

  // Execute issue transaction
  const handleSaveIssueTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) {
      alert('Please select a student or teacher from the system.');
      return;
    }
    if (selectedBookItems.length === 0) {
      alert('Please select at least one book to issue.');
      return;
    }

    let personName = '';
    let identifier = '';
    let classOrDept = '';

    if (borrowerType === 'Student') {
      const st = students.find((s) => s.id === selectedPersonId);
      if (!st) {
        alert('Student not found.');
        return;
      }
      personName = `${st.first_name} ${st.last_name}`;
      identifier = st.admission_number;
      classOrDept = st.class_name;
    } else {
      const tf = staff.find((t) => t.id === selectedPersonId);
      if (!tf) {
        alert('Staff member not found.');
        return;
      }
      personName = tf.full_name;
      identifier = tf.staff_id;
      classOrDept = tf.department || tf.designation;
    }

    const nextCode = 'ISS-2026-' + Math.floor(1000 + Math.random() * 9000);

    await issueBooksTransaction({
      issue_code: nextCode,
      person_type: borrowerType,
      person_id: selectedPersonId,
      person_name: personName,
      identifier,
      class_or_department: classOrDept,
      date_issued: dateIssued,
      expected_return_date: expectedReturnDate,
      status: 'Currently issued',
      items: selectedBookItems.map((item) => ({
        book_id: item.book_id,
        book_title: item.book_title,
        book_code: item.book_code,
        copies_issued: item.copies_issued,
        status: 'Issued',
      })),
      issued_by: 'School Librarian',
    });

    setIsIssueModalOpen(false);
    setSelectedBookItems([]);
    setBookSearchForIssue('');
  };

  // Add Book Cataloging handler
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.author) {
      alert('Please enter book title and author');
      return;
    }

    await addLibraryBook({
      ...bookFormData,
      book_code: 'BK-' + Math.floor(1000 + Math.random() * 9000),
      number_of_copies: Number(bookFormData.total_copies),
      total_copies: Number(bookFormData.total_copies),
      available_copies: Number(bookFormData.available_copies),
      issued_copies: 0,
      damaged_copies: 0,
      status: 'Available',
    });

    setIsAddBookModalOpen(false);
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Curriculum Textbooks',
      publisher: 'Fountain Publishers Uganda',
      total_copies: 20,
      available_copies: 20,
      shelf_location: 'Shelf C-1',
    });
  };

  // CSV EXPORT FUNCTION
  const handleExportCSV = () => {
    if (mainTab === 'books') {
      const headers = ['Book Code', 'Title', 'Author', 'Category', 'Shelf Location', 'Total Copies', 'Available', 'Issued', 'Status'];
      const rows = filteredBooks.map((b) => [
        b.book_code || '',
        b.title,
        b.author,
        b.category || '',
        b.shelf_location || '',
        `${b.total_copies || b.number_of_copies || 0}`,
        `${b.available_copies || 0}`,
        `${b.issued_copies || 0}`,
        b.status || 'Available',
      ]);
      downloadCSV(`Library_Books_Catalog_${bookStatusFilter}_${new Date().toISOString().split('T')[0]}`, headers, rows);
      showToast(`Exported ${filteredBooks.length} books to CSV!`, 'success');
    } else {
      const headers = ['Issue Code', 'Borrower Name', 'Borrower Type', 'ID / Admission', 'Class/Dept', 'Date Issued', 'Expected Return', 'Status', 'Books Issued'];
      const rows = filteredIssues.map((iss) => [
        iss.issue_code,
        iss.person_name,
        iss.person_type,
        iss.identifier,
        iss.class_or_department || '',
        iss.date_issued,
        iss.expected_return_date,
        iss.status,
        iss.items.map((i) => `${i.book_title} (x${i.copies_issued})`).join('; '),
      ]);
      downloadCSV(`Library_Circulation_Ledger_${issueStatusFilter}_${new Date().toISOString().split('T')[0]}`, headers, rows);
      showToast(`Exported ${filteredIssues.length} circulation records to CSV!`, 'success');
    }
  };

  // PDF / PRINT ACTION
  const handlePrint = () => {
    printContent('printable-library-register', `Library_${mainTab === 'books' ? 'Books_Catalog' : 'Circulation_Register'}`);
    showToast(`Opening print dialog for Library ${mainTab === 'books' ? 'Books Catalog' : 'Circulation Register'}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            School Library & Resource Centre
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Book Stock: {totalBooksCount} copies • Available: {availableCopiesCount} • On Loan: {issuedCopiesCount} • Damaged: {damagedCopiesCount}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print / PDF Option */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {/* Export CSV Option */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Export filtered data to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Issue / Lend Book Button */}
          <button
            onClick={() => {
              setSelectedPersonId(students[0]?.id || '');
              setBorrowerType('Student');
              setSelectedBookItems([]);
              setIsIssueModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Issue / Lend Book</span>
          </button>

          {/* Add Book Button */}
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catalog New Book</span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: Books Catalog vs Borrowers Issued to Books */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold print:hidden">
        <button
          onClick={() => setMainTab('books')}
          className={`pb-2.5 px-3.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            mainTab === 'books'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Book className="w-4 h-4" />
          <span>Library Books Catalog ({libraryBooks.length})</span>
        </button>

        <button
          onClick={() => setMainTab('borrowers')}
          className={`pb-2.5 px-3.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            mainTab === 'borrowers'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>People Issued Books ({borrowersMap.size} Borrowers • {libraryIssues.length} Loans)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: BOOKS CATALOG (List format + Drawer of Available / Issued / Damaged) */}
      {/* ============================================================== */}
      {mainTab === 'books' && (
        <div className="space-y-4">
          {/* Books Drawer / Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            {/* Status Selection Drawer: Available, Issued, Damaged, ALL */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setBookStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    bookStatusFilter === 'ALL'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Books ({libraryBooks.length})
                </button>
                <button
                  onClick={() => setBookStatusFilter('Available')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    bookStatusFilter === 'Available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Available ({libraryBooks.filter((b) => (b.available_copies || 0) > 0).length})
                </button>
                <button
                  onClick={() => setBookStatusFilter('Issued')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    bookStatusFilter === 'Issued'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Currently Issued ({libraryBooks.filter((b) => (b.issued_copies || 0) > 0).length})
                </button>
                <button
                  onClick={() => setBookStatusFilter('Damaged')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    bookStatusFilter === 'Damaged'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Damaged / Lost ({libraryBooks.filter((b) => (b.damaged_copies || 0) > 0).length})
                </button>
              </div>

              {/* View switch: List vs Grid */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setBookDisplayMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    bookDisplayMode === 'list'
                      ? 'bg-white dark:bg-slate-800 text-blue-700 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="List format"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBookDisplayMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    bookDisplayMode === 'grid'
                      ? 'bg-white dark:bg-slate-800 text-blue-700 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Card grid format"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search books by title, author, ISBN, accession code..."
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <select
                value={bookCategoryFilter}
                onChange={(e) => setBookCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                {bookCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIST FORMAT TABLE */}
          {bookDisplayMode === 'list' ? (
            <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Book Title & Details</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-center">Available / Total</th>
                    <th className="px-4 py-3 text-center">Issued</th>
                    <th className="px-4 py-3 text-center">Damaged</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No books found in library matching selection "{bookStatusFilter}".
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{bk.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Acc: {bk.book_code || bk.id} {bk.isbn ? `• ISBN: ${bk.isbn}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{bk.author}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {bk.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{bk.shelf_location || 'Main Shelf'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {bk.available_copies}
                          </span>
                          <span className="text-slate-400"> / {bk.total_copies || bk.number_of_copies}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-amber-600 font-mono">
                          {bk.issued_copies || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-rose-500 font-mono">
                          {bk.damaged_copies || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedBookItems([
                                {
                                  book_id: bk.id,
                                  book_title: bk.title,
                                  book_code: bk.book_code || 'BK-CODE',
                                  copies_issued: 1,
                                },
                              ]);
                              setSelectedPersonId(students[0]?.id || '');
                              setBorrowerType('Student');
                              setIsIssueModalOpen(true);
                            }}
                            disabled={(bk.available_copies || 0) <= 0}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                              (bk.available_copies || 0) > 0
                                ? 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Issue
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD GRID FORMAT */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((bk) => (
                <div
                  key={bk.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {bk.category}
                      </span>
                      <span className="font-mono text-slate-400">{bk.shelf_location}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-tight">
                      {bk.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Author: {bk.author}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Code: {bk.book_code || bk.id} {bk.isbn ? `• ISBN: ${bk.isbn}` : ''}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Available: <strong className="text-emerald-600 dark:text-emerald-400">{bk.available_copies}</strong> / {bk.total_copies || bk.number_of_copies}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBookItems([
                          {
                            book_id: bk.id,
                            book_title: bk.title,
                            book_code: bk.book_code || 'BK-CODE',
                            copies_issued: 1,
                          },
                        ]);
                        setSelectedPersonId(students[0]?.id || '');
                        setBorrowerType('Student');
                        setIsIssueModalOpen(true);
                      }}
                      disabled={(bk.available_copies || 0) <= 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Issue / Lend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: PEOPLE ISSUED BOOKS (Drawer: All, Overdues, Returned) */}
      {/* ============================================================== */}
      {mainTab === 'borrowers' && (
        <div className="space-y-4">
          {/* Borrowers Selection Drawer: All, Overdues, Returned */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setIssueStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    issueStatusFilter === 'ALL'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Borrowers ({borrowersMap.size})
                </button>
                <button
                  onClick={() => setIssueStatusFilter('Currently issued')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    issueStatusFilter === 'Currently issued'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Active Loans ({Array.from(borrowersMap.values()).filter((b) => b.activeLoans > 0).length})
                </button>
                <button
                  onClick={() => setIssueStatusFilter('Overdue')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    issueStatusFilter === 'Overdue'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Overdues ({Array.from(borrowersMap.values()).filter((b) => b.hasOverdue).length})
                </button>
                <button
                  onClick={() => setIssueStatusFilter('Returned')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    issueStatusFilter === 'Returned'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Cleared / Returned ({Array.from(borrowersMap.values()).filter((b) => b.activeLoans === 0).length})
                </button>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search borrower by name, ID, class..."
                  value={issueSearchQuery}
                  onChange={(e) => setIssueSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Borrowers Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Borrower (Student / Teacher)</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">ID / Admission</th>
                  <th className="px-4 py-3 text-center">Active Loans</th>
                  <th className="px-4 py-3 text-center">Total History</th>
                  <th className="px-4 py-3">Discipline / Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {borrowerList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No borrowers found under "{issueStatusFilter}" category.
                    </td>
                  </tr>
                ) : (
                  borrowerList.map((b) => (
                    <tr key={`${b.person_type}-${b.person_id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedBorrowerDetails(b)}
                          className="font-bold text-blue-700 hover:text-blue-800 dark:text-blue-400 text-left cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{b.person_name}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.person_type === 'Student'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {b.person_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{b.identifier}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            b.activeLoans > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {b.activeLoans} books
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">
                        {b.issues.length} transaction(s)
                      </td>
                      <td className="px-4 py-3">
                        {b.hasOverdue ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue Books
                          </span>
                        ) : b.activeLoans > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Active Borrower
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" />
                            Cleared
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Issue to this person without registering afresh! */}
                          <button
                            onClick={() => handleOpenIssueForPerson(b)}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-[10px] transition cursor-pointer"
                            title="Register new loan for this borrower"
                          >
                            + Issue Book
                          </button>

                          {/* Full dossier / details */}
                          <button
                            onClick={() => setSelectedBorrowerDetails(b)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[10px] transition cursor-pointer"
                          >
                            Details & History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BORROWER FULL DETAILS & COMPLETE ISSUE HISTORY MODAL */}
      {/* ============================================================== */}
      {selectedBorrowerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-bold">
                  {selectedBorrowerDetails.person_type === 'Student' ? (
                    <User className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{selectedBorrowerDetails.person_name}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedBorrowerDetails.person_type} • ID: <span className="font-mono">{selectedBorrowerDetails.identifier}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenIssueForPerson(selectedBorrowerDetails);
                    setSelectedBorrowerDetails(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  + Issue Another Book
                </button>
                <button
                  onClick={() => setSelectedBorrowerDetails(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Complete Borrowing History & Active Loans
                </h4>
                <span className="text-slate-400 font-medium">
                  {selectedBorrowerDetails.issues.length} transaction records
                </span>
              </div>

              {selectedBorrowerDetails.issues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {iss.issue_code}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        Issued: {iss.date_issued} • Due: {iss.expected_return_date}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        iss.status === 'Returned'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : iss.expected_return_date < todayStr
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {iss.status}
                    </span>
                  </div>

                  {/* Books inside this transaction */}
                  <div className="space-y-2">
                    {iss.items.map((item) => (
                      <div
                        key={item.book_id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white block">
                            {item.book_title}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Acc: {item.book_code} • Copies: {item.copies_issued}
                          </span>
                        </div>

                        {item.status === 'Returned' ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Returned on {item.return_date || iss.actual_return_date || 'Date logged'}
                          </span>
                        ) : (
                          /* Clear / Return action */
                          <button
                            onClick={async () => {
                              await returnLibraryBookItem(iss.id, item.book_id);
                              // Refresh modal view
                              setSelectedBorrowerDetails((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  issues: prev.issues.map((i) =>
                                    i.id === iss.id
                                      ? {
                                          ...i,
                                          items: i.items.map((it) =>
                                            it.book_id === item.book_id
                                              ? { ...it, status: 'Returned', return_date: todayStr }
                                              : it
                                          ),
                                        }
                                      : i
                                  ),
                                };
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear / Return Book</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ISSUE / LEND MODAL (Select student/teacher, multi-books, copies) */}
      {/* ============================================================== */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Issue / Lend Books to Student or Teacher
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssueTransaction} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Borrower Type Selection */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Borrower Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBorrowerType('Student');
                      setSelectedPersonId(students[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      borrowerType === 'Student'
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Student / Learner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBorrowerType('Teacher');
                      setSelectedPersonId(staff[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      borrowerType === 'Teacher'
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Teacher / Staff Member</span>
                  </button>
                </div>
              </div>

              {/* Select Person from System */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                  Select {borrowerType === 'Student' ? 'Student' : 'Staff Member'} *
                </label>
                <select
                  value={selectedPersonId}
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {borrowerType === 'Student' ? (
                    students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number}) — {s.class_name} {s.stream_name || ''}
                      </option>
                    ))
                  ) : (
                    staff.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.staff_id}) — {t.designation} ({t.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Date Issued *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">
                    Expected Return Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              {/* Type to select book from stock */}
              <div className="space-y-2">
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                  Type to select books from stock *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search books by title, subject or author..."
                    value={bookSearchForIssue}
                    onChange={(e) => setBookSearchForIssue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                {/* Stock Selector List */}
                <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {libraryBooks
                    .filter(
                      (bk) =>
                        (bk.available_copies || 0) > 0 &&
                        (bk.title.toLowerCase().includes(bookSearchForIssue.toLowerCase()) ||
                          bk.author.toLowerCase().includes(bookSearchForIssue.toLowerCase()) ||
                          (bk.category && bk.category.toLowerCase().includes(bookSearchForIssue.toLowerCase())))
                    )
                    .map((bk) => {
                      const isSelected = selectedBookItems.some((item) => item.book_id === bk.id);
                      return (
                        <div
                          key={bk.id}
                          onClick={() => handleToggleBookInCart(bk)}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <strong className="block text-xs">{bk.title}</strong>
                            <span className="text-[10px] text-slate-400">
                              Author: {bk.author} • In Stock: {bk.available_copies} copies
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? 'Selected' : '+ Select'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Selected Books Provision (Multiple books & number of copies) */}
              {selectedBookItems.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                    Selected Books to Issue ({selectedBookItems.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedBookItems.map((item) => (
                      <div
                        key={item.book_id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900"
                      >
                        <div className="flex-1 mr-2">
                          <strong className="block text-xs text-slate-900 dark:text-white truncate">
                            {item.book_title}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">{item.book_code}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-500 font-bold">Copies:</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.copies_issued}
                            onChange={(e) => handleUpdateCopiesInCart(item.book_id, Number(e.target.value))}
                            className="w-14 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBookItems((prev) => prev.filter((i) => i.book_id !== item.book_id))
                            }
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit / Cancel */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedBookItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 cursor-pointer"
                >
                  Confirm Issue & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD NEW BOOK MODAL */}
      {/* ============================================================== */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Book className="w-4 h-4 text-blue-600" />
                Add Book to School Library Stock
              </h3>
              <button onClick={() => setIsAddBookModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveBook} className="p-4 sm:p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  placeholder="e.g. MK Primary English Book 7"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={bookFormData.author}
                  onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                  placeholder="e.g. Dr. J. Ssenyonga"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">ISBN</label>
                  <input
                    type="text"
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    placeholder="978-9970-..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={bookFormData.category}
                    onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={bookFormData.total_copies}
                    onChange={(e) =>
                      setBookFormData({
                        ...bookFormData,
                        total_copies: Number(e.target.value),
                        available_copies: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={bookFormData.shelf_location}
                    onChange={(e) => setBookFormData({ ...bookFormData, shelf_location: e.target.value })}
                    placeholder="Shelf A-2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Printable Library Register */}
      <div className="hidden">
        <div id="printable-library-register" className="p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.school_name}</h1>
            <p className="text-sm">{schoolProfile.school_address} • Tel: {schoolProfile.phone_contact}</p>
            <h2 className="text-lg font-bold mt-2 uppercase">
              {mainTab === 'books' ? 'Library Book Stock & Inventory Catalog' : 'Circulation & Issued Books Register'}
            </h2>
            <p className="text-xs text-slate-500 font-mono">Date Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          {mainTab === 'books' ? (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="py-2">Code</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Author</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Shelf</th>
                  <th className="py-2 text-center">Total</th>
                  <th className="py-2 text-center">Available</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="border-b border-slate-200">
                    <td className="py-2 font-mono">{b.book_code}</td>
                    <td className="py-2 font-bold">{b.title}</td>
                    <td className="py-2">{b.author}</td>
                    <td className="py-2">{b.category}</td>
                    <td className="py-2">{b.shelf_location}</td>
                    <td className="py-2 text-center">{b.total_copies || b.number_of_copies}</td>
                    <td className="py-2 text-center">{b.available_copies}</td>
                    <td className="py-2 font-bold">{b.status || 'Available'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="py-2">Issue Code</th>
                  <th className="py-2">Borrower Name</th>
                  <th className="py-2">Type & ID</th>
                  <th className="py-2">Books Issued</th>
                  <th className="py-2">Date Issued</th>
                  <th className="py-2">Due Return</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((iss) => (
                  <tr key={iss.id} className="border-b border-slate-200">
                    <td className="py-2 font-mono">{iss.issue_code}</td>
                    <td className="py-2 font-bold">{iss.person_name}</td>
                    <td className="py-2">{iss.person_type} ({iss.identifier})</td>
                    <td className="py-2">{iss.items.map((i) => `${i.book_title} (x${i.copies_issued})`).join(', ')}</td>
                    <td className="py-2">{iss.date_issued}</td>
                    <td className="py-2">{iss.expected_return_date}</td>
                    <td className="py-2 font-bold">{iss.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
