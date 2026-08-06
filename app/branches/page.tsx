'use client';
import { useState, useEffect } from 'react';
import BranchMap from '@/components/BranchMap';
import { Landmark, MapPin, Phone, Clock, Search, Navigation, AlertCircle } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/branches', { cache: 'no-store', credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.error || `Server Error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch branches:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-[#8890a0]">
        <div className="w-10 h-10 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-600 animate-pulse">Initializing Branch Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-[#f05050]">
        <AlertCircle size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Network Connection Failed</h2>
        <p className="text-[#8890a0] max-w-md text-center mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-8">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-800 text-white">Branch Locator</h1>
          <p className="text-[14px] text-[#8890a0] mt-1">Find and visit our high-precision banking centers across India.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4455] z-10 pointer-events-none" />
          <input 
            className="input !pl-11" 
            placeholder="Search city or branch name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Branch List */}
        <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredBranches.length === 0 ? (
            <div className="text-center py-12 text-[#8890a0] card border-dashed">
              No branches found matching your search.
            </div>
          ) : (
            filteredBranches.map(branch => (
              <div 
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className={`card p-5 cursor-pointer transition-all border-2 ${
                  selectedBranch?.id === branch.id 
                    ? 'border-[#00d4aa] bg-[#00d4aa]/5' 
                    : 'border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedBranch?.id === branch.id ? 'bg-[#00d4aa] text-[#0a0c10]' : 'bg-[#1a1d24] text-[#8890a0]'
                  }`}>
                    <Landmark size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-700 text-[16px] text-white truncate">{branch.name}</h3>
                    <p className="text-[13px] text-[#8890a0] mt-1 flex items-center gap-1.5">
                      <MapPin size={12} /> {branch.address}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[11px] font-600 text-[#00d4aa] flex items-center gap-1">
                        <Clock size={11} /> 9-5 PM
                      </span>
                      <span className="text-[11px] font-600 text-[#8890a0] flex items-center gap-1">
                        <Phone size={11} /> +91 1800...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Branch Detail & Map */}
        <div className="lg:col-span-8 space-y-6">
          {selectedBranch ? (
            <>
              <div className="card p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4aa]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none transition-all group-hover:bg-[#00d4aa]/10" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-[11px] font-700 uppercase tracking-widest">
                      <Navigation size={12} /> Live Tracking Active
                    </div>
                    <h2 className="text-3xl font-display font-800 text-white">{selectedBranch.name}</h2>
                    <div className="space-y-2 text-[#8890a0]">
                      <p className="flex items-center gap-3 text-[15px]">
                        <MapPin size={18} className="text-[#00d4aa]" />
                        {selectedBranch.address}
                      </p>
                      <p className="flex items-center gap-3 text-[15px]">
                        <Phone size={18} className="text-[#00d4aa]" />
                        {selectedBranch.phone || '+91 1800-425-8888'}
                      </p>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="btn-primary px-8 flex items-center gap-2"
                      >
                        <Navigation size={16} />
                        Directions
                      </button>
                      <button 
                        onClick={() => {
                          window.location.href = `tel:${selectedBranch.phone || '18004258888'}`;
                        }}
                        className="btn-secondary px-8 flex items-center gap-2"
                      >
                        <Phone size={16} />
                        Contact
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3 flex flex-col gap-3">
                    <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                      <p className="text-[11px] text-[#8890a0] uppercase font-700 mb-1">Services</p>
                      <ul className="text-[13px] text-white space-y-1">
                        <li>• Wealth Mgmt</li>
                        <li>• Forex</li>
                      </ul>
                    </div>
                    <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                      <p className="text-[11px] text-[#8890a0] uppercase font-700 mb-1">Status</p>
                      <div className="flex items-center gap-2 text-[13px] text-[#00d4aa]">
                        <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                        Open Now
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[400px] card overflow-hidden p-0 relative border-[#00d4aa]/20">
                  <BranchMap 
                    lat={selectedBranch.latitude} 
                    lng={selectedBranch.longitude} 
                    address={selectedBranch.address}
                    name={selectedBranch.name}
                    phone={selectedBranch.phone}
                  />
              </div>
            </>
          ) : (
             <div className="h-full flex items-center justify-center card bg-[#0f1117]/50 border-dashed">
                <p className="text-[#3d4455] font-display font-600">Select a branch to view on map</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

