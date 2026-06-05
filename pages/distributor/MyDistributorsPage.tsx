import React, { useEffect, useState } from 'react';
import { apiService } from '../../network/apiService';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../constants';

interface SimpleDistributor {
  id: string;
  name: string;
  phone?: string;
  dmsId?: string;
  location?: {
    id: string;
    city?: string;
    state?: string;
  };
}

const MyDistributorsPage: React.FC = () => {
  const { user } = useAuth();
  const [distributors, setDistributors] = useState<SimpleDistributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDms = async () => {
      try {
        setLoading(true);
        const res = await apiService.dm.getMyDistributors();
        if (res.success && res.data) {
          setDistributors(res.data);
        } else {
          setError('Failed to load your distributors.');
        }
      } catch (err) {
        setError('An error occurred while fetching your distributors.');
      } finally {
        setLoading(false);
      }
    };
    fetchDms();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Distributors</h2>
        <p className="text-slate-500 text-sm mt-1">
          A list of all distributors assigned to your territory.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <svg className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading distributors...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        ) : distributors.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Icons.Team className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No Distributors Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">You do not have any distributors assigned to your territory yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Distributor Name</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">DMS ID</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Phone Number</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {distributors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                          {d.name.substring(0, 2)}
                        </div>
                        <div className="font-bold text-slate-800 text-sm">{d.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-800 font-mono">
                      {d.dmsId || <span className="text-slate-300 italic">N/A</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                      {d.phone || <span className="text-slate-300 italic">Not provided</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {d.location ? (
                        [d.location.city, d.location.state].filter(Boolean).join(', ') || <span className="text-slate-300 italic">Unknown</span>
                      ) : (
                        <span className="text-slate-300 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDistributorsPage;
