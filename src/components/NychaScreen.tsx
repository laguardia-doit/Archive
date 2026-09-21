import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  FileText, 
  ArrowRight, 
  Download, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Check, 
  Filter, 
  Layers, 
  BookOpen, 
  Clock, 
  Camera, 
  Film, 
  Users, 
  ShieldCheck, 
  Compass,
  FileCheck,
  ChevronRight,
  ChevronsRight,
  Play,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NychaScreenProps {
  setScreen: (screen: string) => void;
  setGlobalSearchTerm?: (term: string) => void;
}

export const NychaScreen: React.FC<NychaScreenProps> = ({ setScreen, setGlobalSearchTerm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFormat, setActiveFormat] = useState<string>("ALL");
  const [digitalOnly, setDigitalOnly] = useState<boolean>(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'highlights' | 'series' | 'blueprints' | 'researcher-note'>('highlights');

  const highlights = [
    {
      id: "hl-1",
      title: "First Houses: The Nation's Pioneer Public Housing (1935)",
      format: "Photos & Documents",
      formatType: "Photos",
      borough: "Manhattan",
      year: "1935",
      isDigital: true,
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&q=80&w=900",
      description: "Dedicated by First Lady Eleanor Roosevelt and Mayor Fiorello LaGuardia on the Lower East Side, First Houses marked the birth of municipal public housing in America.",
      details: "Constructed on Avenue A and East 3rd Street, this historic complex was formed by demolishing every third tenement building to introduce light, air, and courtyards to working-class families. Collection contains original dedication programs, tenant lottery ledgers, and architectural before/after surveys."
    },
    {
      id: "hl-2",
      title: "Queensbridge Houses Master Plan & Groundbreaking (1939)",
      format: "Architectural Drawings",
      formatType: "Blueprints",
      borough: "Queens",
      year: "1939",
      isDigital: true,
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776708049/the_past_present_and_future_jgmejr.png",
      description: "Complete architectural blueprints and site elevations for North America's largest public housing development, comprising 3,142 apartments across 26 Y-shaped buildings.",
      details: "Engineered under William Ballard and Allan Mackesey, the innovative Y-shaped layout maximized natural sunlight for all units. Records include original ink-on-linen elevations from the Oversized Map Case collection, landscape schematics, and community facility blueprints."
    },
    {
      id: "hl-3",
      title: "Living in the Shade: NYCHA Open Space Preservation",
      format: "Special Project & Maps",
      formatType: "Documents",
      borough: "Citywide",
      year: "1940–2020",
      isDigital: true,
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776775992/The-Council-of-the-City-of-New-York_v5gtmw.webp",
      description: "An archival study detailing the planning, historical ecology, and evolution of recreational open courtyards, playgrounds, and tree canopies across 335 developments.",
      details: "Focuses on the transition from the 'Tower-in-the-Park' philosophy to community-led urban agriculture and recreational spaces. Includes rare color photographs of children's play sculptures designed in collaboration with the Museum of Modern Art (MoMA)."
    },
    {
      id: "hl-4",
      title: "Post-War Ten-Year Rehousing Program (1948)",
      format: "Official Reports",
      formatType: "Documents",
      borough: "Citywide",
      year: "1948",
      isDigital: true,
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776186231/AERIAL_VIEW_OF_BOTH_LIBERTY_ISLAND_AND_LOWER_MANHATTAN_sidbnx.webp",
      description: "The pivotal municipal policy dossier outlining the construction of 40,000 new units to house returning World War II veterans and relocate families displaced by highway construction.",
      details: "Authored by Authority Chairman Thomas F. Farrell, this ledger outlines capital budget allocation, racial integration policy directives, state subsidy negotiations, and site selection across Brooklyn, Queens, and the Bronx."
    },
    {
      id: "hl-5",
      title: "Tenant Unionizing & Civil Rights Petitions (1950–1968)",
      format: "Oral History & Files",
      formatType: "Oral History",
      borough: "Brooklyn & Harlem",
      year: "1950–1968",
      isDigital: false,
      image: "https://res.cloudinary.com/dykuw1uvk/image/upload/v1776185492/Armed-Forces-Women_rdfk8v.webp",
      description: "Grassroots organizing documents, rent strike pamphlets, and recorded testimonies of tenant council leaders fighting against racial quotas and advocating for facility maintenance.",
      details: "Contains oral history transcripts from 42 tenant council leaders, letters sent to Mayor Robert F. Wagner demanding anti-discrimination oversight, and documentation leading to Fair Housing Act compliance in municipal developments."
    },
    {
      id: "hl-6",
      title: "Red Hook & Williamsburg Construction Surveys (1938–1940)",
      format: "Photographic Surveys",
      formatType: "Photos",
      borough: "Brooklyn",
      year: "1938",
      isDigital: true,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=900",
      description: "Over 8,000 medium-format negatives documenting waterfront clearance, excavation, structural steel erection, and the first wave of resident move-ins.",
      details: "Shot by Works Progress Administration (WPA) and Authority staff photographers. Provides an extraordinary visual record of pre-existing industrial docks, displaced wood-frame tenements, and the emergence of modern modernist brick architecture."
    }
  ];

  const seriesLedger = [
    {
      ref: "SERIES 01",
      name: "Board of Commissioners Minutes & Executive Orders",
      range: "1934 — 1995",
      volume: "68,400 Records",
      format: "Bound Transcripts & Digital PDFs",
      scope: "Official policy votes, contract approvals, resolutions, and executive correspondence of NYCHA chairpersons from Langdon Post to Laura D. Blackburne."
    },
    {
      ref: "SERIES 02",
      name: "Oversized Map Case: Blueprints & Architectural Drawings",
      range: "1935 — 1985",
      volume: "24,500 Sheets",
      format: "Linens, Mylar, Blueprints & CAD Scans",
      scope: "Site plans, utility schematics, floor plans, landscape architecture, and elevations for over 300 housing developments across the five boroughs."
    },
    {
      ref: "SERIES 03",
      name: "Public Information Office Photographic Repository",
      range: "1934 — 2005",
      volume: "185,000 Images",
      format: "Nitrate Negatives, Contact Sheets & Prints",
      scope: "Construction progression, dignitary visits (Eleanor Roosevelt, JFK, Martin Luther King Jr.), community centers, daycare centers, and tenant portraits."
    },
    {
      ref: "SERIES 04",
      name: "Tenant Applications, Selection & Demographic Statistics",
      range: "1935 — 1978",
      volume: "92,000 Dossiers",
      format: "Ledgers & Microfilm Rolls",
      scope: "Income thresholds, eligibility standards, veteran priorities, family size allocations, and statistical quarterly censuses of public housing occupants."
    },
    {
      ref: "SERIES 05",
      name: "Urban Renewal & Slum Clearance Project Files",
      range: "1945 — 1972",
      volume: "80,100 Folders",
      format: "Typescripts, Appraisal Maps & Surveys",
      scope: "Joint records with the Committee on Slum Clearance (Robert Moses), documenting property condemnation, tenant relocation, and Title I federal funding."
    }
  ];

  const formats = [
    { id: "ALL", label: "All Formats" },
    { id: "Photos", label: "Photographs" },
    { id: "Documents", label: "Documents" },
    { id: "Blueprints", label: "Map Case & Blueprints" },
    { id: "Oral History", label: "Oral Histories" }
  ];

  const filteredHighlights = useMemo(() => {
    return highlights.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.borough.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.includes(searchTerm);
      
      const matchesFormat = activeFormat === "ALL" || item.formatType === activeFormat;
      const matchesDigital = !digitalOnly || item.isDigital;

      return matchesSearch && matchesFormat && matchesDigital;
    });
  }, [searchTerm, activeFormat, digitalOnly]);

  const handleGlobalSearchTransfer = (query: string) => {
    if (setGlobalSearchTerm) {
      setGlobalSearchTerm(`NYCHA ${query}`);
    }
    setScreen('search');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 md:pt-48 pb-32 min-h-screen"
    >
      {/* Breadcrumb & Series Label */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8">
        <div className="border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-on-surface/50">
            <button onClick={() => setScreen('home')} className="hover:text-secondary transition-colors">Home</button>
            <span className="text-on-surface/30">/</span>
            <button onClick={() => setScreen('collections')} className="hover:text-secondary transition-colors">Collections</button>
            <span className="text-on-surface/30">/</span>
            <button onClick={() => setScreen('government')} className="hover:text-secondary transition-colors">Government & Policy</button>
            <span className="text-on-surface/30">/</span>
            <span className="text-secondary font-bold">The New York City Housing Authority (ColID: 02)</span>
          </div>
        </div>
      </div>

      {/* Hero Curatorial Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mb-20">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-surface-container-low shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://res.cloudinary.com/dykuw1uvk/image/upload/v1776708049/the_past_present_and_future_jgmejr.png" 
              alt="NYCHA Architecture and Open Space" 
              className="w-full h-full object-cover opacity-25 grayscale brightness-75 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/70 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 md:p-16 lg:p-20 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-mono uppercase tracking-[0.3em] font-bold rounded-full">
                Collection ID: 02
              </span>
              <span className="text-on-surface/40 text-[10px] font-mono uppercase tracking-widest">
                Est. February 20, 1934
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif italic text-on-surface tracking-tight leading-[1.08] mb-8">
              The New York City <br />
              <span className="text-secondary not-italic font-normal">Housing Authority</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface/80 font-light leading-relaxed mb-10 max-w-3xl border-l-2 border-secondary/40 pl-6 italic">
              Established in 1934 as the first agency of its kind in the United States, NYCHA transformed the physical and civic fabric of New York. The archive holds over 450,000 photographic records, policy documents, and architectural blueprints chronicling nine decades of public housing, urban renewal, and resident community life.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-on-surface/40 mb-1">Archival Holdings</p>
                <p className="text-2xl font-serif text-secondary font-bold">450K+ Records</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-on-surface/40 mb-1">Date Span</p>
                <p className="text-2xl font-serif text-on-surface">1934 — 2010</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-on-surface/40 mb-1">Developments</p>
                <p className="text-2xl font-serif text-on-surface">335 Sites</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-on-surface/40 mb-1">Oversized Maps</p>
                <p className="text-2xl font-serif text-secondary">24,500 Plans</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              <a 
                href="#search-collection"
                className="bg-secondary text-on-secondary-container px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-secondary/20"
              >
                <Search size={14} /> Search This Collection
              </a>
              <button 
                onClick={() => setScreen('contact')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold text-on-surface transition-all flex items-center gap-2"
              >
                <FileCheck size={14} className="text-secondary" /> Request Finding Aid
              </button>
              <button 
                onClick={() => setScreen('media')}
                className="bg-transparent hover:text-secondary text-on-surface/60 px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2"
              >
                <Download size={14} /> Reproduction Rights
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Archival Media Spotlight & Collection Overview (Incorporated Legacy Archive Element) */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mb-20" id="collection-info">
        <div className="bg-surface-container-low border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 relative z-10">
            
            {/* Left: Responsive Video Reel Player Frame */}
            <div id="divVideo" className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-secondary/30 via-amber-500/20 to-secondary/30 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl w-[290px] sm:w-[315px] h-[515px] sm:h-[560px]">
                  <iframe 
                    className="w-full h-full object-cover"
                    width="315" 
                    height="560" 
                    src="https://www.youtube.com/embed/n_JYamtd6Cc?si=rM3UGdB3B3pUJcNi" 
                    title="Archival Collection Documentary Reel"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-mono uppercase tracking-widest text-on-surface/50">
                <Film size={12} className="text-secondary" />
                <span>Archival Multimedia Reel • 9:16 Visual Survey</span>
              </div>
            </div>

            {/* Right: Curatorial Collection Overview dossier */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-mono uppercase tracking-[0.3em] font-bold rounded-full">
                  Archival Overview
                </span>
                <span className="text-on-surface/40 text-[10px] font-mono uppercase tracking-widest">
                  Series Finding Aid (RG-02)
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif italic text-on-surface leading-tight">
                Collection Overview & Archival Scope
              </h2>

              <div id="CollOverview" className="space-y-4 text-sm sm:text-base text-on-surface/75 font-light leading-relaxed">
                <p>
                  The New York City Housing Authority archival collection contains historical materials documenting municipal planning, social housing, and urban renewal across the five boroughs, consisting of hundreds of thousands of files organized across twelve primary record series.
                </p>
                <p>
                  Tracing its origins to 1934 under Mayor Fiorello H. LaGuardia and Chairman Langdon Post, the archive encompasses executive orders, commissioner voting ledgers, public relations photography, oversized linen architectural elevations, and tenant council records documenting nine decades of civic transformation.
                </p>
              </div>

              {/* Action Buttons matching legacy "Collection Overview" link with double arrow icon */}
              <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-white/10">
                <button 
                  onClick={() => setScreen('contact')}
                  className="bg-secondary text-on-secondary-container px-7 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-secondary/20"
                >
                  <ChevronsRight size={16} /> Collection Overview
                </button>
                <button 
                  onClick={() => setScreen('media')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-bold text-on-surface transition-all flex items-center gap-2"
                >
                  <FileText size={14} className="text-secondary" /> Request Finding Aid
                </button>
              </div>

              {/* Curatorial metadata quick reference */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-background/50 border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-on-surface/40 block mb-0.5">Media Types</span>
                  <span className="text-xs font-medium text-secondary">Film, Linens & Prints</span>
                </div>
                <div className="p-3.5 bg-background/50 border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-on-surface/40 block mb-0.5">Document Series</span>
                  <span className="text-xs font-medium text-on-surface">12 Record Series</span>
                </div>
                <div className="p-3.5 bg-background/50 border border-white/5 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-on-surface/40 block mb-0.5">Access Policy</span>
                  <span className="text-xs font-medium text-on-surface">Reading Room & Online</span>
                </div>
              </div>
            </div>

          </div>

          <hr className="my-8 border-white/10" />
        </div>
      </section>
      <section id="search-collection" className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
        <div className="bg-surface-container-high border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold text-secondary block mb-2">
                Curatorial Ledger Index
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-on-surface">
                Search within the NYCHA Archives
              </h2>
            </div>

            {/* Electronic Format Only Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group bg-background/50 border border-white/10 px-5 py-2.5 rounded-full hover:border-secondary/40 transition-colors">
              <input 
                type="checkbox" 
                checked={digitalOnly}
                onChange={(e) => setDigitalOnly(e.target.checked)}
                className="w-4 h-4 accent-[#f7bd48] rounded cursor-pointer"
              />
              <span className="text-xs text-on-surface/80 group-hover:text-secondary font-mono tracking-wide transition-colors">
                Available in Digital Format Only
              </span>
            </label>
          </div>

          {/* Search Input Box */}
          <div className="relative mb-6">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface/40" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, development (e.g. Queensbridge, First Houses, Red Hook), year, or keyword..."
              className="w-full bg-background border border-white/15 focus:border-secondary pl-14 pr-32 py-4 rounded-xl text-sm md:text-base text-on-surface placeholder:text-on-surface/30 outline-none transition-all focus:ring-1 focus:ring-secondary/30"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono uppercase text-on-surface/40 hover:text-secondary px-3 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Format Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-mono mr-2">
              Filter By Format:
            </span>
            {formats.map((fmt) => (
              <button 
                key={fmt.id}
                onClick={() => setActiveFormat(fmt.id)}
                className={cn(
                  "text-[10px] uppercase font-mono tracking-widest font-bold px-4 py-2 rounded-full border transition-all",
                  activeFormat === fmt.id
                    ? "bg-secondary text-on-secondary-container border-secondary shadow-md"
                    : "border-white/10 bg-white/5 text-on-surface/60 hover:text-on-surface hover:border-white/20"
                )}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Query Feedback */}
          <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-on-surface/40 font-mono pt-4 border-t border-white/5">
            <span>Showing {filteredHighlights.length} curated archival holdings</span>
            <button 
              onClick={() => handleGlobalSearchTransfer(searchTerm)}
              className="text-secondary hover:underline flex items-center gap-1.5 font-bold"
            >
              Search complete 450,000 database records in Advanced Search <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs (Highlights vs Series Ledger vs Map Case vs Researcher Note) */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mb-12">
        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('highlights')}
            className={cn(
              "text-xs uppercase font-mono tracking-[0.2em] font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2",
              activeTab === 'highlights' 
                ? "bg-secondary/15 text-secondary border border-secondary/30" 
                : "text-on-surface/50 hover:text-on-surface"
            )}
          >
            <Sparkles size={14} /> Collection Highlights
          </button>

          <button 
            onClick={() => setActiveTab('series')}
            className={cn(
              "text-xs uppercase font-mono tracking-[0.2em] font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2",
              activeTab === 'series' 
                ? "bg-secondary/15 text-secondary border border-secondary/30" 
                : "text-on-surface/50 hover:text-on-surface"
            )}
          >
            <Layers size={14} /> Record Series Finding Aid
          </button>

          <button 
            onClick={() => setActiveTab('blueprints')}
            className={cn(
              "text-xs uppercase font-mono tracking-[0.2em] font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2",
              activeTab === 'blueprints' 
                ? "bg-secondary/15 text-secondary border border-secondary/30" 
                : "text-on-surface/50 hover:text-on-surface"
            )}
          >
            <Compass size={14} /> Oversized Map Case & Blueprints
          </button>

          <button 
            onClick={() => setActiveTab('researcher-note')}
            className={cn(
              "text-xs uppercase font-mono tracking-[0.2em] font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2",
              activeTab === 'researcher-note' 
                ? "bg-secondary/15 text-secondary border border-secondary/30" 
                : "text-on-surface/50 hover:text-on-surface"
            )}
          >
            <Info size={14} /> Note to Researcher
          </button>
        </div>
      </section>

      {/* Tab 1: Collection Highlights Bento Grid */}
      {activeTab === 'highlights' && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHighlights.map((hl) => (
              <motion.div 
                key={hl.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-secondary/30 hover:bg-surface-container-high transition-all duration-300"
              >
                {/* Photo Header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img 
                    src={hl.image} 
                    alt={hl.title} 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-95 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-background/80 backdrop-blur-md border border-white/10 text-secondary text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
                      {hl.format}
                    </span>
                    {hl.isDigital && (
                      <span className="bg-secondary/20 backdrop-blur-md border border-secondary/40 text-secondary text-[8px] font-mono uppercase tracking-widest px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <Check size={10} /> Online
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded">
                    {hl.borough} • {hl.year}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif italic text-on-surface mb-3 group-hover:text-secondary transition-colors leading-snug">
                      {hl.title}
                    </h3>
                    <p className="text-xs text-on-surface/60 font-light leading-relaxed mb-6">
                      {hl.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedHighlight(hl)}
                      className="text-[10px] uppercase font-mono tracking-widest font-bold text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      Examine Dossier <ArrowRight size={12} />
                    </button>
                    <button 
                      onClick={() => handleGlobalSearchTransfer(hl.title)}
                      className="text-[9px] uppercase font-mono text-on-surface/30 hover:text-secondary transition-colors"
                      title="Search related records"
                    >
                      Search Series
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredHighlights.length === 0 && (
            <div className="text-center py-20 bg-surface-container-low border border-white/10 rounded-2xl p-8">
              <Building2 size={40} className="mx-auto text-on-surface/20 mb-4" />
              <h4 className="text-xl font-serif italic text-on-surface mb-2">No matching NYCHA records found</h4>
              <p className="text-sm text-on-surface/50 mb-6 font-light">
                Try clearing your search query or selecting "All Formats" to display the full inventory.
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setActiveFormat("ALL"); setDigitalOnly(false); }}
                className="bg-secondary text-on-secondary-container px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest font-bold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Finding Aid Series Ledger */}
      {activeTab === 'series' && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold text-secondary block mb-2">
                  Archival Classification System
                </span>
                <h3 className="text-2xl font-serif italic text-on-surface">Record Series Finding Aid (RG-02)</h3>
              </div>
              <button 
                onClick={() => setScreen('contact')}
                className="bg-secondary text-on-secondary-container px-6 py-2 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-2"
              >
                <Download size={12} /> Download Complete Guide (PDF)
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {seriesLedger.map((s, idx) => (
                <div key={idx} className="p-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-2">
                      <span className="text-secondary font-mono text-xs font-bold block mb-1">{s.ref}</span>
                      <span className="text-[10px] font-mono text-on-surface/40 uppercase tracking-widest">{s.range}</span>
                    </div>

                    <div className="md:col-span-7">
                      <h4 className="text-lg font-serif italic text-on-surface group-hover:text-secondary transition-colors mb-2">
                        {s.name}
                      </h4>
                      <p className="text-xs text-on-surface/60 font-light leading-relaxed mb-4">
                        {s.scope}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface/30">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{s.format}</span>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col md:items-end justify-between h-full gap-4">
                      <span className="text-xs font-mono font-bold text-secondary px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                        {s.volume}
                      </span>
                      <button 
                        onClick={() => handleGlobalSearchTransfer(s.name)}
                        className="text-[10px] uppercase font-mono tracking-widest text-on-surface/40 group-hover:text-secondary transition-colors flex items-center gap-1.5"
                      >
                        Search Series Items <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Oversized Map Case & Blueprints Special Feature */}
      {activeTab === 'blueprints' && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-high border border-white/10 rounded-3xl p-8 lg:p-12">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] uppercase font-mono tracking-[0.4em] font-bold text-secondary block">
                Special Collection Unit
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif italic text-on-surface leading-tight">
                The Oversized Map Case Repository
              </h3>
              <p className="text-sm text-on-surface/70 font-light leading-relaxed">
                As noted in the original archives repository, the NYCHA collection contains one of the most comprehensive architectural records of twentieth-century American public housing. The <strong>Oversized Map Case Collection</strong> houses tens of thousands of original architectural drawings, linen site elevations, mechanical floor schematics, and urban landscape blueprints spanning from 1934 through the 1980s.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-background/50 border border-white/5 rounded-xl">
                  <h5 className="font-serif text-secondary text-sm mb-1">Architectural Masterworks</h5>
                  <p className="text-xs text-on-surface/50 font-light">Drawings by prominent modernists including William Lescaze, Richmond Shreve, and Frederick Ackerman.</p>
                </div>
                <div className="p-4 bg-background/50 border border-white/5 rounded-xl">
                  <h5 className="font-serif text-secondary text-sm mb-1">Scale Elevation Linens</h5>
                  <p className="text-xs text-on-surface/50 font-light">Original hand-drawn ink site sections and cross-borough topographical land analyses.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button 
                  onClick={() => handleGlobalSearchTransfer("Map Case Architectural Drawings")}
                  className="bg-secondary text-on-secondary-container px-8 py-3.5 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Search size={14} /> Search Map Case Blueprints
                </button>
                <button 
                  onClick={() => setScreen('media')}
                  className="border border-white/10 hover:border-secondary/40 text-on-surface/80 px-8 py-3.5 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold transition-all"
                >
                  Request Architectural Scans
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=900" 
                  alt="Architectural Drawings and Blueprints" 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-mono text-secondary uppercase tracking-widest block mb-1">Drawer Reference: MAP-NYC-02</span>
                  <p className="text-xs font-serif italic text-white">Full-size Linen Elevation Drawings from First Houses & Queensbridge</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Note to Researcher (Preserving Legacy ASP.NET Logic & Transparency) */}
      {activeTab === 'researcher-note' && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="bg-surface-container-high border-l-4 border-secondary p-8 md:p-12 rounded-r-3xl border-t border-r border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Info size={24} className="text-secondary" />
              <h3 className="text-2xl font-serif italic text-on-surface">Official Note to Researchers</h3>
            </div>

            <div className="space-y-6 text-sm text-on-surface/75 font-light leading-relaxed max-w-4xl">
              <p>
                The <strong>New York City Housing Authority (NYCHA) Records</strong> at the LaGuardia and Wagner Archives represent one of the most heavily consulted municipal archives in the City University of New York (CUNY) library network. Researchers examining urban development, demographic shifts, public policy, and architectural history are advised to review the following access policies:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-secondary font-mono">1. On-Site Reading Room Access</h5>
                  <p className="text-xs text-on-surface/60 font-light leading-relaxed">
                    Physical documents, original photographs, and oversized map case linens are stored in secure environmental vaults at LaGuardia Community College (Long Island City, Queens). In-person access requires an advance appointment at least one week prior to research.
                  </p>
                </div>

                <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-secondary font-mono">2. Microfilm & Digital Duplication</h5>
                  <p className="text-xs text-on-surface/60 font-light leading-relaxed">
                    A significant portion of early tenant records and Board of Commissioners minutes are available on 35mm microfilm. High-resolution 300dpi/600dpi scans of photographs and architectural plans may be requested through our Media Reproductions department.
                  </p>
                </div>
              </div>

              <p className="italic text-xs text-on-surface/50 pt-2">
                * Note on Privacy & Restricted Records: In accordance with federal and state regulations, tenant dossiers containing sensitive personal identification numbers or confidential medical assistance files are redacted or subject to restricted archival appraisal guidelines.
              </p>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setScreen('contact')}
                  className="bg-secondary text-on-secondary-container px-8 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-bold hover:brightness-110 transition-all"
                >
                  Schedule Research Visit
                </button>
                <button 
                  onClick={() => setScreen('faq')}
                  className="border border-white/10 px-8 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-bold hover:bg-white/5 text-on-surface/70 transition-all"
                >
                  Reading Room Regulations
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sibling Collections Cross-Linking */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold text-secondary block mb-1">
              Cross-Institutional Exploration
            </span>
            <h3 className="text-2xl font-serif italic text-on-surface">Related Administrative Collections</h3>
          </div>
          <button 
            onClick={() => setScreen('collections')}
            className="text-xs font-mono uppercase tracking-widest text-secondary hover:underline flex items-center gap-1.5"
          >
            All 17 Collections <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              name: "Fiorello H. LaGuardia", 
              role: "Mayor 1934–1945", 
              desc: "Created NYCHA via executive leadership during the New Deal.", 
              route: "mayors" 
            },
            { 
              name: "Robert F. Wagner", 
              role: "Mayor 1954–1965", 
              desc: "Oversaw massive middle-income & public housing development.", 
              route: "mayors" 
            },
            { 
              name: "The City Council of NYC", 
              role: "Municipal Legislative Body", 
              desc: "Charter revisions, budget appropriations, and housing hearings.", 
              route: "government" 
            },
            { 
              name: "Real Estate Board of NY (REBNY)", 
              role: "Civic & Commercial Development", 
              desc: "Private developer interactions, zoning battles, and housing policy.", 
              route: "collections" 
            }
          ].map((col, i) => (
            <div 
              key={i}
              onClick={() => setScreen(col.route)}
              className="bg-surface-container-low hover:bg-surface-container-high border border-white/5 hover:border-secondary/30 p-6 rounded-2xl transition-all cursor-pointer group"
            >
              <span className="text-[9px] font-mono uppercase tracking-widest text-secondary block mb-1">{col.role}</span>
              <h4 className="text-lg font-serif italic text-on-surface group-hover:text-secondary transition-colors mb-2">{col.name}</h4>
              <p className="text-xs text-on-surface/50 font-light leading-relaxed mb-4">{col.desc}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-on-surface/40 group-hover:text-white transition-colors">
                Examine Series <ArrowRight size={10} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Highlight Modal Drawer */}
      <AnimatePresence>
        {selectedHighlight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-high border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="relative aspect-video">
                <img 
                  src={selectedHighlight.image} 
                  alt={selectedHighlight.title}
                  className="w-full h-full object-cover grayscale brightness-90"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedHighlight(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-sm hover:bg-secondary hover:text-black transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs font-mono text-secondary">
                  {selectedHighlight.format} • {selectedHighlight.borough} ({selectedHighlight.year})
                </div>
              </div>

              <div className="p-8 space-y-4">
                <span className="text-[9px] uppercase font-mono tracking-[0.3em] font-bold text-secondary">
                  Archival Highlight Record
                </span>
                <h3 className="text-2xl font-serif italic text-on-surface">{selectedHighlight.title}</h3>
                <p className="text-sm text-on-surface/70 leading-relaxed font-light">{selectedHighlight.details}</p>

                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center">
                  <button 
                    onClick={() => {
                      const term = selectedHighlight.title;
                      setSelectedHighlight(null);
                      handleGlobalSearchTransfer(term);
                    }}
                    className="bg-secondary text-on-secondary-container px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2"
                  >
                    Search Full Series Records <ArrowRight size={14} />
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedHighlight(null);
                      setScreen('media');
                    }}
                    className="text-xs font-mono uppercase tracking-widest text-on-surface/60 hover:text-secondary"
                  >
                    Request Reproduction Scan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
