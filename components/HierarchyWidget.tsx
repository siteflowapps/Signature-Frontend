import React, { useEffect, useState, useMemo } from 'react';
import { UserRole, HierarchyRelation } from '../types';
import { apiService } from '../network/apiService';
import './HierarchyWidget.css';

// ─── TYPES & HELPERS ──────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; text: string; bg: string; dot: string; border: string; glow: string }> = {
  RSM: { label: 'RSM', text: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500', border: 'border-violet-200', glow: 'hover:ring-violet-200' },
  ASM: { label: 'ASM', text: 'text-sky-700',    bg: 'bg-sky-50',    dot: 'bg-sky-500',    border: 'border-sky-200',    glow: 'hover:ring-sky-200'    },
  ASE: { label: 'ASE', text: 'text-emerald-700',bg: 'bg-emerald-50',dot: 'bg-emerald-500',border: 'border-emerald-200',glow: 'hover:ring-emerald-200'},
  CSO: { label: 'CSO', text: 'text-lime-700',   bg: 'bg-lime-50',   dot: 'bg-lime-500',   border: 'border-lime-200',   glow: 'hover:ring-lime-200'   }
};

const getInitials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

interface TreeNode {
  userId: string;
  name: string;
  role: string;
  isSelf: boolean;
  children: TreeNode[];
}

const buildTree = (relations: HierarchyRelation[], rootUserId: string, rootUserRole: string): TreeNode[] => {
  // Edge case: if relations empty, we might just be someone with no team
  if (!relations.length) return [];

  // 1. Collect all users and parent-child links
  const nodeMap: Record<string, TreeNode> = {};

  // Find root node from relations (could be parent or child in the data)
  let rootName = 'Me';
  const rootRelation = relations.find(r => r.parentUserId === rootUserId) || relations.find(r => r.childUserId === rootUserId);
  if (rootRelation) {
    if (rootRelation.parentUserId === rootUserId) rootName = rootRelation.parentUserName;
    if (rootRelation.childUserId === rootUserId) rootName = rootRelation.childUserName;
  }

  // Create root node
  nodeMap[rootUserId] = { userId: rootUserId, name: rootName, role: rootUserRole, isSelf: true, children: [] };

  // Create all other nodes
  relations.forEach(r => {
    if (!nodeMap[r.parentUserId]) {
      nodeMap[r.parentUserId] = { userId: r.parentUserId, name: r.parentUserName, role: r.parentUserRole, isSelf: r.parentUserId === rootUserId, children: [] };
    }
    if (!nodeMap[r.childUserId]) {
      nodeMap[r.childUserId] = { userId: r.childUserId, name: r.childUserName, role: r.childUserRole, isSelf: r.childUserId === rootUserId, children: [] };
    }
  });

  // 2. Link children to parents
  relations.forEach(r => {
    const parent = nodeMap[r.parentUserId];
    const child = nodeMap[r.childUserId];
    if (parent && child && !parent.children.find(c => c.userId === child.userId)) {
      parent.children.push(child);
    }
  });

  return [nodeMap[rootUserId]];
};

// ─── NODE COMPONENT ──────────────────────────────────────────────────────────

const OrgNode: React.FC<{ node: TreeNode }> = ({ node }) => {
  const [expanded, setExpanded] = useState(true);
  const meta = ROLE_META[node.role] || { label: node.role, text: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-400', border: 'border-slate-200', glow: 'hover:ring-slate-200' };
  const hasChildren = node.children.length > 0;

  return (
    <li className="relative">
      <div className={`org-node inline-flex flex-col items-center group relative ${node.isSelf ? 'mb-2' : ''}`}>
        
        {/* The Card */}
        <div className={`
          relative bg-white rounded-2xl border ${node.isSelf ? 'border-slate-300 shadow-md ring-4 ring-slate-50' : 'border-slate-200 shadow-sm'}
          p-4 min-w-[170px] flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${meta.glow} hover:ring-2
        `}>
          {node.isSelf && (
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b from-${meta.dot.replace('bg-', '')}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
          )}

          {/* Avatar */}
          <div className={`
            ${node.isSelf ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'} 
            rounded-full flex items-center justify-center font-black mb-3 border-2 ${meta.border} ${meta.bg} ${meta.text}
            shadow-inner
          `}>
            {getInitials(node.name)}
          </div>

          {/* User Info */}
          <p className={`font-bold text-slate-900 truncate w-full text-center ${node.isSelf ? 'text-base' : 'text-sm'}`}>
            {node.name}
          </p>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${meta.text}`}>
              {meta.label}
            </span>
          </div>

          {/* Reports stat */}
          {hasChildren && (
            <div className="mt-3 py-1 px-3 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-medium text-slate-500 w-full text-center">
              {node.children.length} report{node.children.length !== 1 ? 's' : ''}
            </div>
          )}


          {/* Expand/Collapse Button (Bottom Center) */}
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all focus:outline-none z-20"
            >
              <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Children Tree */}
      {hasChildren && (
        <div className={`transition-all duration-300 origin-top ${expanded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
          <ul>
            {node.children.map(child => (
              <OrgNode key={child.userId} node={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

// ─── MAIN WIDGET ──────────────────────────────────────────────────────────────

interface HierarchyWidgetProps {
  rootRole: string;
  userId: string;
}

const HierarchyWidget: React.FC<HierarchyWidgetProps> = ({ rootRole, userId }) => {
  const [relations, setRelations] = useState<HierarchyRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.hierarchy.getMyHierarchy()
      .then(res => { 
        if (res.success) setRelations(res.data); 
        else setError('Could not load hierarchy'); 
      })
      .catch(() => setError('Hierarchy unavailable'))
      .finally(() => setLoading(false));
  }, []);

  const trees = useMemo(() => buildTree(relations, userId, rootRole), [relations, rootRole, userId]);

  // Composition stats
  const roleCounts: Record<string, number> = {};
  relations.forEach(r => {
    if (r.childUserId !== userId) {
      roleCounts[r.childUserRole] = (roleCounts[r.childUserRole] || 0) + 1;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-b from-slate-50/50 to-white">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Organization Structure</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Top-down reporting lines</p>
        </div>
        
        {/* Legend / Composition */}
        <div className="flex flex-wrap gap-2 items-center">
          {Object.entries(ROLE_META).slice(1).map(([role, m]) => {
             const count = roleCounts[role] || 0;
             if (count === 0 && !loading) return null;
             return (
              <div key={role} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${m.bg} ${m.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${m.text}`}>{m.label}</span>
                <span className={`text-[10px] font-black ${m.text} opacity-50 ml-0.5`}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-[#f8fafc]/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
             <div className="w-16 h-16 bg-slate-200 rounded-full mb-4" />
             <div className="w-32 h-4 bg-slate-200 rounded mb-8" />
             <div className="w-64 h-px bg-slate-200 mb-8" />
             <div className="flex gap-8">
               <div className="w-12 h-12 bg-slate-200 rounded-full" />
               <div className="w-12 h-12 bg-slate-200 rounded-full" />
               <div className="w-12 h-12 bg-slate-200 rounded-full" />
             </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <p className="text-sm font-bold text-slate-600">{error}</p>
          </div>
        ) : trees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
               <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
            <p className="text-sm font-bold text-slate-600">No team assigned yet</p>
            <p className="text-[11px] mt-1 text-slate-400">Org chart will appear when members report to you</p>
          </div>
        ) : (
          /* Scrollable Org Chart Canvas */
          <div className="org-scroll-wrapper w-full overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
               onMouseDown={(e) => {
                 const ele = e.currentTarget;
                 ele.dataset.isDown = 'true';
                 ele.dataset.startX = e.pageX - ele.offsetLeft + '';
                 ele.dataset.scrollLeft = ele.scrollLeft + '';
               }}
               onMouseLeave={(e) => e.currentTarget.dataset.isDown = 'false'}
               onMouseUp={(e) => e.currentTarget.dataset.isDown = 'false'}
               onMouseMove={(e) => {
                 const ele = e.currentTarget;
                 if (ele.dataset.isDown !== 'true') return;
                 e.preventDefault();
                 const x = e.pageX - ele.offsetLeft;
                 const walk = (x - parseInt(ele.dataset.startX || '0')) * 1.5;
                 ele.scrollLeft = parseInt(ele.dataset.scrollLeft || '0') - walk;
               }}
          >
            <div className="org-tree min-w-max px-8 pt-4 pb-8 flex justify-center">
              <ul className="!p-0 m-0">
                {trees.map(tree => <OrgNode key={tree.userId} node={tree} />)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyWidget;
