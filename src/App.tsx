/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  getDocFromServer,
  doc,
  addDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { 
  Search, 
  Menu, 
  X, 
  ArrowRight, 
  ArrowRightLeft, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  BookOpen,
  Map as MapIcon,
  FileText,
  Building2,
  Home,
  Music,
  Users,
  Mail,
  Share2,
  Bookmark,
  Filter,
  History,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  ChevronDown,
  Heart,
  Lock,
  Play,
  Camera,
  Edit3,
  Mic,
  User as UserIcon
} from 'lucide-react';

// --- Firebase Helpers ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const FirebaseImageUploader = ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `archive/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      // Save metadata to Firestore
      await addDoc(collection(db, 'items'), {
        title: file.name,
        description: "Uploaded via Archive App",
        imageUrl: url,
        date: new Date().toISOString(),
        topics: ["Uploaded"]
      });

      onUploadSuccess(url);
      alert("Image saved to Firebase successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-surface-container-high rounded-lg border border-secondary/20">
      <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Save to Archive</h3>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Share2 className="text-on-surface/40 mb-2" />
          <p className="text-xs text-on-surface/60">{uploading ? "Uploading..." : "Click to upload image"}</p>
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*" />
      </label>
    </div>
  );
};

// --- Components ---

const Navbar = ({ currentScreen, setScreen, user, login, logout }: { 
  currentScreen: string, 
  setScreen: (s: string) => void,
  user: User | null,
  login: () => void,
  logout: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuData = [
    {
      id: 'collections',
      label: 'Collections',
      type: 'mega',
      items: [
        { title: 'NYC Mayors & Leadership', description: "The personal papers and official records of the City's transformative leadership, from La Guardia to Dinkins.", icon: <Building2 size={16} />, image: 'https://res.cloudinary.com/dykuw1uvk/image/upload/v1776775486/The_Rise_of_a_Reformer_-_La_Guardia_Radio_Programs_ie8gx4.webp' },
        { title: 'Government & Policy', description: 'Exploring the machinery of municipal governance, City Council proceedings, and the evolution of public policy.', icon: <Users size={16} />, image: 'https://res.cloudinary.com/dykuw1uvk/image/upload/v1776775992/The-Council-of-the-City-of-New-York_v5gtmw.webp' },
        { title: 'Culture & Society', description: "Documenting the movements, arts, and diverse social identities that have defined NYC's vibrant civic fabric.", icon: <History size={16} />, image: 'https://res.cloudinary.com/dykuw1uvk/image/upload/v1776775992/The-LGBTQ-Collection_xtv3gu.webp' },
        { title: 'Local History & Business', description: 'A deep look into neighborhood archives and iconic businesses, including the Steinway & Sons collection.', icon: <Home size={16} />, image: 'https://res.cloudinary.com/dykuw1uvk/image/upload/v1776775992/Steinway-_-Sons_w1escv.webp' },
      ]
    },
    {
      id: 'exhibits',
      label: 'Exhibits & Education',
      type: 'mega',
      columns: [
        {
          title: 'LGBTQ+ History',
          items: [
            'An LGBTQ+ New York Worth Fighting For',
            'The Battle for Intro. 2',
            'A Seat At The Table',
            'Children Of The Rainbow Exhibit',
            'Next Stop Queer New York',
            'Shades of the Rainbow',
            'Rainbow LaGuardia'
          ]
        },
        {
          title: 'Calendars & Series',
          items: [
            '2026 Gems of Queens',
            'Gotham Transformed',
            '9/11 Collections',
            'Portraits of an Epicenter'
          ]
        },
        {
          title: 'Scholarship & Leadership',
          items: [
            'Student Philosophy',
            'Migration, Homes and Borders',
            'Women in NYC Politics',
            'Student Booklet: District 26'
          ]
        }
      ]
    },
    { id: 'lgbtq', label: 'LGBTQIA+ Hub', type: 'link' },
    {
      id: 'research',
      label: 'Research & Learning',
      type: 'mega',
      items: [
        { title: 'Search Database', description: 'Explore 2.5 million digitized documents and 100k photographs documenting NYC history.', icon: <Search size={16} /> },
        { title: 'Archival Curricula', description: 'Access document-based lessons (DBQs) and historical modules designed for the classroom.', icon: <FileText size={16} /> },
        { title: 'Historical Calendars', description: 'Browse our award-winning annual calendars documenting the long history of struggle and progress.', icon: <Calendar size={16} /> },
        { title: 'Media & Reproductions', description: 'Request high-quality archival reproductions or licensing for media and research.', icon: <Music size={16} /> },
      ]
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Top Utility Bar */}
      <div className={cn(
        "w-full bg-surface-container-low/80 backdrop-blur-md border-b border-white/5 px-8 flex justify-between items-center transition-all duration-500 overflow-hidden",
        isScrolled ? "-translate-y-full opacity-0 h-0 py-0" : "translate-y-0 opacity-100 h-10 py-2"
      )}>
        <div className="flex items-center gap-4">
          <Facebook size={12} className="text-on-surface/30 hover:text-secondary cursor-pointer transition-colors" />
          <Twitter size={12} className="text-on-surface/30 hover:text-secondary cursor-pointer transition-colors" />
          <Instagram size={12} className="text-on-surface/30 hover:text-secondary cursor-pointer transition-colors" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 border-r border-white/10 pr-6">
            <button onClick={() => setScreen('about')} className="text-[9px] uppercase tracking-[0.2em] text-on-surface/50 hover:text-secondary transition-colors">About</button>
            <button onClick={() => setScreen('contact')} className="text-[9px] uppercase tracking-[0.2em] text-on-surface/50 hover:text-secondary transition-colors">Contact</button>
          </div>
          <button 
            onClick={() => setScreen('donate')}
            className="text-[9px] uppercase tracking-[0.2em] font-bold text-secondary hover:text-white transition-colors"
          >
            Donate
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav 
        className={cn(
          "w-full transition-all duration-500 px-8 flex justify-between items-center border-b",
          isScrolled 
            ? "bg-background/95 backdrop-blur-xl border-white/10 py-3 shadow-2xl" 
            : "bg-background/40 backdrop-blur-sm border-transparent py-5"
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        {/* Left: Compact Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setScreen('home'); setIsMobileMenuOpen(false); }}
        >
          <div className="w-8 h-8 flex items-center justify-center rotate-2 group-hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776111669/LAGCC_logo_2023_kgdbwj.webp" 
              alt="LAGCC Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-serif tracking-tight text-on-surface leading-none mb-[-3px]">
              La Guardia & Wagner
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-sans font-bold mt-1">
              Archive
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Right: Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-8">
            {menuData.map((menu) => (
              <div 
                key={menu.id}
                className="relative"
                onMouseEnter={() => menu.type === 'mega' ? setActiveMenu(menu.id) : setActiveMenu(null)}
              >
                <button 
                  onClick={() => {
                    if (menu.type === 'link') setScreen(menu.id);
                    else if (menu.id === 'collections') setScreen('collections');
                    else if (menu.id === 'exhibits') setScreen('education');
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-sans transition-all py-2",
                    activeMenu === menu.id || currentScreen === menu.id ? "text-secondary" : "text-on-surface/60 hover:text-on-surface"
                  )}
                >
                  {menu.label}
                  {menu.type === 'mega' && <ChevronDown size={10} className={cn("transition-transform duration-300", activeMenu === menu.id && "rotate-180")} />}
                  {(currentScreen === menu.id || (menu.id === 'collections' && currentScreen === 'collections')) && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-secondary shadow-[0_0_8px_rgba(255,193,7,0.5)]"
                    />
                  )}
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {activeMenu === menu.id && menu.type === 'mega' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 pt-4 w-screen max-w-[800px]"
                    >
                      <div className="bg-surface-container-high border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
                        {menu.id === 'collections' && (
                          <div className="grid grid-cols-2 gap-6">
                            {menu.items?.map((item, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => { 
                                  if (item.title === 'NYC Mayors & Leadership') setScreen('mayors');
                                  else setScreen('collections'); 
                                  setActiveMenu(null); 
                                }}
                                className="group/item flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 group-hover/item:scale-110 transition-all duration-500" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                                <div>
                                  <h4 className="text-sm font-serif mb-1 group-hover/item:text-secondary transition-colors">{item.title}</h4>
                                  <p className="text-[10px] text-on-surface/50 leading-relaxed">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {menu.id === 'exhibits' && (
                          <div className="grid grid-cols-3 gap-12">
                            {menu.columns?.map((col, idx) => (
                              <div key={idx}>
                                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary mb-6">{col.title}</h4>
                                <ul className="space-y-4">
                                  {col.items.map((item, i) => (
                                    <li 
                                      key={i} 
                                      onClick={() => { setScreen('education'); setActiveMenu(null); }}
                                      className="text-xs text-on-surface/60 hover:text-on-surface transition-colors cursor-pointer flex items-center gap-2 group/li"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-secondary/30 group-hover/li:bg-secondary transition-colors" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {menu.id === 'research' && (
                          <div className="grid grid-cols-2 gap-4">
                            {menu.items?.map((item, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  if (item.title === 'Historical Calendars') setScreen('calendars');
                                  if (item.title === 'Archival Curricula') setScreen('education');
                                  if (item.title === 'Media & Reproductions') setScreen('media');
                                  setActiveMenu(null);
                                }}
                                className="p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group/item border border-transparent hover:border-white/5 flex items-center gap-4"
                              >
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0 group-hover/item:scale-110 transition-transform">
                                  {item.icon}
                                </div>
                                <div>
                                  <h4 className="text-sm font-serif mb-1 group-hover/item:text-secondary transition-colors">{item.title}</h4>
                                  <p className="text-[10px] text-on-surface/50 leading-relaxed">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Search Icon */}
          <button 
            onClick={() => setScreen('search')}
            className="p-2 text-on-surface/60 hover:text-secondary transition-colors"
          >
            <Search size={18} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-on-surface hover:bg-white/5 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-background xl:hidden pt-24 px-8 overflow-y-auto"
          >
            <div className="space-y-8 pb-12">
              {menuData.map((menu) => (
                <div key={menu.id} className="space-y-4">
                  <button 
                    onClick={() => {
                      if (menu.type === 'link') { setScreen(menu.id); setIsMobileMenuOpen(false); }
                      else if (menu.id === 'collections') { setScreen('collections'); setIsMobileMenuOpen(false); }
                      else if (menu.id === 'exhibits') { setScreen('education'); setIsMobileMenuOpen(false); }
                    }}
                    className="text-2xl font-serif italic text-on-surface flex items-center justify-between w-full"
                  >
                    {menu.label}
                    {menu.type === 'mega' && <ChevronRight size={20} className="text-secondary" />}
                  </button>
                  {menu.type === 'mega' && (
                    <div className="grid grid-cols-1 gap-4 pl-4 border-l border-white/10">
                      {menu.items?.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-on-surface/80">{item.title}</span>
                          <span className="text-[10px] text-on-surface/40">{item.description}</span>
                        </div>
                      ))}
                      {menu.columns?.map((col, idx) => (
                        <div key={idx} className="space-y-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">{col.title}</span>
                          <ul className="space-y-1">
                            {col.items.slice(0, 3).map((item, i) => (
                              <li key={i} className="text-xs text-on-surface/60">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-8 border-t border-white/10 space-y-4">
                <button 
                  onClick={() => { setScreen('about'); setIsMobileMenuOpen(false); }}
                  className="text-lg font-serif italic text-on-surface/60"
                >
                  About Us
                </button>
                <button 
                  onClick={() => { setScreen('contact'); setIsMobileMenuOpen(false); }}
                  className="text-lg font-serif italic text-on-surface/60"
                >
                  Contact Us
                </button>
                <div className="flex gap-4">
                  <Facebook size={20} className="text-on-surface/40" />
                  <Twitter size={20} className="text-on-surface/40" />
                  <Instagram size={20} className="text-on-surface/40" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer: React.FC<{ setScreen: (s: string) => void }> = ({ setScreen }) => {
  return (
    <footer className="bg-surface-container-low border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Archival Services */}
          <div>
            <h5 className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-6">Archival Services</h5>
            <ul className="space-y-4">
              <li><button onClick={() => setScreen('media')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Media & Reproductions</button></li>
              <li><a href="#" className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light">Reproduction Request Forms</a></li>
              <li><a href="#" className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light">User Satisfaction Survey</a></li>
              <li><a href="#" className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light">Library Resources</a></li>
            </ul>
          </div>

          {/* Special Collections */}
          <div>
            <h5 className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-6">Special Collections</h5>
            <ul className="space-y-4">
              <li><button onClick={() => setScreen('mayors')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">NYC Mayors & Leadership</button></li>
              <li><button onClick={() => setScreen('lgbtq')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">LGBTQ+ History Consortium</button></li>
              <li><button onClick={() => setScreen('calendars')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Historical Calendars</button></li>
              <li><button onClick={() => setScreen('collections')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Queens Local History</button></li>
            </ul>
          </div>

          {/* Academic & Education */}
          <div>
            <h5 className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-6">Academic & Education</h5>
            <ul className="space-y-4">
              <li><button onClick={() => setScreen('education')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Education Programs</button></li>
              <li><button onClick={() => setScreen('about')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">About the Archives</button></li>
              <li><button onClick={() => setScreen('contact')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Contact & Research Inquiry</button></li>
              <li><button onClick={() => setScreen('donate')} className="text-sm text-on-surface/60 hover:text-secondary transition-colors font-light text-left">Support & Donation</button></li>
            </ul>
          </div>

          {/* Follow us */}
          <div>
            <h5 className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-6">Follow us</h5>
            <div className="grid grid-cols-5 gap-3">
              {[
                { icon: <Facebook size={16} />, label: "Facebook" },
                { icon: <span className="text-[8px] font-bold">BSky</span>, label: "Bluesky" },
                { icon: <Twitter size={16} />, label: "Twitter (X)" },
                { icon: <Instagram size={16} />, label: "Instagram" },
                { icon: <Youtube size={16} />, label: "YouTube" },
                { icon: <Play size={16} />, label: "Vimeo" },
                { icon: <Camera size={16} />, label: "Flickr" },
                { icon: <Edit3 size={16} />, label: "Blogger" },
                { icon: <Mic size={16} />, label: "Podbean" },
                { icon: <Mail size={16} />, label: "Email" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href="#" 
                  title={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-on-surface/40 hover:text-secondary hover:border-secondary/20 hover:bg-secondary/5 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Logos & Copyright */}
        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <img 
               src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776800019/CUNY_Logo_a9ommn.png" 
               alt="CUNY" 
               className="h-10 invert brightness-0"
               referrerPolicy="no-referrer"
             />
             <div className="h-8 w-px bg-white/10 hidden md:block"></div>
             <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-on-surface">CUNY</span>
               <span className="text-[7px] uppercase tracking-widest text-on-surface/40">City University of New York</span>
             </div>
             <div className="h-8 w-px bg-white/10 hidden md:block"></div>
             <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-on-surface leading-none">LGBTQIA+ Consortium</span>
               <span className="text-[7px] uppercase tracking-widest text-on-surface/40">CUNY Proud</span>
             </div>
          </div>
          
          <div className="text-center lg:text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface/30 leading-relaxed font-light">
              Copyright © 2026 LaGuardia and Wagner Archives
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Screens ---

const HomeScreen: React.FC<{ setScreen: (s: string) => void, user: User | null, login: () => any }> = ({ setScreen, user, login }) => {
  const [collectionIdx, setCollectionIdx] = useState(0);
  
  const collections = [
    { title: 'NYC Mayors & Leadership', icon: <Building2 />, desc: "The personal papers and official records of the City's transformative leadership, from La Guardia to Dinkins." },
    { title: 'Government & Policy', icon: <FileText />, desc: "Exploring the machinery of municipal governance, City Council proceedings, and the evolution of public policy." },
    { title: 'Culture & Society', icon: <Users />, desc: "Documenting the movements, arts, and diverse social identities that have defined NYC's vibrant civic fabric." },
    { title: 'Local History & Business', icon: <Music />, desc: "A deep look into neighborhood archives and iconic businesses, including the Steinway & Sons collection." }
  ];

  const nextCollection = () => setCollectionIdx((prev) => (prev + 1) % collections.length);
  const prevCollection = () => setCollectionIdx((prev) => (prev - 1 + collections.length) % collections.length);

  const visibleCollections = [
    collections[collectionIdx],
    collections[(collectionIdx + 1) % collections.length],
    collections[(collectionIdx + 2) % collections.length]
  ];
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const qExhibits = query(collection(db, 'exhibits'), limit(3));
    const unsubscribeExhibits = onSnapshot(qExhibits, (snapshot) => {
      setExhibits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'exhibits'));

    const qNews = query(collection(db, 'news'), orderBy('date', 'desc'), limit(2));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'news'));

    return () => {
      unsubscribeExhibits();
      unsubscribeNews();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=""
    >
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-40 grayscale" 
            src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776186231/AERIAL_VIEW_OF_BOTH_LIBERTY_ISLAND_AND_LOWER_MANHATTAN_sidbnx.webp" 
            alt="Vintage NYC Skyline"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="text-secondary text-xs uppercase tracking-[0.3em] font-medium mb-6 block">Established 1982</span>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight text-on-surface">Preserving the History of New York City</h1>
          
          <p className="text-lg md:text-xl text-on-surface/80 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            A chronicle of the people, politics, and social movements that shaped the five boroughs into the global capital of today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setScreen('collections')}
              className="bg-primary px-8 py-4 text-primary-container font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
            >
              Explore Collections
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => setScreen('search')}
              className="border border-outline-variant/30 px-8 py-4 text-on-surface font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Search Archive
            </button>
          </div>
        </div>
      </section>

      {/* Begin Your Research */}
      <section className="bg-surface-container-low py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-12 italic">Begin Your Research</h2>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-background border-b border-outline-variant/50 p-4 transition-all focus-within:border-primary">
              <Search className="text-primary ml-2" size={20} />
              <input 
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-2 px-4 placeholder:text-on-surface-variant/40 outline-none" 
                placeholder="Enter keywords, names, or years (e.g., Fiorello LaGuardia, 1939 World's Fair)" 
                type="text"
                onFocus={() => setScreen('search')}
              />
              <button className="bg-surface-container-high px-6 py-2 text-xs uppercase tracking-widest font-bold text-secondary">Search</button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="text-xs uppercase tracking-tighter text-on-surface-variant/60 py-1">Popular:</span>
            {['Housing Authority', 'Steinway & Sons', 'Council Records'].map(tag => (
              <button key={tag} className="text-xs uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-colors pb-1">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features at the Archives */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-secondary/30"></div>
              <span className="text-secondary text-[10px] uppercase tracking-[0.4em] font-bold whitespace-nowrap">Current Dispatches</span>
              <div className="h-px w-12 bg-secondary/30"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-display italic text-on-surface leading-tight">Features at the Archives</h2>
          </div>
          <button className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:border-primary transition-all font-bold">
            Explore All Features
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              title: "Policing, Pews, and Firehouse Politics",
              description: "How the NYPD, FDNY, and the Catholic Church Have Evolved Since the Gay and Lesbian Rights Era.",
              category: "Special Analysis",
              date: "APR 2026",
              image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776708049/policing_pews_and_firehouse_iqzwzz.jpg"
            },
            {
              title: "Unique New York",
              description: "A NEWSLETTER OF THE LaGUARDIA & WAGNER ARCHIVES",
              category: "Newsletter",
              date: "APR 2026",
              image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776708049/newsletter_mh5b5j.png"
            },
            {
              title: "Living in the Shade",
              description: "The Past, Present and Future of NYCHA Open Space.",
              category: "Special Project",
              date: "APR 2026",
              image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776708049/the_past_present_and_future_jgmejr.png"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative overflow-hidden mb-8 aspect-[4/5] bg-surface-container-low border border-white/5">
                <img 
                  className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 brightness-75 group-hover:brightness-90" 
                  src={feature.image} 
                  alt={feature.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
                  <span className="bg-secondary/10 backdrop-blur-md border border-secondary/20 text-secondary px-3 py-1 text-[9px] uppercase font-bold tracking-widest rounded-full">
                    {feature.category}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-[10px] font-mono text-on-surface/40 uppercase tracking-widest">
                  {feature.date}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-display italic mb-4 group-hover:text-secondary transition-colors line-clamp-2">
                  {feature.title}
                </h3>
                <p className="text-on-surface/50 font-light leading-relaxed mb-8 flex-1 line-clamp-3 italic">
                  "{feature.description}"
                </p>
                <div className="flex items-center gap-3 text-secondary text-[10px] uppercase font-bold tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  View dispatch <ArrowRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Collections */}
      <section className="bg-surface-container-low py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-serif italic mb-4">Core Collections</h2>
              <div className="h-1 w-24 bg-secondary mx-auto md:mx-0"></div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={prevCollection}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-on-surface/60"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextCollection}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-on-surface/60"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleCollections.map((col, i) => (
                <motion.div 
                  key={col.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-surface p-12 hover:bg-surface-container-high transition-all duration-500 group cursor-pointer h-full" 
                  onClick={() => {
                    if (col.title === 'NYC Mayors & Leadership') setScreen('mayors');
                    else setScreen('collections');
                  }}
                >
                  <div className="text-4xl text-primary/40 mb-8 font-light">{col.icon}</div>
                  <h4 className="text-xl font-serif mb-4">{col.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-light mb-8">{col.desc}</p>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-2">
                    Explore <ArrowRight size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Educators */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <img 
            className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-1000" 
            src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/2_hsprf1.jpg" 
            alt="Aural Archive"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="md:w-3/5 bg-surface-container-highest/40 backdrop-blur-xl p-16 border-l-4 border-secondary">
            <span className="text-secondary text-xs uppercase tracking-widest font-bold mb-4 block">For Educators</span>
            <h2 className="text-4xl font-serif italic mb-8">Bringing History to the Classroom</h2>
            <p className="text-lg text-on-surface-variant font-light mb-12 leading-relaxed italic">
              "Excellence in pedagogy through archival discovery. We provide specialized resources for educators, from LGBTQ+ history modules to thematic municipal calendars."
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <Users className="text-secondary" size={24} />
                <div>
                  <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">LGBTQ+ & Civic History</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Documenting the struggle for rights and the historic impact of women in municipal government.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <BookOpen className="text-secondary" size={24} />
                <div>
                  <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">Calendars & Scholarship</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Thematic explorations of NYC boroughs and research-driven student booklets.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setScreen('education')}
              className="mt-12 border-b border-primary text-primary px-0 py-2 text-xs uppercase tracking-[0.2em] font-bold hover:text-primary/80 transition-colors"
            >
              Access Educator Portal
            </button>
          </div>
        </div>
      </section>

      {/* Stay Connected Hub */}
      <section className="bg-background py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <div className="max-w-xl">
              <span className="text-secondary text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">The Digital Network</span>
              <h2 className="text-5xl font-serif italic text-on-surface mb-6">Stay Connected</h2>
              <p className="text-sm text-on-surface/50 font-light leading-relaxed">
                Join our community of historians, educators, and researchers. Subscription ensures you receive the latest archival discoveries and program updates directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Newsletter Card */}
            <div className="lg:col-span-7 bg-surface-container-high p-12 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-secondary/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif italic">Archive Dispatches</h3>
                    <p className="text-[10px] text-on-surface/40 uppercase tracking-widest">Monthly Newsletter</p>
                  </div>
                </div>
                
                <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email address..."
                    className="flex-grow bg-background border border-white/10 px-6 py-4 outline-none focus:border-secondary transition-colors text-sm"
                  />
                  <button className="bg-secondary text-on-secondary-container px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all">
                    Subscribe
                  </button>
                </form>
                <p className="mt-6 text-[10px] text-on-surface/30 italic">
                  * By subscribing, you agree to receive digital communications from LaGuardia and Wagner Archives.
                </p>
              </div>
            </div>

            {/* Social & Contact Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[
                { name: 'Facebook', icon: <Facebook size={20} />, label: 'LaGuardia Archives', color: 'hover:text-[#1877F2]' },
                { name: 'Instagram', icon: <Instagram size={20} />, label: '@LaguardiaArchives', color: 'hover:text-[#E4405F]' },
                { name: 'X / Twitter', icon: <Twitter size={20} />, label: '@LWA_Archives', color: 'hover:text-on-surface' },
                { name: 'YouTube', icon: <Youtube size={20} />, label: 'L&W Archives TV', color: 'hover:text-[#FF0000]' }
              ].map((social) => (
                <a 
                  key={social.name}
                  href="#"
                  className={cn(
                    "bg-surface-container-low border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group/social",
                    social.color
                  )}
                >
                  <div className="text-on-surface/20 group-hover/social:text-inherit transition-colors mb-4">
                    {social.icon}
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold block mb-1 opacity-40 group-hover/social:opacity-100 transition-opacity">
                    {social.name}
                  </span>
                  <span className="text-[10px] font-mono opacity-20 group-hover/social:opacity-60 transition-opacity">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-between items-center gap-8 border-t border-white/5 pt-12">
            <div className="flex gap-12">
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface/30 uppercase tracking-widest">Inquiries</p>
                <a href="mailto:archives@lagcc.cuny.edu" className="text-xs hover:text-secondary transition-colors">archives@lagcc.cuny.edu</a>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface/30 uppercase tracking-widest">Location</p>
                <p className="text-xs">Long Island City, NY 11101</p>
              </div>
            </div>
            <button 
              onClick={() => setScreen('contact')}
              className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] flex items-center gap-2 group/btn"
            >
              [ Full Research Inquiry ] <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const EducationProgramsScreen = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const programs = [
    {
      category: "Calendars & Series",
      title: "2026 Gems of Queens: A Glimpse of New York City's most diverse borough.",
      desc: "The 2026 LaGuardia and Wagner Archives calendar puts a spotlight on Queens. Drawing on archival images from the Queens Local Collection, the calendar explores the borough's history and diversity.",
      id: 1,
      ref: "EDU-CAL-26",
      tags: ["Queens", "Community", "Diversity"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/1_ixymjo.jpg"
    },
    {
      category: "Calendars & Series",
      title: "Gotham Transformed: How 19th-Century Innovation Shaped New York City",
      desc: "This 2025 calendar celebrates the ingenuity and boldness of visionaries, engineers, and entrepreneurs of the 1800s that have made New York City into a global city.",
      id: 2,
      ref: "EDU-CAL-25",
      tags: ["Innovation", "19th Century", "Engineering"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/2_hsprf1.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "An LGBTQ+ New York Worth Fighting For",
      desc: "In Fall 2024 a group of LaGuardia students and faculty began working on building an archive of under-represented/underfunded LGBTQ+ spaces in New York City.",
      id: 3,
      ref: "EDU-LGBT-01",
      tags: ["Spaces", "Activism", "Under-represented"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/3_e18erh.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "The Battle for Intro. 2: The New York City Gay Rights Bill, 1971 - 1986",
      desc: "This exhibit chronicles the struggle in New York City to pass the Gay Rights Bill, a local law known as Intro. 2 in the City Council.",
      id: 4,
      ref: "EDU-CIV-02",
      tags: ["Policy", "Civil Rights", "City Council"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/4_nvb0ak.jpg"
    },
    {
      category: "Scholarship & Leadership",
      title: "Women in NYC Politics (formerly Making it here)",
      desc: "Gardiner-Shenker Scholars researched women in local government, interviewing elected officials to document challenges and community solutions.",
      id: 5,
      ref: "EDU-STU-05",
      tags: ["Women", "Politics", "Oral History"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403504/5_bwjpjw.jpg"
    },
    {
      category: "Scholarship & Leadership",
      title: "Student Booklet: District 26",
      desc: "Scholars photographed local resources and organizations available to LaGuardia students and community members in District 26.",
      id: 6,
      ref: "EDU-STU-06",
      tags: ["Queens", "Neighborhoods", "Resources"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403505/6_yfypw5.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "A Seat At The Table",
      desc: "An exhibit on LGBTQ elected officials in the New York City Council and State Legislature from the 1990s to the present.",
      id: 7,
      ref: "EDU-LGBT-03",
      tags: ["Elected Officials", "Representation"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403505/7_vjtpsz.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "Children Of The Rainbow Exhibit",
      desc: "Revisit the 1992 controversy when supporters advocated multicultural education and opponents criticized same-sex couple families.",
      id: 8,
      ref: "EDU-LGBT-04",
      tags: ["Curriculum", "Multiculturalism", "1990s"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403505/8_dfkzky.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "Next Stop Queer New York",
      desc: "Recognizes LGBTQ+ presence in politics, business, and arts. Includes modules on protests, nightlife, and fine art (2019-2022).",
      id: 9,
      ref: "EDU-LGBT-05",
      tags: ["Nightlife", "Business", "Arts"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403505/9_o6votj.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "Next Stop Queer New York: Suplemento (Spanish Edition)",
      desc: "Este suplemento reconoce la presencia LGBTQ+ en la política, los negocios y las artes. Incluye módulos sobre protestas y teatro.",
      id: 10,
      ref: "EDU-LGBT-05S",
      tags: ["Spanish", "Multilingual"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403505/10_ej5x8x.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "Shades of the Rainbow",
      desc: "Gen Z reframes identity through photography and oral history, telling stories of coming out across diverse ethnicities and religions.",
      id: 11,
      ref: "EDU-LGBT-06",
      tags: ["Gen Z", "Fluidity", "Intersectionality"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403506/11_wduha0.jpg"
    },
    {
      category: "Scholarship & Leadership",
      title: "Women In Government",
      desc: "In honor of the 2022 female majority in City Council, featuring a timeline, facts, and student reflections on leadership.",
      id: 12,
      ref: "EDU-CIV-03",
      tags: ["Leadership", "Milestones", "City Council"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403506/12_lhexyg.jpg"
    },
    {
      category: "Calendars & Series",
      title: "9/11 Collections (Reflections from LaGuardia)",
      desc: "Twenty-one years later, how do we connect to the shock and grief of 2001? Personal reflections from a generation born after.",
      id: 13,
      ref: "EDU-CAL-0911",
      tags: ["Tragedy", "Memory", "Reflections"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403506/13_d89n7s.jpg"
    },
    {
      category: "Scholarship & Leadership",
      title: "Migration, Homes and Borders",
      desc: "Photography students exploring cultural identity, nationality, and the impacts of gentrification in immigrant communities.",
      id: 14,
      ref: "EDU-STU-14",
      tags: ["Migration", "Gentrification", "Identity"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403507/14_rjp4jc.jpg"
    },
    {
      category: "LGBTQ+ History",
      title: "Rainbow LaGuardia",
      desc: "Digital exhibition chronicling the narratives and pedagogical approaches of LGBT faculty and staff.",
      id: 15,
      ref: "EDU-LGBT-07",
      tags: ["Faculty", "Narratives", "Higher Ed"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403503/15_byaaqc.jpg"
    },
    {
      category: "Calendars & Series",
      title: "Portraits of an Epicenter",
      desc: "Students documented their experiences during the 2020 Spring pandemic lockdown through photography and essays.",
      id: 16,
      ref: "EDU-CAL-COV",
      tags: ["Pandemic", "Lockdown", "Diary"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403503/16_k9hfyg.jpg"
    },
    {
      category: "Scholarship & Leadership",
      title: "Student Philosophy",
      desc: "Critical evaluation of contemporary news and archival research where students develop solutions to urgent NYC problems.",
      id: 17,
      ref: "EDU-STU-17",
      tags: ["Philosophy", "Solutions", "Critical Thinking"],
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1777403503/17_ljk8vp.jpg"
    }
  ];

  const categories = ["LGBTQ+ History", "Calendars & Series", "Scholarship & Leadership"];

  const filteredPrograms = filter 
    ? programs.filter(p => p.category === filter)
    : programs;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-8 max-w-7xl mx-auto font-mono"
    >
      <header className="mb-20 border-b border-white/10 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-4 block">Archive: Education Series</span>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 text-on-surface">Education Programs</h1>
            <p className="text-xs text-on-surface/50 leading-relaxed uppercase tracking-wider">
              Specialized pedagogical resources for educators, bridging archival discovery with modern classroom engagement.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-on-surface/30 mb-2 uppercase tracking-widest">Metadata Standard</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface/60 font-bold uppercase tracking-widest">ISO 15489-1 COMPLIANT</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Technical Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-12">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-6 flex items-center gap-2">
              <Filter size={14} /> Program Theme
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setFilter(null)}
                className={cn(
                  "text-left px-4 py-2 text-[10px] uppercase tracking-widest transition-all border",
                  filter === null 
                    ? "bg-secondary text-on-secondary-container border-secondary font-bold" 
                    : "border-white/5 text-on-surface/40 hover:border-white/20"
                )}
              >
                [ All Resources ]
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "text-left px-4 py-2 text-[10px] uppercase tracking-widest transition-all border",
                    filter === cat 
                      ? "bg-secondary text-on-secondary-container border-secondary font-bold" 
                      : "border-white/5 text-on-surface/40 hover:border-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 border border-white/5 rounded-lg space-y-4">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface/30">Quick Access</h4>
            <div className="space-y-4">
              <p className="text-[10px] text-on-surface/40 leading-relaxed font-light italic">
                Are you an NYC educator? Request bulk printed sets for your classroom.
              </p>
              <button className="w-full bg-white/5 border border-white/10 py-2 text-[8px] uppercase tracking-widest font-bold hover:bg-secondary hover:text-on-secondary-container transition-all">
                Teacher Inquiry Portal
              </button>
            </div>
          </div>
        </aside>

        {/* The Program Ledger */}
        <div className="lg:col-span-3">
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((program) => (
                <motion.div 
                  key={program.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group bg-surface-container-low border border-white/5 hover:border-secondary/20 transition-all p-8 rounded-xl flex flex-col md:flex-row gap-8 relative overflow-hidden"
                >
                  {/* Ledger Index mark */}
                  <div className="absolute top-0 right-0 p-4 font-mono text-[80px] leading-none opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    {program.id}
                  </div>

                  <div className="md:w-32 flex-shrink-0">
                    <span className="text-[10px] font-bold text-secondary mb-2 block tracking-tighter">
                      {program.ref}
                    </span>
                    <div className="w-full aspect-[3/4] bg-surface-container-highest flex items-center justify-center border border-white/5 grayscale group-hover:grayscale-0 transition-all overflow-hidden relative">
                      {program.image ? (
                        <img 
                          src={program.image} 
                          alt={program.title} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[8px] text-center text-on-surface/30 uppercase tracking-widest leading-relaxed p-4">
                          Educational<br/>Program<br/>Module
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface/40 hover:text-secondary transition-colors">
                          {program.category}
                        </span>
                        <div className="h-px w-8 bg-white/10" />
                        <div className="flex gap-2">
                          {program.tags.map(tag => (
                            <span key={tag} className="text-[7px] uppercase tracking-tighter text-on-surface/20 border border-white/5 px-1">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-serif italic text-on-surface mb-4 group-hover:text-secondary transition-colors leading-tight max-w-xl">
                        {program.title}
                      </h3>
                      <p className="text-[11px] text-on-surface/50 leading-relaxed font-light italic max-w-2xl">
                        "{program.desc}"
                      </p>
                    </div>

                    <button className="mt-8 flex items-center gap-3 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] group/btn">
                      [ View this education program ] 
                      <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-16 flex justify-between items-center text-[9px] uppercase tracking-[0.4em] text-on-surface/20 border-t border-white/5 pt-8">
            <span>Catalogue: Education 2026 Edition</span>
            <span>END OF LIST</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MayorsScreen = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

  const mayorsData = [
    {
      name: "Fiorello H. LaGuardia",
      years: "1934 — 1945",
      tags: ["Housing", "Infrastructure", "Social Reform", "Labor"],
      id: "laguardia",
      description: "The 'Little Flower' oversaw the massive expansion of NYC's infrastructure during the New Deal, establishing the foundation of modern municipal services.",
      documents: 12450
    },
    {
      name: "William O’Dwyer",
      years: "1946 — 1950",
      tags: ["Urban Development", "Infrastructure", "Public Health"],
      id: "odwyer",
      description: "Navigated the city through the immediate post-war period, focusing on housing shortages and the construction of the UN headquarters.",
      documents: 8720
    },
    {
      name: "Vincent R. Impellitteri",
      years: "1950 — 1953",
      tags: ["Infrastructure", "Anti-Corruption"],
      id: "impellitteri",
      description: "A period of consolidation and focus on municipal fiscal responsibility and infrastructure maintenance.",
      documents: 5600
    },
    {
      name: "Robert F. Wagner",
      years: "1954 — 1965",
      tags: ["Labor Rights", "Housing", "Collective Bargaining"],
      id: "wagner",
      description: "Transformed labor relations in NYC by granting city employees collective bargaining rights and oversaw major urban renewal projects.",
      documents: 18900
    },
    {
      name: "John V. Lindsay",
      years: "1966 — 1973",
      tags: ["Civil Rights", "Urban Renewal", "Labor Disputes"],
      id: "lindsay",
      description: "Led the city during a turbulent era of racial tension and labor strikes, focusing on neighborhood revitalization and school decentralization.",
      documents: 15300
    },
    {
      name: "Abraham D. Beame",
      years: "1974 — 1977",
      tags: ["Fiscal Reform", "Labor"],
      id: "beame",
      description: "The city's first Jewish mayor guided NYC through its most severe fiscal crisis, avoiding bankruptcy through monumental budgetary reforms.",
      documents: 9200
    },
    {
      name: "Edward I. Koch",
      years: "1978 — 1989",
      tags: ["Housing", "Urban Development", "Public Transit"],
      id: "koch",
      description: "A larger-than-life figure who oversaw the city's 1980s economic boom and the Ten-Year Plan for housing.",
      documents: 22400
    },
    {
      name: "David N. Dinkins",
      years: "1990 — 1993",
      tags: ["Public Safety", "Social Welfare", "Civil Rights"],
      id: "dinkins",
      description: "The first African American mayor focused on community policing (Safe Streets, Safe City) and social services during a period of recession.",
      documents: 11800
    },
    {
      name: "Rudolph W. Giuliani",
      years: "1994 — 2001",
      tags: ["Public Safety", "Infrastructure", "Urban Resilience"],
      id: "giuliani",
      description: "Known for his 'broken windows' policing strategy and leading the city through the aftermath of the September 11 terrorist attacks.",
      documents: 14100
    }
  ];

  const allTags = Array.from(new Set(mayorsData.flatMap(m => m.tags))).sort();

  const filteredMayors = filter 
    ? mayorsData.filter(m => m.tags.includes(filter))
    : mayorsData;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-8 max-w-7xl mx-auto font-mono"
    >
      <header className="mb-20 border-b border-white/10 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-4 block">Archive: Series 01</span>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 text-on-surface">NYC Mayors & Leadership</h1>
            <p className="text-xs text-on-surface/50 leading-relaxed uppercase tracking-wider">
              Meticulous administrative records documenting the executive branch of New York City government.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-on-surface/30 mb-2 uppercase tracking-widest">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] text-on-surface/60 font-bold uppercase tracking-widest">Archive Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Technical Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-12">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-6 flex items-center gap-2">
              <Filter size={14} /> Filter by Action
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setFilter(null)}
                className={cn(
                  "text-left px-4 py-2 text-[10px] uppercase tracking-widest transition-all border",
                  filter === null 
                    ? "bg-secondary text-on-secondary-container border-secondary font-bold" 
                    : "border-white/5 text-on-surface/40 hover:border-white/20"
                )}
              >
                [ Show All Records ]
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={cn(
                    "text-left px-4 py-2 text-[10px] uppercase tracking-widest transition-all border",
                    filter === tag 
                      ? "bg-secondary text-on-secondary-container border-secondary font-bold" 
                      : "border-white/5 text-on-surface/40 hover:border-white/20"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 border border-white/5 rounded-lg space-y-4">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface/30">Entry Metadata</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-[8px] uppercase tracking-widest">
                <span className="text-on-surface/40">Total Entries</span>
                <span>09 Records</span>
              </div>
              <div className="flex justify-between text-[8px] uppercase tracking-widest">
                <span className="text-on-surface/40">Catalog ID</span>
                <span>MAY-NYC-001</span>
              </div>
              <div className="flex justify-between text-[8px] uppercase tracking-widest">
                <span className="text-on-surface/40">Last Indexed</span>
                <span>2026-04-27</span>
              </div>
            </div>
          </div>
        </aside>

        {/* The Civic Ledger (Main List) */}
        <div className="lg:col-span-3">
          <div className="border border-white/10 overflow-hidden">
            <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 px-6 py-3 text-[9px] uppercase tracking-[0.3em] font-bold text-on-surface/40">
              <div className="col-span-1">Ref</div>
              <div className="col-span-5">Mayor / Executive</div>
              <div className="col-span-3">Tenure</div>
              <div className="col-span-3 text-right">Records</div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredMayors.map((mayor, idx) => (
                <motion.div 
                  key={mayor.id}
                  layout
                  onMouseEnter={() => setHoveredEntry(mayor.id)}
                  onMouseLeave={() => setHoveredEntry(null)}
                  className={cn(
                    "grid grid-cols-12 px-6 py-8 transition-colors cursor-pointer group",
                    hoveredEntry === mayor.id ? "bg-white/5" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="col-span-1 text-on-surface/30 text-[10px] font-bold">
                    0{idx + 1}
                  </div>
                  <div className="col-span-5 space-y-4">
                    <div>
                      <h2 className="text-xl font-serif italic text-on-surface group-hover:text-secondary transition-colors">
                        {mayor.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mayor.tags.map(tag => (
                          <span key={tag} className={cn(
                            "text-[8px] uppercase tracking-widest px-2 py-0.5 border transition-colors",
                            tag === filter ? "bg-secondary/20 border-secondary text-secondary" : "border-white/10 text-on-surface/40"
                          )}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <AnimatePresence>
                      {hoveredEntry === mayor.id && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] text-on-surface/50 leading-relaxed font-light italic pr-8"
                        >
                          "{mayor.description}"
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="col-span-3 text-[10px] uppercase tracking-widest text-on-surface/60 flex items-start pt-1">
                    {mayor.years}
                  </div>
                  <div className="col-span-3 flex flex-col items-end gap-4">
                    <span className="text-[10px] font-bold text-secondary">
                      {mayor.documents.toLocaleString()} ITEMS
                    </span>
                    <button className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-on-surface/30 hover:text-white transition-colors">
                      Access Records <ArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center text-[9px] uppercase tracking-[0.4em] text-on-surface/20">
            <span>End of Current Ledger</span>
            <span>Series 01 Complete</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarsScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const calendars = Array.from({ length: 44 }, (_, i) => {
    const year = 2026 - i;
    return {
      year,
      file: `CALENDAR_${year}.pdf`,
      photo: `https://picsum.photos/seed/cal${year}/600/800?grayscale`,
      title: `${year} Annual Calendar`
    };
  });

  const yearFrom = calendars[calendars.length - 1].year;
  const yearTo = calendars[0].year;

  const totalPages = Math.ceil(calendars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = calendars.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-24 px-8 max-w-7xl mx-auto"
    >
      <header className="mb-16 border-b border-white/5 pb-12">
        <span className="text-secondary text-xs uppercase tracking-[0.4em] font-bold block mb-4">Historical Publications</span>
        <h1 className="text-5xl md:text-7xl font-serif italic text-on-surface mb-6">
          Calendars {yearFrom} — {yearTo}
        </h1>
        <p className="max-w-2xl text-on-surface/50 font-light leading-relaxed italic">
          Our award-winning annual calendars have served as a cornerstone of the Archives' outreach since the 1980s, documenting the long history of struggle and progress in New York City.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Main Grid: 2x2 effectively via 4 items in grid-cols-2 on smaller lg/md */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {currentItems.map((cal, i) => (
              <motion.div 
                key={cal.year}
                initial={{ opacity: 0, rotate: i % 2 === 0 ? -1 : 1 }}
                animate={{ opacity: 1, rotate: 0 }}
                whileHover={{ y: -10, rotate: i % 2 === 0 ? -2 : 2 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-surface-container-low border border-white/10 p-4 shadow-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <img 
                    src={cal.photo} 
                    alt={cal.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-on-secondary-container px-3 py-1 text-xs font-bold font-mono">
                    {cal.year}
                  </div>
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 bg-white/95 text-background px-6 py-3 text-[10px] uppercase tracking-widest font-bold shadow-2xl transition-all translate-y-4 group-hover:translate-y-0">
                      View Publication
                    </button>
                  </div>
                </div>
                <h3 className="font-serif text-xl italic group-hover:text-secondary transition-colors text-center">{cal.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-12">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all",
                currentPage === 1 ? "text-on-surface/20 cursor-not-allowed" : "text-secondary hover:text-white"
              )}
            >
              <ChevronLeft size={16} /> Previous Page
            </button>

            <div className="flex gap-4">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (currentPage < 3) pageNum = i + 1;
                else if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-mono transition-all flex items-center justify-center",
                      currentPage === pageNum ? "bg-secondary text-on-secondary-container font-bold" : "text-on-surface/40 hover:text-on-surface"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all",
                currentPage === totalPages ? "text-on-surface/20 cursor-not-allowed" : "text-secondary hover:text-white"
              )}
            >
              Next Page <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar Gallery List */}
        <aside className="space-y-8">
          <div className="bg-surface-container-high p-8 rounded-2xl border border-white/10">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-8">Quick Index</h4>
            <div className="h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
              <div className="space-y-6">
                {calendars.map((cal) => (
                  <button 
                    key={cal.year} 
                    onClick={() => {
                        const pageNum = Math.ceil((calendars.indexOf(cal) + 1) / itemsPerPage);
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-4 group w-full text-left"
                  >
                    <div className="w-12 h-16 rounded overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-white/10 flex-shrink-0">
                      <img src={cal.photo} alt={cal.year.toString()} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className={cn(
                        "text-xs font-mono block",
                        calendars.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).includes(cal) ? "text-secondary" : "text-on-surface/30 group-hover:text-on-surface"
                      )}>
                        {cal.year}
                      </span>
                      <span className="text-[10px] text-on-surface/60 line-clamp-1">{cal.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 border border-primary/10 rounded-2xl">
            <h5 className="font-serif italic text-lg mb-4 text-primary">Reproduction Policy</h5>
            <p className="text-[10px] text-on-surface/60 leading-relaxed font-light">
              Calendar covers and internal images are subject to institutional copyright. For publication rights, please visit our <span className="text-secondary underline cursor-pointer">Media Reproductions</span> page.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

const CollectionsScreen = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'names'>('grid');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const archivalCollections = [
    { id: 1, name: "Fiorello LaGuardia", category: "Mayoral", description: "The transformative documents of NYC's most iconic mayor, detailing the New Deal era and post-Depression recovery.", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776191324/Fiorello_La_Guardia_jytulz.webp", note: "Legacy documents including personal correspondence and official records." },
    { id: 2, name: "The New York City Housing Authority", category: "Community", description: "Records documenting the development of public housing in NYC.", image: "https://picsum.photos/seed/nycha/800/600?grayscale" },
    { id: 3, name: "Queens Local History", category: "Community", description: "A vast collection of photographs and documents tracing the growth of the borough of Queens.", image: "https://picsum.photos/seed/queens/800/600?grayscale" },
    { id: 4, name: "Steinway & Sons", category: "Social", description: "The archives of the world-renowned piano manufacturer, based in Astoria, Queens.", image: "https://picsum.photos/seed/steinway/800/600?grayscale" },
    { id: 5, name: "The Council of the City of New York", category: "Political", description: "Legislative records and proceedings of the NYC Council.", image: "https://picsum.photos/seed/council/800/600?grayscale" },
    { id: 6, name: "Robert F. Wagner", category: "Mayoral", description: "Focusing on urban renewal, labor relations, and the expansion of social services.", image: "https://picsum.photos/seed/wagner/800/600?grayscale" },
    { id: 7, name: "Abraham D. Beame", category: "Mayoral", description: "Critical records from the New York fiscal crisis and the city's fight for solvency.", image: "https://picsum.photos/seed/beame/800/600?grayscale" },
    { id: 8, name: "Edward I. Koch", category: "Mayoral", description: "The papers of 'Mayor for Life,' documenting the redevelopment of Times Square and the AIDS crisis response.", image: "https://picsum.photos/seed/koch/800/600?grayscale" },
    { id: 9, name: "Rudolph W. Giuliani", category: "Mayoral", description: "Over 40,000 index records documenting the Giuliani administration.", image: "https://picsum.photos/seed/giuliani/800/600?grayscale", note: "Researchers requesting access are asked to go directly to the NYC Municipal Archives." },
    { id: 10, name: "John V. Lindsay", category: "Mayoral", description: "Records from the Lindsay administration, focusing on social justice and urban reform.", image: "https://picsum.photos/seed/lindsay/800/600?grayscale" },
    { id: 11, name: "David N. Dinkins", category: "Mayoral", description: "The papers of NYC's first Black mayor, documenting 'Safe Streets, Safe City' initiatives.", image: "https://picsum.photos/seed/dinkins/800/600?grayscale", note: "Various record series were not microfilmed due to budget restrictions." },
    { id: 12, name: "Vincent R. Impellitteri", category: "Mayoral", description: "Records from the post-war era of NYC government.", image: "https://picsum.photos/seed/vincent/800/600?grayscale" },
    { id: 13, name: "William O'Dwyer", category: "Mayoral", description: "Documents from the late 1940s administration.", image: "https://picsum.photos/seed/william/800/600?grayscale" },
    { id: 14, name: "Real Estate Board of New York", category: "Social", description: "Archives documenting the real estate development of the city.", image: "https://picsum.photos/seed/rebny/800/600?grayscale" },
    { id: 15, name: "The LGBTQ Collection", category: "Social", description: "Illuminating NYC's LGBT history and activism from the 1990s to the early 2010s.", image: "https://picsum.photos/seed/lgbtq-arch/800/600?grayscale", note: "Presently being processed; bulk comes from Daniel Dromm and Tom Duane papers." },
    { id: 16, name: "The Inner Circle Collection", category: "Social", description: "Records of the Inner Circle, the association of past and present political reporters.", image: "https://picsum.photos/seed/inner/800/600?grayscale" },
    { id: 17, name: "Edith E. Asbury", category: "Social", description: "The papers of the pioneering New York Times journalist.", image: "https://picsum.photos/seed/asbury/800/600?grayscale" },
  ];

  const formats = ["Photos", "Documents", "Videos", "Oral History", "Artifacts"];

  const selectedCollection = archivalCollections.find(c => c.id === selectedId);

  if (selectedId && selectedCollection) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="pt-32 pb-24"
      >
        {/* Detail Hero */}
        <header className="relative h-[60vh] flex items-end overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <img 
              src={selectedCollection.image} 
              alt={selectedCollection.name}
              className="w-full h-full object-cover grayscale opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          </div>
          <div className="container mx-auto px-8 pb-16 relative z-10">
            <button 
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-secondary text-xs uppercase tracking-widest font-bold mb-8 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowRightLeft size={14} className="rotate-180" /> Back to Collections
            </button>
            <span className="text-secondary uppercase tracking-[0.3em] text-xs mb-4 block">{selectedCollection.category} Collection</span>
            <h1 className="font-serif italic text-6xl md:text-8xl text-on-surface max-w-4xl leading-tight">
              {selectedCollection.name}
            </h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h2 className="text-2xl font-serif italic mb-6">Collection Overview</h2>
              <p className="text-xl text-on-surface/70 font-light leading-relaxed">
                {selectedCollection.description}
              </p>
              {selectedCollection.note && (
                <div className="mt-8 p-8 bg-surface-container-high border-l-4 border-primary rounded-r-xl">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Note to Researcher</h4>
                  <p className="text-sm text-on-surface/60 italic leading-relaxed">{selectedCollection.note}</p>
                </div>
              )}
            </section>

            {/* Contextual Search */}
            <section className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
              <h3 className="text-lg font-serif mb-6">Search within this Collection</h3>
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30" size={20} />
                <input 
                  type="text" 
                  placeholder={`Search ${selectedCollection.name}...`}
                  className="w-full bg-background border-b border-white/10 pl-12 pr-4 py-4 outline-none focus:border-secondary transition-colors text-lg"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {formats.map(format => (
                  <button 
                    key={format}
                    onClick={() => setActiveFilters(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format])}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all",
                      activeFilters.includes(format) ? "bg-secondary text-on-secondary border-secondary" : "border-white/10 text-on-surface/40 hover:border-secondary/30"
                    )}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-high p-8 rounded-2xl border border-white/5">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-6">Archival Resources</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center justify-between group">
                    <span className="text-sm text-on-surface/80 group-hover:text-secondary transition-colors">Finding Aid (PDF)</span>
                    <ExternalLink size={14} className="text-on-surface/20 group-hover:text-secondary" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between group">
                    <span className="text-sm text-on-surface/80 group-hover:text-secondary transition-colors">Digital Highlights</span>
                    <ArrowRight size={14} className="text-on-surface/20 group-hover:text-secondary" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between group">
                    <span className="text-sm text-on-surface/80 group-hover:text-secondary transition-colors">Reproduction Requests</span>
                    <FileText size={14} className="text-on-surface/20 group-hover:text-secondary" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale brightness-50 relative group">
              <img 
                src={`https://picsum.photos/seed/${selectedCollection.id}/400/500?grayscale`} 
                alt="Archival Detail" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <p className="font-serif italic text-lg text-white opacity-80">"To understand the city, one must first touch its papers."</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=""
    >
      {/* Hero Header */}
      <section className="px-8 max-w-7xl mx-auto mb-20 pt-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-secondary mb-4 block">Institutional Memory</span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold italic tracking-tight mb-8 text-on-surface">Archival Collections</h1>
            <p className="text-xl text-on-surface/60 font-light leading-relaxed">
              A curated gateway into the historical records of New York City. From the personal papers of transformative mayors to the grassroots struggles of community organizers.
            </p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' ? "text-secondary" : "text-on-surface/20 hover:text-on-surface/40"
              )}
            >
              <Filter size={20} />
            </button>
            <button 
              onClick={() => setViewMode('names')}
              className={cn(
                "text-[10px] uppercase tracking-widest font-bold border-b transition-all pb-1",
                viewMode === 'names' ? "text-secondary border-secondary" : "text-on-surface/40 border-transparent hover:text-on-surface"
              )}
            >
              List of Names
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-8 max-w-7xl mx-auto mb-32">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {archivalCollections.map((col, i) => (
              <motion.div 
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedId(col.id)}
                className="group cursor-pointer bg-surface-container-low border border-white/5 hover:border-secondary/30 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={col.image} 
                    alt={col.name} 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-8">
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2 block">{col.category}</span>
                  <h3 className="font-serif text-2xl mb-4 group-hover:text-secondary transition-colors">{col.name}</h3>
                  <p className="text-sm text-on-surface/50 font-light leading-relaxed line-clamp-3">{col.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-primary text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Explore Archive <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            {archivalCollections.map((col) => (
              <button 
                key={col.id}
                onClick={() => setSelectedId(col.id)}
                className="flex items-center justify-between py-4 border-b border-white/5 group text-left"
              >
                <span className="font-serif text-xl text-on-surface/60 group-hover:text-secondary transition-colors">{col.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface/20 group-hover:text-secondary transition-colors">{col.category}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

const ProjectsScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=""
    >
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 py-16 md:py-24 pt-40 md:pt-48">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-secondary font-sans text-xs uppercase tracking-[0.2em] mb-4 block font-bold">Visual Timelines & Narrative Histories</span>
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold leading-tight tracking-tight text-on-surface">Themed Historical Projects</h1>
          </div>
          <div className="max-w-xs pb-2">
            <p className="text-sm text-on-surface/60 leading-relaxed font-light">
              Our collections transcend the database. Experience history through curated visual journeys that connect past struggles with modern civic identity.
            </p>
          </div>
        </div>
      </header>

      {/* Featured Projects Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Struggle in America */}
          <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-low rounded-lg transition-all duration-500 hover:bg-surface-container-high min-h-[500px]">
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-700" 
                src="https://picsum.photos/seed/civil-rights/1200/800?grayscale" 
                alt="Civil Rights March"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 h-full p-12 flex flex-col justify-end">
              <span className="text-secondary font-sans text-xs uppercase tracking-widest mb-2 font-bold">Featured Series</span>
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Struggle in America</h2>
              <p className="max-w-md text-on-surface/70 mb-8 leading-relaxed font-light">
                A deep dive into the labor movements and social justice crusades that shaped the five boroughs. This timeline highlights the resilience of the working class.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="inline-flex items-center gap-2 text-primary font-sans text-xs uppercase tracking-widest border-b border-primary/30 pb-1 hover:border-primary transition-all">
                  <Calendar size={14} /> View Calendar
                </button>
                <button className="inline-flex items-center gap-2 text-on-surface font-sans text-xs uppercase tracking-widest border-b border-on-surface/20 pb-1 hover:border-on-surface transition-all">
                  <FileText size={14} /> Explore Lesson Plans
                </button>
              </div>
            </div>
          </div>

          {/* Gems of Queens */}
          <div className="md:col-span-4 group relative overflow-hidden bg-surface-container-low rounded-lg transition-all duration-500 hover:bg-surface-container-high min-h-[500px]">
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
                src="https://picsum.photos/seed/queens-fair/600/900?grayscale" 
                alt="Queens World's Fair"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 h-full p-10 flex flex-col justify-end">
              <h2 className="text-3xl font-serif italic mb-4">Gems of Queens</h2>
              <p className="text-sm text-on-surface/70 mb-8 leading-relaxed font-light">
                Discover the architectural and cultural landmarks of New York’s most diverse borough through rare maps and photography.
              </p>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between group/link border border-white/10 p-4 rounded bg-surface/50 backdrop-blur-sm hover:bg-surface transition-colors">
                  <span className="text-xs uppercase tracking-widest font-sans font-bold">View Gallery</span>
                  <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between group/link border border-white/10 p-4 rounded bg-surface/50 backdrop-blur-sm hover:bg-surface transition-colors">
                  <span className="text-xs uppercase tracking-widest font-sans font-bold">Lesson Plans</span>
                  <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Projects Row */}
          <div className="md:col-span-4 group relative overflow-hidden bg-surface-container-low rounded-lg transition-all duration-500 hover:bg-surface-container-high">
            <div className="p-8">
              <div className="w-full h-48 bg-surface-container-highest mb-6 rounded overflow-hidden">
                <img 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-105 transition-transform duration-700" 
                  src="https://picsum.photos/seed/mayor-office/600/400?grayscale" 
                  alt="Mayoral Legacy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-serif italic mb-2">The Mayoral Legacy</h3>
              <p className="text-xs text-on-surface/60 leading-relaxed mb-6 font-light">
                Chronicle the administrations of LaGuardia, Wagner, and beyond through private correspondence and policy shifts.
              </p>
              <button className="text-secondary text-xs uppercase font-sans font-bold tracking-widest hover:underline">Launch Timeline</button>
            </div>
          </div>

          <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-low rounded-lg flex flex-col md:flex-row items-center transition-all duration-500 hover:bg-surface-container-high">
            <div className="w-full md:w-1/2 h-full min-h-[300px]">
              <img 
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
                src="https://picsum.photos/seed/bridge-construction/800/600?grayscale" 
                alt="Bridge Construction"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full md:w-1/2 p-10">
              <h3 className="text-3xl font-serif italic mb-4">Building the Modern City</h3>
              <p className="text-sm text-on-surface/70 leading-relaxed mb-8 font-light">
                An examination of the massive public works projects that redefined the city's physical landscape during the 20th century.
              </p>
              <button className="bg-primary text-on-primary-container px-6 py-2 text-xs uppercase font-sans font-bold tracking-widest transition-all hover:brightness-110">Browse Archive</button>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Methodology */}
      <section className="max-w-7xl mx-auto px-8 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'The Narrative Arc', icon: <FileText />, desc: 'We believe archives shouldn\'t be static. Every project is designed with a storytelling spine, guiding researchers and students through the \'Why\' behind historical events.' },
            { title: 'Curated Context', icon: <History />, desc: 'By pairing high-resolution imagery with metadata-rich descriptions, we provide the context necessary to understand the complex social fabrics of New York.' },
            { title: 'Pedagogical Tools', icon: <Users />, desc: 'Our lesson plans are built directly into the visual timelines, offering educators ready-to-use primary source materials for the modern classroom.' }
          ].map((item, i) => (
            <div key={i}>
              <div className="text-secondary mb-4">{item.icon}</div>
              <h4 className="font-serif italic text-xl mb-4">{item.title}</h4>
              <p className="text-sm text-on-surface/60 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const AboutScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=""
    >
      <header className="relative h-[70vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-40 grayscale" 
            src="https://picsum.photos/seed/nyc-street/1920/1080?grayscale" 
            alt="Vintage NYC Street"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        </div>
        <div className="container mx-auto px-8 pb-16 relative z-10">
          <p className="text-secondary uppercase tracking-[0.3em] text-sm mb-4">Established 1982</p>
          <h1 className="font-serif italic text-6xl md:text-8xl text-on-surface max-w-4xl leading-tight">
            Preserving the <span className="text-primary">Political Soul</span> of New York City.
          </h1>
        </div>
      </header>

      <section className="py-24 bg-surface px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7 space-y-8">
            <h2 className="text-4xl text-on-surface">Mission & Overview</h2>
            <div className="space-y-6 text-lg text-on-surface/80 leading-relaxed font-light">
              <p>
                The LaGuardia and Wagner Archives was established in 1982 to collect, preserve, and make available primary materials documenting the social and political history of New York City, with an emphasis on the mayoralty and the borough of Queens.
              </p>
              <p>
                The Archives serves researchers, journalists, students, scholars, exhibit planners, and policy makers examining the history of Greater New York. The Archives also produces public programs exploring that history. Its website provides a webdatabase to the collections, which include more than 100,000 digitized photos, and nearly 2.5 million digitized documents.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="border-l border-secondary/30 pl-6">
                <span className="block text-4xl font-serif text-secondary mb-1">100k+</span>
                <span className="text-xs uppercase tracking-widest text-on-surface/60">Historical Photographs</span>
              </div>
              <div className="border-l border-secondary/30 pl-6">
                <span className="block text-4xl font-serif text-secondary mb-1">2.5m</span>
                <span className="text-xs uppercase tracking-widest text-on-surface/60">Archival Documents</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[3/4] bg-surface-container-low p-2">
              <img 
                className="w-full h-full object-cover grayscale brightness-75" 
                src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776185492/Armed-Forces-Women_rdfk8v.webp" 
                alt="Armed Forces Women historical photograph"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-primary-container p-8 hidden lg:block border border-white/5">
              <p className="font-serif italic text-xl text-on-primary-container">"To understand the city, one must first touch its papers."</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-low px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-secondary uppercase tracking-[0.3em] text-xs">The Vaults</span>
            <h2 className="text-5xl mt-4">Major Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 md:row-span-2 bg-surface-container-high p-8 flex flex-col justify-end min-h-[400px] relative overflow-hidden group">
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 grayscale" 
                src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776191324/Fiorello_La_Guardia_jytulz.webp" 
                alt="Fiorello La Guardia"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <h3 className="text-2xl text-secondary mb-2">Fiorello La Guardia (1934-45)</h3>
                <p className="text-on-surface/70 text-sm">The transformative documents of NYC's most iconic mayor, detailing the New Deal era and post-Depression recovery.</p>
              </div>
            </div>
            <div className="bg-surface-container p-6 border-t-2 border-primary/20">
              <h4 className="text-lg text-on-surface mb-2">Robert F. Wagner</h4>
              <p className="text-xs text-on-surface/60 tracking-widest uppercase mb-2">1954-1965</p>
              <p className="text-sm text-on-surface/70">Focusing on urban renewal, labor relations, and the expansion of social services.</p>
            </div>
            <div className="bg-surface-container p-6 border-t-2 border-secondary/20">
              <h4 className="text-lg text-on-surface mb-2">Abraham D. Beame</h4>
              <p className="text-xs text-on-surface/60 tracking-widest uppercase mb-2">1974-1977</p>
              <p className="text-sm text-on-surface/70">Critical records from the New York fiscal crisis and the city's fight for solvency.</p>
            </div>
            <div className="md:col-span-2 bg-surface-container-high p-8 flex items-center gap-8 border-l-2 border-primary/40">
              <div className="flex-1">
                <h3 className="text-2xl text-on-surface mb-2">Edward I. Koch (1978-89)</h3>
                <p className="text-on-surface/70 text-sm">The papers of "Mayor for Life," documenting the redevelopment of Times Square and the AIDS crisis response.</p>
              </div>
              <Building2 className="text-primary/30" size={48} />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const SearchScreen = () => {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'items'));
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-16 px-4 md:px-12 max-w-7xl mx-auto"
    >
      <header className="mb-16 text-center">
        <label className="block text-xs uppercase tracking-[0.2em] text-secondary mb-4">Search the Archive</label>
        <div className="relative max-w-3xl mx-auto">
          <input 
            className="w-full bg-surface-container-low border-none py-6 px-8 rounded-xl text-xl font-serif placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-secondary transition-all shadow-2xl outline-none" 
            placeholder="Keywords, names, or historical events..." 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <button className="p-3 bg-secondary text-on-secondary-container rounded-lg hover:opacity-90 transition-opacity">
              <Search size={24} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm text-on-surface/60">
          <span>Trending: <span className="text-primary hover:underline cursor-pointer" onClick={() => setSearchTerm("La Guardia")}>Fiorello La Guardia</span></span>
          <span><span className="text-primary hover:underline cursor-pointer" onClick={() => setSearchTerm("Wagner")}>Robert F. Wagner</span></span>
          <span><span className="text-primary hover:underline cursor-pointer" onClick={() => setSearchTerm("Steinway")}>Steinway & Sons</span></span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="space-y-10">
          <section>
            <h3 className="text-lg mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <Calendar className="text-secondary" size={18} />
              Date Range
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-tighter text-on-surface/60">
                <span>1880</span>
                <span>2024</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full relative">
                <div className="absolute h-full w-2/3 bg-secondary left-10 rounded-full"></div>
                <div className="absolute w-4 h-4 bg-on-surface border-2 border-secondary rounded-full -top-1.5 left-10 cursor-pointer"></div>
                <div className="absolute w-4 h-4 bg-on-surface border-2 border-secondary rounded-full -top-1.5 left-[75%] cursor-pointer"></div>
              </div>
              <div className="flex gap-2">
                <input className="w-full bg-surface-container-low border-none text-sm py-2 px-3 rounded focus:ring-1 focus:ring-secondary outline-none" type="text" defaultValue="1930" />
                <input className="w-full bg-surface-container-low border-none text-sm py-2 px-3 rounded focus:ring-1 focus:ring-secondary outline-none" type="text" defaultValue="1960" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <Filter className="text-secondary" size={18} />
              Topics
            </h3>
            <div className="space-y-2">
              {['Politics & Government', 'LGBTQ+ History', "Women's Rights", 'Labor & Unions'].map((topic, i) => (
                <label key={topic} className="flex items-center gap-3 group cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={i === 2}
                    className="rounded-sm bg-surface-container-highest border-none text-secondary focus:ring-0" 
                  />
                  <span className={`text-sm transition-colors ${i === 2 ? 'text-secondary' : 'text-on-surface group-hover:text-secondary'}`}>
                    {topic}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <MapIcon className="text-secondary" size={18} />
              Borough
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Queens', 'Manhattan', 'Brooklyn', 'Bronx'].map((b, i) => (
                <button 
                  key={b} 
                  className={`py-2 rounded-full text-xs uppercase tracking-widest transition-colors ${i === 0 ? 'bg-secondary text-on-secondary-container' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Results */}
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-on-surface/60 italic">Showing {filteredItems.length} results {searchTerm && `for "${searchTerm}"`}</span>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
              <span className="text-on-surface/60">Sort by:</span>
              <select className="bg-transparent border-none text-secondary focus:ring-0 cursor-pointer py-0 outline-none">
                <option>Relevance</option>
                <option>Date (Newest)</option>
                <option>Date (Oldest)</option>
              </select>
            </div>
          </div>

          {filteredItems.length > 0 ? filteredItems.map((result, i) => (
            <article key={i} className="group bg-surface-container-low p-6 rounded-lg transition-all hover:bg-surface-container-high relative overflow-hidden cursor-pointer">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 h-48 bg-surface-container-highest flex-shrink-0 rounded overflow-hidden">
                  <img 
                    src={result.imageUrl} 
                    alt={result.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-serif group-hover:text-primary transition-colors">{result.title}</h2>
                    <Bookmark size={18} className="text-on-surface/40 hover:text-secondary transition-colors" />
                  </div>
                  <p className="text-on-surface/80 leading-relaxed line-clamp-3 font-light">
                    {result.description}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Date:</span>
                      <span className="text-sm">{new Date(result.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Collection:</span>
                      <span className="text-sm text-primary underline decoration-primary/20 underline-offset-4">{result.collectionId || "General Archive"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Borough:</span>
                      <span className="text-sm">{result.borough || "NYC"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-0 top-0 w-[2px] h-0 bg-secondary transition-all duration-500 group-hover:h-full"></div>
            </article>
          )) : (
            <div className="py-24 text-center border border-dashed border-outline-variant rounded-lg">
              <p className="text-on-surface/40 italic">No items found matching your search.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 pt-12">
            <button className="p-2 text-on-surface/30 cursor-not-allowed"><ChevronLeft /></button>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded border border-secondary text-secondary font-medium">1</button>
            </div>
            <button className="p-2 text-on-surface/30 cursor-not-allowed"><ChevronRight /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LGBTQScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const campuses = [
    { name: "Baruch College", contacts: ["Dr. Gary L. Dillon, Jr., PhD."], email: "gary.dillon@baruch.cuny.edu", phone: "(646) 312-2158" },
    { name: "Borough of Manhattan Community College", contacts: ["Kathleen Dreyer", "Brian Kelley", "Yuliya Shneyderman"], email: "kdreyer@bmcc.cuny.edu" },
    { name: "Bronx Community College", contacts: ["Dr. Emily McSpadden", "Edwin Roman"], email: "emalinda.mcspadden@bcc.cuny.edu", phone: "(718) 289-5100" },
    { name: "Brooklyn College", contacts: ["Kelly Spivey"], email: "Kelly.Spivey10@brooklyn.cuny.edu" },
    { name: "College of Staten Island", contacts: ["Jeremiah Jurkiewicz"], email: "Jeremiah.Jurkiewicz@csi.cuny.edu", phone: "(718) 982-3091" },
    { name: "Craig Newmark Graduate School of Journalism", contacts: ["Allison Lichter", "Matthew Brown"], email: "allison.lichter@journalism.cuny.edu" },
    { name: "CUNY Graduate Center", contacts: ["Matt Brim", "Elvis Bakaitis", "Jasmina Sinanović"], email: "ebakaitis@gc.cuny.edu" },
    { name: "CUNY Graduate School of Public Health", contacts: ["Sherry Adams"], email: "sherry.adams@sph.cuny.edu" },
    { name: "CUNY School Of Labor And Urban Studies", contacts: ["Rochel Pinder-Cuffie", "Kevin Simmons"], email: "Rochel.Pinder-Cuffie@slu.cuny.edu" },
    { name: "CUNY School of Law", contacts: ["Arpita Vora"], email: "arpita.vora@law.cuny.edu", phone: "(718) 340-4295" },
    { name: "CUNY School Of Professional Studies", contacts: ["Jan Oosting", "Anthony Sweeney"], email: "jan.oosting@cuny.edu" },
    { name: "Guttman Community College", contacts: ["Christopher Roth"], email: "Christopher.Roth@guttman.cuny.edu", phone: "(646) 313-8189" },
    { name: "Hostos Community College", contacts: ["Anders 'AJ' Stachelek", "Ashante Diggs", "Rachel Cholst", "Philip Oliveri"], email: "ASTACHELEK@hostos.cuny.edu" },
    { name: "Hunter College", contacts: ["Dr. Erin Mayo-Adam"], email: "erin.mayo-adam@hunter.cuny.edu", phone: "(212) 772-5505" },
    { name: "Kingsborough Community College", contacts: ["Gordon Alley-Young"], email: "gordon.young@kbcc.cuny.edu" },
    { name: "LaGuardia Community College", contacts: ["Dr. Allie Brashears", "Deema Bayrakdar"], email: "jbrashears@lagcc.cuny.edu", phone: "(347) 306-6521" },
    { name: "Lehman College", contacts: ["MX Cooper", "Matthew Frye-Castillo"], email: "MX.COOPER@lehman.cuny.edu", phone: "(718) 960-6095" },
    { name: "Macaulay Honors College", contacts: ["Roblin Meeks"], email: "roblin.meeks@mhc.cuny.edu" },
    { name: "Medgar Evers College", contacts: ["Tony Hegamin", "Tina Lemma", "Susan Fischer", "Darrel Holnes"], email: "thegamin@mec.cuny.edu" },
    { name: "New York City College of Technology", contacts: ["Dr. Laura Westengard"], email: "LWestengard@citytech.cuny.edu", phone: "(718) 260-5761" },
    { name: "Queens College", contacts: ["JC Carlson"], email: "jc.carlson@qc.cuny.edu", phone: "(718) 997-3952" },
    { name: "Queensborough Community College", contacts: ["C. Julian Jiménez", "Heather Huggins"], email: "cjimenez@qcc.cuny.edu" },
    { name: "The City College of New York", contacts: ["Jake Nill", "Jasmin Salcedo"], email: "jnill@ccny.cuny.edu", phone: "(212) 650-6937" },
    { name: "York College", contacts: ["Charmaine Townsell"], email: "ctownsell@york.cuny.edu" },
  ];

  const filteredCampuses = campuses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contacts.some(contact => contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      {/* Hero Section */}
      <section className="px-8 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary text-xs uppercase tracking-[0.3em] font-medium mb-4 block">CUNY LGBTQIA+ Consortium</span>
            <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight text-on-surface">
              Changing the face of <span className="text-primary">CUNY</span> and <span className="text-primary">NYC</span>.
            </h1>
            <div className="space-y-6 text-lg text-on-surface/70 font-light leading-relaxed">
              <p>
                We are the CUNY LGBTQIA+ Consortium, and we are changing the face of CUNY and NYC. Our mission is not only to preserve LGBTQIA+ history, but to make it!
              </p>
              <p>
                We facilitate the archiving of LGBTQIA+ history across New York, and we support LGBTQIA+ training, education, and programming.
              </p>
              <p>
                The CUNY LGBTQIA+ Consortium began in the borough of Queens in 2017, and since that time we have expanded across all 5 boroughs. Currently there are 24 participating campuses, and we are still growing!
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a 
                href="mailto:jbrashears@lagcc.cuny.edu"
                className="bg-secondary text-on-secondary px-8 py-4 text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all flex items-center gap-2"
              >
                Contact Director <Mail size={14} />
              </a>
              <button 
                onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-white/10 px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-all"
              >
                View Member Campuses
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden border border-white/5 p-4">
              <img 
                src="https://picsum.photos/seed/pride/800/800?grayscale" 
                alt="CUNY LGBTQIA+ Consortium" 
                className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary-container p-8 border border-white/5 rounded-2xl hidden md:block max-w-xs">
              <p className="font-serif italic text-lg text-on-primary-container leading-relaxed">
                "Our mission is not only to preserve LGBTQIA+ history, but to make it!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multimedia Section */}
      <section className="bg-surface-container-low py-24 px-8 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <span className="text-secondary text-xs uppercase tracking-[0.3em] font-medium mb-4 block">Multimedia</span>
              <h2 className="text-4xl font-serif italic mb-6">Promoting Pride at CUNY</h2>
              <p className="text-on-surface/60 font-light leading-relaxed mb-8">
                Hear Allie Brashears and JC Carlson talk to Tanya Domi of the Graduate Center's Thought Podcast about the Consortium and our efforts to preserve history across the five boroughs.
              </p>
              <div className="flex items-center gap-4 p-4 bg-background/50 border border-white/5 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <Music size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Thought Podcast</p>
                  <p className="text-[10px] text-on-surface/40">CUNY Graduate Center</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-background rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <iframe 
                  width="100%" 
                  height="200" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay" 
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1278655618&color=%23770189&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section id="directory" className="px-8 max-w-7xl mx-auto scroll-mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-serif italic mb-4">Member Campuses</h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30" size={16} />
              <input 
                type="text" 
                placeholder="Search by campus or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-white/5 pl-12 pr-4 py-3 outline-none focus:border-secondary/30 transition-colors text-sm"
              />
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-on-surface/40">{filteredCampuses.length} Campuses Participating</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampuses.map((campus, idx) => (
            <motion.div 
              key={campus.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.02 }}
              className="bg-surface-container-low p-8 border border-white/5 hover:border-secondary/30 transition-all group"
            >
              <Building2 className="text-secondary/20 mb-6 group-hover:text-secondary transition-colors" size={32} />
              <h3 className="text-xl font-serif mb-4 group-hover:text-secondary transition-colors">{campus.name}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-2">Contacts</p>
                  <ul className="space-y-1">
                    {campus.contacts.map((contact, i) => (
                      <li key={i} className="text-sm text-on-surface/80">{contact}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                  <a href={`mailto:${campus.email}`} className="text-xs text-secondary hover:underline flex items-center gap-2">
                    <Mail size={12} /> {campus.email}
                  </a>
                  {campus.phone && (
                    <span className="text-xs text-on-surface/40 flex items-center gap-2">
                      <Phone size={12} /> {campus.phone}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mt-32 px-8 max-w-7xl mx-auto">
        <div className="bg-primary-container p-12 rounded-3xl border border-white/5 text-center">
          <h3 className="text-3xl font-serif italic mb-6 text-on-primary-container">Get Involved</h3>
          <p className="text-on-primary-container/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            If you want to support our efforts, get involved, or inquire about joining the consortium, please reach out to our leadership team.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-primary-container/40 mb-1">Director</p>
              <p className="text-sm font-bold text-on-primary-container">Dr. Allie Brashears</p>
              <a href="mailto:jbrashears@lagcc.cuny.edu" className="text-xs text-secondary hover:underline">jbrashears@lagcc.cuny.edu</a>
            </div>
            <div className="w-px h-12 bg-on-primary-container/10 hidden md:block"></div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-primary-container/40 mb-1">Associate Director</p>
              <p className="text-sm font-bold text-on-primary-container">JC Carlson</p>
              <a href="mailto:JC.Carlson@qc.cuny.edu" className="text-xs text-secondary hover:underline">JC.Carlson@qc.cuny.edu</a>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const DonateScreen = () => {
  const [amount, setAmount] = useState<string>("125");
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [isDedicationOpen, setIsDedicationOpen] = useState(false);

  const presets = ["25", "100", "200", "400"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: The History */}
          <div className="space-y-12">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden grayscale brightness-75 group border border-white/5">
              <img 
                src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776186231/AERIAL_VIEW_OF_BOTH_LIBERTY_ISLAND_AND_LOWER_MANHATTAN_sidbnx.webp" 
                alt="Historical NYC" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <img 
                   src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776800019/CUNY_Logo_a9ommn.png" 
                   alt="Logo"
                   className="h-12 invert brightness-0"
                   referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="max-w-xl">
              <h1 className="font-display text-5xl md:text-7xl mb-8 text-on-surface">
                Support the <span className="italic text-secondary">LaGuardia and Wagner</span> Archives
              </h1>
              <p className="text-xl text-on-surface/70 font-light leading-relaxed mb-8">
                Your gift to the LaGuardia Community College Foundation supports the LaGuardia and Wagner Archives in preserving and providing access to millions of digitized documents and photographs that document the social and political history of New York City.
              </p>
              <p className="text-2xl font-display italic text-secondary/80">
                We thank you for your support!
              </p>
            </div>
          </div>

          {/* Right Side: The Ledger */}
          <div className="bg-surface-container-low p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Grain texture overlay for that archival feel */}
            <div className="absolute inset-0 grain-overlay opacity-5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-12">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4 border border-secondary/20 shadow-inner">
                  <Lock size={24} />
                </div>
                <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-on-surface/40">Secure Contribution</h2>
              </div>

              {/* Frequency Toggle */}
              <div className="flex justify-center mb-12">
                <div className="bg-background/50 p-1.5 rounded-full border border-white/5 flex gap-2">
                  <button 
                    onClick={() => setFrequency('one-time')}
                    className={cn(
                      "px-8 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                      frequency === 'one-time' ? "bg-secondary text-on-secondary shadow-lg" : "text-on-surface/40 hover:text-on-surface"
                    )}
                  >
                    One-time
                  </button>
                  <button 
                    onClick={() => setFrequency('monthly')}
                    className={cn(
                      "px-8 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2",
                      frequency === 'monthly' ? "bg-secondary text-on-secondary shadow-lg" : "text-on-surface/40 hover:text-on-surface"
                    )}
                  >
                    <Heart size={10} className={frequency === 'monthly' ? "fill-on-secondary" : ""} /> Monthly
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {presets.map(p => (
                  <button 
                    key={p}
                    onClick={() => setAmount(p)}
                    className={cn(
                      "py-4 rounded-2xl border text-sm font-bold transition-all",
                      amount === p 
                        ? "bg-secondary border-secondary text-on-secondary shadow-[0_0_20px_rgba(247,189,72,0.3)]" 
                        : "border-white/5 bg-background/30 text-on-surface/40 hover:border-secondary/30 hover:text-on-surface"
                    )}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative mb-12 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-display text-secondary/40 group-focus-within:text-secondary transition-colors">$</div>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-16 py-6 text-3xl font-display focus:border-secondary outline-none transition-all text-on-surface"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest font-bold text-on-surface/20">USD</div>
              </div>

              {/* Impact Indicator */}
              <div className="mb-12 text-center py-4 bg-secondary/5 rounded-xl border border-secondary/10">
                <p className="text-[11px] text-secondary/70 italic font-medium">
                  {amount === "25" && "This gift supports a student researcher for one day."}
                  {amount === "100" && "This gift funds the digitization of 50 historical negatives."}
                  {amount === "200" && "This gift preserves a mayoral diary collection."}
                  {amount === "400" && "This gift sponsors a public historical lecture."}
                  {(!presets.includes(amount) && amount !== "") && `Helping protect NYC's history with a dedicated ${frequency} gift.`}
                </p>
              </div>

              {/* Additional Options */}
              <div className="space-y-4 mb-12 border-t border-white/5 pt-8">
                <button 
                  onClick={() => setIsDedicationOpen(!isDedicationOpen)}
                  className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 hover:text-secondary transition-colors block underline underline-offset-4 decoration-white/10"
                >
                  Dedicate to someone special
                </button>
                <AnimatePresence>
                  {isDedicationOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea 
                        placeholder="Who is this gift in honor of?"
                        className="w-full bg-background/30 border border-white/5 rounded-xl p-4 text-sm mt-2 outline-none focus:border-secondary/30 transition-all min-h-[100px]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 hover:text-secondary transition-colors block underline underline-offset-4 decoration-white/10">
                  Add comments or instructions
                </button>
              </div>

              {/* Action Button */}
              <button 
                className="w-full bg-secondary text-on-secondary py-5 rounded-2xl text-xs uppercase tracking-[0.3em] font-bold shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
              >
                Donate {frequency === 'one-time' ? 'Once' : 'Monthly'} 
                <div className="w-6 h-px bg-on-secondary/30 group-hover:w-10 transition-all"></div>
                ${amount || "0"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ContactScreen = () => {
  const [activeDept, setActiveDept] = useState("All");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const staff = [
    { name: "Jennifer Jensen", title: "Director", phone: "(718) 482-5065", bio: "Biography", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113258/Jennifer_Jensen_wlpukw.jpg", dept: "Leadership" },
    { name: "Richard K. Lieberman", title: "Director", phone: "(718) 482-5065", bio: "", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113260/RKL_dmbxlj.jpg", dept: "Leadership" },
    { name: "Soraya Ciego-Lemur", title: "Deputy Director", phone: "(718) 482-5063", bio: "Contact me with questions relating to the archives", image: "https://picsum.photos/seed/soraya/400/500?grayscale", dept: "Leadership" },
    { name: "Douglas Di Carlo", title: "Archivist", phone: "(718) 482-6068", bio: "I provide assistance to Researchers Requests originating from outside LaGuardia Community College.", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113264/Douglas_Di_Carlo_o355gq.jpg", dept: "Archivists" },
    { name: "Molly Rosner", title: "Director of Education Programs", phone: "(718) 482-5065", bio: "Contact me with questions pertaining for group tours and LaGuardia student research assignments", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113259/Molly_Rosner_f7vlkg.jpg", dept: "Education" },
    { name: "Stephen Petrus", title: "Director of Public History Programs", phone: "(718) 482-5065", bio: "Contact me with questions pertaining for group tours and LaGuardia student research assignments", image: "https://picsum.photos/seed/stephen/400/500?grayscale", dept: "Public Programs" },
    { name: "Jacqueline Brashears", title: "Director LGBTQ+ Programs", phone: "(718) 482-5065", bio: "Contact me with questions about the CUNY LGBTQ Consortium.", image: "https://picsum.photos/seed/jacqueline/400/500?grayscale", dept: "Special Programs" },
    { name: "Gretchen Aguiar", title: "Education Programs Assistant", phone: "(718) 482-5065", bio: "Contact me with questions pertaining for group tours and LaGuardia student research assignments", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113266/Gretchen_Aguiar_we2bji.jpg", dept: "Education" },
    { name: "Oleg Kleban", title: "Information Systems Associate", phone: "(718) 482-5065", bio: "Contact me with any questions relating to website.", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113267/Oleg_Kleban_dovtwu.jpg", dept: "Operations/IT" },
    { name: "Tara Jean Hickman", title: "Educational Associate/Adjunct Professor", phone: "(718) 482-5065", bio: "Contact me for group tours and LaGuardia student research assignments.", image: "https://picsum.photos/seed/tara/400/500?grayscale", dept: "Education" },
    { name: "Brandon Calva", title: "Videographer/Assistant Digital Archivist", phone: "(718) 482-5065", bio: "Filming and editing for the archives projects and events", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113262/Brandon_Calva_ewfutm.jpg", dept: "Operations/IT" },
    { name: "Riley Owens", title: "Graphic Designer", phone: "(718) 482-5065", bio: "Contact Riley with questions about the content on the CUNY LGBTQ Consortium webpage.", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113266/Riley_Owens_rggmej.jpg", dept: "Operations/IT" },
    { name: "Andrew Tripp", title: "Archivist/Library Coordinator", phone: "(718) 482-5065", bio: "Contact Andrew with questions about The Council of the City of New York Collection.", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113261/Andrew_Tripp_ollozo.jpg", dept: "Archivists" },
    { name: "Molly Jacobson", title: "Processing Project Archivist", phone: "(718) 482-5065", bio: "Contact Molly with questions about the Edith Asbury Collection", image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776113263/Molly_Jacobson_qam1s3.jpg", dept: "Archivists" },
    { name: "Aliza Hornblass", title: "Assistant Archivist", phone: "(718) 482-5065", bio: "Contact Aliza with questions about the LGBTQ Collection.", image: "https://picsum.photos/seed/aliza/400/500?grayscale", dept: "Archivists" },
    { name: "Nathaly Pozo", title: "Archives' Bookkeeper", phone: "(718) 482-5065", bio: "Contact Nathaly with questions about the Archives' Accounting", image: "https://picsum.photos/seed/nathaly/400/500?grayscale", dept: "Operations/IT" },
  ];

  const depts = ["All", "Leadership", "Archivists", "Education", "Public Programs", "Special Programs", "Operations/IT"];

  const filteredStaff = activeDept === "All" ? staff : staff.filter(s => s.dept === activeDept);

  const faqs = [
    { q: "Do I need an appointment to visit?", a: "Yes, research is by appointment only. Please use our appointment request form or contact an archivist directly to schedule your visit at least 48 hours in advance." },
    { q: "Can I bring my own scanner or camera?", a: "Researchers are permitted to use their own digital cameras for reference photography, subject to staff approval and copyright restrictions. Flatbed scanners and handheld 'wand' scanners are not permitted." },
    { q: "How do I request a high-resolution reproduction?", a: "High-resolution digital reproductions can be requested for a fee. Please contact our Media & Reproductions department via the contact form with the specific document or photo ID." },
    { q: "Is there a fee for research services?", a: "Basic research assistance is provided free of charge. Extensive research requests or reproduction services may incur fees. Please consult our fee schedule for details." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      {/* Header */}
      <header className="px-8 max-w-7xl mx-auto mb-16">
        <span className="text-secondary text-xs uppercase tracking-[0.3em] font-medium mb-4 block">Get in Touch</span>
        <h1 className="text-5xl md:text-6xl font-serif italic mb-6 text-on-surface">Contact the Archives</h1>
        <p className="text-lg text-on-surface/60 font-light max-w-2xl leading-relaxed">
          Whether you are a researcher, student, or community member, we are here to assist you in exploring the history of New York City.
        </p>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary text-on-primary px-8 py-4 text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all"
          >
            Request an Appointment
          </button>
          <button 
            onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-white/10 px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-all"
          >
            View FAQs
          </button>
        </div>
      </header>

      {/* Logistics Bento Grid */}
      <section className="px-8 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map Tile */}
          <div className="md:col-span-2 bg-surface-container-low rounded-2xl overflow-hidden border border-white/5 group relative h-[400px]">
            <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
              <div className="text-center p-8">
                <MapIcon size={48} className="text-secondary/40 mx-auto mb-4" />
                <p className="text-sm text-on-surface/60 italic mb-6">Interactive Map Placeholder</p>
                <div className="bg-background/80 backdrop-blur p-4 rounded-lg border border-white/10 text-left max-w-sm">
                  <h4 className="font-serif text-lg mb-2">Visiting the Archives</h4>
                  <p className="text-xs text-on-surface/70 leading-relaxed">
                    We are located a five-minute walk from the 33rd Street station on the #7 line, which can be reached from Times Square and Grand Central.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6">
              <button className="bg-primary text-on-primary px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform">
                Open in Google Maps <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Hours & Info Tile */}
          <div className="space-y-6">
            <div className="bg-surface-container-high p-8 rounded-2xl border border-white/5">
              <h3 className="flex items-center gap-3 text-secondary uppercase tracking-widest text-xs font-bold mb-6">
                <Clock size={16} /> Research Hours
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                  <span className="text-sm text-on-surface/60 font-light">Mon – Fri</span>
                  <span className="text-sm font-medium">9:30 AM – 4:30 PM</span>
                </div>
                <p className="text-xs text-on-surface/40 italic leading-relaxed pt-2">
                  Closed most major holidays. Research is by appointment only. Please call or email to schedule.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
              <h3 className="flex items-center gap-3 text-secondary uppercase tracking-widest text-xs font-bold mb-6">
                <MapPin size={16} /> Mailing Address
              </h3>
              <address className="not-italic text-sm text-on-surface/80 space-y-1 font-light">
                <p className="font-medium text-on-surface">Fiorello H. LaGuardia Community College/CUNY</p>
                <p>29-10 Thomson Avenue, Room C-768</p>
                <p>Long Island City, NY 11101</p>
              </address>
              <div className="mt-6 flex gap-4">
                <a href="#" className="text-on-surface/40 hover:text-secondary transition-colors"><Facebook size={18} /></a>
                <a href="#" className="text-on-surface/40 hover:text-secondary transition-colors"><Twitter size={18} /></a>
                <a href="#" className="text-on-surface/40 hover:text-secondary transition-colors"><Instagram size={18} /></a>
                <a href="#" className="text-on-surface/40 hover:text-secondary transition-colors"><Youtube size={18} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      <section className="px-8 max-w-7xl mx-auto mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-serif italic mb-4">Staff Directory</h2>
            <div className="flex flex-wrap gap-2">
              {depts.map(dept => (
                <button 
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border transition-all",
                    activeDept === dept ? "bg-secondary text-on-secondary border-secondary" : "border-white/10 text-on-surface/40 hover:border-secondary/30"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-on-surface/40">{filteredStaff.length} Members</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredStaff.map((person, i) => (
            <motion.div 
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="aspect-[4/5] bg-surface-container-low mb-6 overflow-hidden relative">
                <img 
                  src={person.image} 
                  alt={person.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif group-hover:text-secondary transition-colors">{person.name}</h3>
                <p className="text-xs uppercase tracking-widest text-secondary font-bold">{person.title}</p>
                <div className="pt-2 flex items-center gap-2 text-on-surface/40 text-sm">
                  <Phone size={12} />
                  <span>{person.phone}</span>
                </div>
                {person.bio && (
                  <p className="text-xs text-on-surface/60 font-light leading-relaxed pt-2 line-clamp-3 italic">
                    "{person.bio}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Contact Form */}
        <div id="contact-form" className="scroll-mt-32">
          <h2 className="text-4xl font-serif italic mb-8">Inquiry & Appointment Request</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Full Name</label>
                <input type="text" className="w-full bg-surface-container-low border border-white/5 p-4 outline-none focus:border-secondary/30 transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Email Address</label>
                <input type="email" className="w-full bg-surface-container-low border border-white/5 p-4 outline-none focus:border-secondary/30 transition-colors" placeholder="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Affiliation</label>
                <input type="text" className="w-full bg-surface-container-low border border-white/5 p-4 outline-none focus:border-secondary/30 transition-colors" placeholder="e.g. CUNY Student, Independent Researcher" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Preferred Research Date</label>
                <input type="date" className="w-full bg-surface-container-low border border-white/5 p-4 outline-none focus:border-secondary/30 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Research Topic / Inquiry</label>
              <textarea rows={4} className="w-full bg-surface-container-low border border-white/5 p-4 outline-none focus:border-secondary/30 transition-colors resize-none" placeholder="Please describe your research interests or specific documents you wish to view..."></textarea>
            </div>
            <button className="w-full bg-secondary text-on-secondary py-4 text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all">
              Submit Request
            </button>
          </form>
        </div>

        {/* FAQ Accordion */}
        <div id="faq-section" className="scroll-mt-32">
          <h2 className="text-4xl font-serif italic mb-8">Before You Visit</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-white/5">
                <button 
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-serif group-hover:text-secondary transition-colors">{faq.q}</span>
                  <ChevronDown size={20} className={cn("text-on-surface/20 transition-transform duration-300", expandedFaq === idx && "rotate-180 text-secondary")} />
                </button>
                <AnimatePresence>
                  {expandedFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-on-surface/60 leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Inquiries */}
      <section className="mt-32 px-8 max-w-7xl mx-auto">
        <div className="bg-surface-container-high p-12 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h3 className="text-3xl font-serif italic mb-4">General Inquiries</h3>
            <p className="text-on-surface/60 font-light leading-relaxed">
              For general questions about the collections or the archives, please reach out to our general inquiry line.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <a href="mailto:laguardiaarchives@lagcc.cuny.edu" className="text-2xl font-serif text-secondary hover:underline underline-offset-8">
              laguardiaarchives@lagcc.cuny.edu
            </a>
            <div className="flex items-center gap-3 text-on-surface/40">
              <Phone size={16} />
              <span className="text-lg">(718) 482-5065</span>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const MediaScreen = () => {
  const [reproType, setReproType] = useState<'photos' | 'aural' | null>(null);

  const FormField = ({ label, children, required = false }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 flex items-center gap-2">
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-24 px-8 max-w-7xl mx-auto"
    >
      <header className="mb-16 border-b border-white/5 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-secondary text-xs uppercase tracking-[0.4em] font-bold block mb-4">Rights & Reproductions</span>
          <h1 className="text-5xl font-serif italic mb-6">Media Inquiries</h1>
          <p className="text-on-surface/50 font-light leading-relaxed italic">
            The Archives provides reproduction services for research and publication. Please select the primary medium of your request to begin the specification process.
          </p>
        </div>
        {reproType && (
          <button 
            onClick={() => setReproType(null)}
            className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            Back to Selection
          </button>
        )}
      </header>

      {!reproType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 h-[600px] border border-white/5 overflow-hidden">
          <div 
            onClick={() => setReproType('photos')}
            className="relative group cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/5"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000" 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 brightness-[0.3]"
                alt="Vintage Lens"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
              <Camera size={48} className="text-secondary mb-6 opacity-40 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-4xl font-serif italic mb-4 group-hover:text-secondary transition-colors">Visual Archives</h2>
              <p className="text-sm text-on-surface/50 font-light max-w-xs mb-8">
                High-resolution scans of over 100,000 historical photographs covering NYC across two centuries.
              </p>
              <div className="bg-white/5 border border-white/10 px-6 py-3 text-[10px] uppercase font-bold tracking-widest group-hover:bg-secondary group-hover:text-on-secondary-container transition-all">
                Order Photo Scans
              </div>
            </div>
            <div className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] font-bold text-white/20">01 / Still Imagery</div>
          </div>

          <div 
            onClick={() => setReproType('aural')}
            className="relative group cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000" 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 brightness-[0.3]"
                alt="Reel-to-Reel"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
              <Music size={48} className="text-secondary mb-6 opacity-40 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-4xl font-serif italic mb-4 group-hover:text-secondary transition-colors">Aural & Motion</h2>
              <p className="text-sm text-on-surface/50 font-light max-w-xs mb-8">
                Oral histories, mayoral broadcasts, and documentary footage from our aural/visual collection.
              </p>
              <div className="bg-white/5 border border-white/10 px-6 py-3 text-[10px] uppercase font-bold tracking-widest group-hover:bg-secondary group-hover:text-on-secondary-container transition-all">
                Order Media Extracts
              </div>
            </div>
            <div className="absolute bottom-6 right-6 text-[8px] uppercase tracking-[0.4em] font-bold text-white/20">02 / A/V Content</div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-16"
        >
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-8">
              <h3 className="text-xl font-serif italic border-b border-white/5 pb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Full Name" required>
                  <input type="text" className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors" placeholder="e.g. Jane Doe" />
                </FormField>
                <FormField label="Email Address" required>
                  <input type="email" className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors" placeholder="e.g. jane@university.edu" />
                </FormField>
                <FormField label="Institution / Organization">
                  <input type="text" className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors" placeholder="e.g. CUNY History Dept" />
                </FormField>
                <FormField label="Phone Number">
                  <input type="tel" className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors" placeholder="+1 (212) 555-0123" />
                </FormField>
              </div>
            </section>

            <section className="space-y-8">
              <h3 className="text-xl font-serif italic border-b border-white/5 pb-4">Production Details</h3>
              <div className="space-y-6">
                <FormField label="Item Description / ID" required>
                  <textarea rows={3} className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors" placeholder="Please provide the Collection name, Item Title, or Box/Folder number if known." />
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField label="Intended Use" required>
                    <select className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors appearance-none">
                      <option className="bg-background">Scholarly Research</option>
                      <option className="bg-background">Exhibition / Display</option>
                      <option className="bg-background">Commercial Publication</option>
                      <option className="bg-background">Broadcast Media</option>
                      <option className="bg-background">Other (See Notes)</option>
                    </select>
                  </FormField>

                  {reproType === 'photos' ? (
                    <FormField label="Format & Quality" required>
                      <select className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors appearance-none">
                        <option className="bg-background">Reference Scan (72dpi JPEG)</option>
                        <option className="bg-background">Pub Quality (300dpi TIFF)</option>
                        <option className="bg-background">Archival Quality (600dpi TIFF)</option>
                      </select>
                    </FormField>
                  ) : (
                    <FormField label="Media Delivery Format" required>
                      <select className="w-full bg-white/5 border border-white/10 p-3 text-sm focus:border-secondary outline-none transition-colors appearance-none">
                        <option className="bg-background">Digital Audio (WAV/MP3)</option>
                        <option className="bg-background">Video MP4 (H.264)</option>
                        <option className="bg-background">ProRes HQ (Production Ready)</option>
                      </select>
                    </FormField>
                  )}
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-white/5">
              <button className="bg-secondary text-on-secondary-container px-12 py-4 text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all flex items-center gap-4">
                Submit Order Request <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-surface-container-high p-10 rounded-2xl border border-white/10 relative overflow-hidden">
               <div className="relative z-10">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-6">Service Fees</h4>
                <ul className="space-y-6">
                  <li className="flex justify-between items-end gap-2 text-xs">
                    <span className="text-on-surface/50 font-light italic">Standard Research Scan</span>
                    <div className="flex-1 border-b border-dotted border-white/10 mb-1"></div>
                    <span className="font-mono text-secondary">$15.00</span>
                  </li>
                  <li className="flex justify-between items-end gap-2 text-xs">
                    <span className="text-on-surface/50 font-light italic">Publication Rights</span>
                    <div className="flex-1 border-b border-dotted border-white/10 mb-1"></div>
                    <span className="font-mono text-secondary">$50.00+</span>
                  </li>
                </ul>
               </div>
            </div>
          </aside>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Test Firestore Connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <div className="min-h-screen bg-background selection:bg-secondary/30">
      <div className="fixed inset-0 grain-overlay z-50 pointer-events-none"></div>
      
      <Navbar currentScreen={screen} setScreen={setScreen} user={user} login={login} logout={logout} />
      
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {screen === 'home' && <HomeScreen key="home" setScreen={setScreen} user={user} login={login} />}
          {screen === 'about' && <AboutScreen key="about" />}
          {screen === 'collections' && <CollectionsScreen key="collections" />}
          {screen === 'mayors' && <MayorsScreen key="mayors" />}
          {screen === 'projects' && <ProjectsScreen key="projects" />}
          {screen === 'search' && <SearchScreen key="search" />}
          {screen === 'contact' && <ContactScreen key="contact" />}
          {screen === 'lgbtq' && <LGBTQScreen key="lgbtq" />}
          {screen === 'media' && <MediaScreen key="media" />}
          {screen === 'donate' && <DonateScreen key="donate" />}
          {screen === 'calendars' && <CalendarsScreen key="calendars" />}
          {screen === 'education' && <EducationProgramsScreen key="education" />}
        </AnimatePresence>
      </main>

      <Footer setScreen={setScreen} />
    </div>
  );
}
