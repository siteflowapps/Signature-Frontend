import React from 'react';
import { useAuth } from '../context/AuthContext';
import HierarchyWidget from '../components/HierarchyWidget';

const TeamPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Team</h2>
        <p className="text-slate-400 text-sm mt-0.5">Organization structure and reporting lines</p>
      </div>

      <HierarchyWidget rootRole={user.role} userId={user.id} />
    </div>
  );
};

export default TeamPage;
